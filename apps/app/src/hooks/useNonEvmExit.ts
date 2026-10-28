"use client";

import { useCallback, useState } from "react";
import { Transaction as SolanaTransaction } from "@solana/web3.js";
import { TransactionBuilder, rpc as stellarRpc } from "@stellar/stellar-sdk";
import { useStellarWallet } from "@/lib/wallets/StellarWalletContext";
import { useSolanaWallet } from "@/lib/wallets/SolanaWalletContext";
import {
  buildAssetWithdrawal,
  buildLockedExit,
  confirmTransaction,
} from "@/lib/api/endpoints";
import { runtimeOf } from "@/lib/constants/networks";

export type ExitAction = "REDEEM" | "EARLY_EXIT" | "ROLL_OVER";

/**
 * Leaving a locked position on Stellar or Solana.
 *
 * Same split as the deposit: the backend builds the envelope, the wallet signs it, the
 * reference goes back so the next read is current. Kept apart from `usePoolExit` for the
 * same reason `useNonEvmDeposit` is kept apart from `useDeposit` — that hook is built
 * around wagmi's `writeContract` and receipt tracking, neither of which applies here.
 *
 * An exit is money leaving a pool, so this reports a failure rather than swallowing it,
 * and only reports success once the network has confirmed.
 */
export function useNonEvmExit(pool?: {
  networkId?: string | null;
  poolAddress?: string;
  poolType?: string;
}) {
  const runtime = runtimeOf(pool?.networkId ?? undefined);
  /**
   * Whether this pool exits by amount rather than by position.
   *
   * A term deal and a managed yield pool have a share balance, not numbered positions,
   * so there is nothing for `/locked-positions/:id/exit` to resolve.
   */
  const isAssetPool = pool?.poolType === "SINGLE_ASSET" || pool?.poolType === "STABLE_YIELD";
  const stellar = useStellarWallet();
  const solana = useSolanaWallet();

  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [reference, setReference] = useState<string | undefined>();

  const signer =
    runtime === "stellar" ? stellar.address : runtime === "solana" ? solana.address : undefined;

  const exit = useCallback(
    async (
      positionId: string | number,
      action: ExitAction,
      next?: { tierIndex: number; interestPayment?: "UPFRONT" | "AT_MATURITY" },
    ) => {
      if (!pool?.networkId) throw new Error("No pool selected.");
      if (!runtime || runtime === "evm") {
        throw new Error("This pool is on an EVM chain; use the EVM exit flow.");
      }
      if (!signer) {
        throw new Error(
          runtime === "stellar"
            ? "Connect your Freighter wallet to withdraw from this position."
            : "Connect a Solana wallet to withdraw from this position.",
        );
      }

      setIsExiting(true);
      setError(undefined);
      try {
        // A locked pool exits a numbered position; a term deal or managed yield pool
        // exits an amount of its share balance. Different endpoints, because there is no
        // position to name on the latter two.
        const built = isAssetPool
          ? await buildAssetWithdrawal({
              poolAddress: pool.poolAddress!,
              networkId: pool.networkId!,
              // For a managed yield pool this is shares, not assets: the price moves
              // between the request and the settlement, so the pool cannot promise an
              // asset figure. The caller passes whichever the pool denominates in.
              amount: String(positionId),
              receiver: signer,
            })
          : await buildLockedExit({
              position: positionId,
              action,
              owner: signer,
              poolAddress: pool.poolAddress,
              tierIndex: next?.tierIndex,
              interestPayment: next?.interestPayment,
            });
        const tx = built.transaction;

        let ref: string;
        if (tx.runtime === "stellar") {
          if (tx.validUntilTime && tx.validUntilTime * 1000 < Date.now()) {
            throw new Error("This quote expired before it was signed. Try again.");
          }
          const signedXdr = await stellar.signXdr(tx.xdr, tx.networkPassphrase);
          const server = new stellarRpc.Server(
            tx.rpcUrl ?? "https://soroban-testnet.stellar.org",
          );
          const sent = await server.sendTransaction(
            TransactionBuilder.fromXDR(signedXdr, tx.networkPassphrase),
          );
          if (sent.status === "ERROR") {
            throw new Error(`The network rejected the withdrawal: ${JSON.stringify(sent.errorResult)}`);
          }
          // 2.5s, matching the deposit: Stellar closes a ledger about every five seconds,
          // so polling faster spends calls to learn nothing.
          let result = await server.getTransaction(sent.hash);
          for (let i = 0; i < 24 && result.status === "NOT_FOUND"; i++) {
            await new Promise((r) => setTimeout(r, 2500));
            result = await server.getTransaction(sent.hash);
          }
          if (result.status !== "SUCCESS") {
            throw new Error(`The withdrawal did not complete: ${result.status}`);
          }
          ref = sent.hash;
        } else if (tx.runtime === "solana") {
          ref = await solana.signAndSend(
            SolanaTransaction.from(Buffer.from(tx.transaction, "base64")),
            tx.blockhash,
            tx.lastValidBlockHeight,
          );
        } else {
          throw new Error(`Withdrawals are not supported on ${(tx as { runtime: string }).runtime}.`);
        }

        // Hand the reference over so the pool's cached views are dropped before the next
        // read. Best-effort: the money has already moved, and the sweep catches up within
        // the minute regardless, so a failure here must not read as a failed withdrawal.
        await confirmTransaction(ref, undefined, pool.networkId, pool.poolAddress, {
          // ROLL_OVER is not a withdrawal: nothing leaves the pool, the position is
          // replaced. Recorded under its own type so the activity list does not read as
          // money going out when it did not.
          // The ledger's own enum names, which differ from the action names: redeeming a
          // position records POSITION_REDEEMED, not REDEEM. Sending the action straight
          // through was rejected by the database, so the row never appeared.
          type:
            action === "REDEEM"
              ? "POSITION_REDEEMED"
              : action === "EARLY_EXIT"
                ? "EARLY_EXIT"
                : "ROLLOVER",
          // The payout is decided by the contract, so it is left to the chain sweep to
          // fill in on the position. Zero here means "not known at report time" rather
          // than "nothing was paid".
          amount: "0",
          from: signer,
        }).catch(() => undefined);

        setReference(ref);
        return ref;
      } catch (e) {
        const message = e instanceof Error ? e.message : "The withdrawal could not be completed.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsExiting(false);
      }
    },
    [pool?.networkId, pool?.poolAddress, runtime, signer, stellar, solana],
  );

  return { exit, isExiting, error, reference, signer };
}
