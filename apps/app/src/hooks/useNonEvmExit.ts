"use client";

import { useCallback, useState } from "react";
import { Transaction as SolanaTransaction } from "@solana/web3.js";
import { useStellarWallet } from "@/lib/wallets/StellarWalletContext";
import { signAndSubmitStellar } from "@/lib/wallets/submitStellar";
import { useSolanaWallet } from "@/lib/wallets/SolanaWalletContext";
import {
  buildCouponClaim,
  buildLockedExit,
  buildNonEvmWithdrawal,
  confirmTransaction,
} from "@/lib/api/endpoints";
import type { UnsignedTransaction } from "@/lib/api/types";
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
export function useNonEvmExit(pool?: { networkId?: string | null; poolAddress?: string }) {
  const runtime = runtimeOf(pool?.networkId ?? undefined);
  const stellar = useStellarWallet();
  const solana = useSolanaWallet();

  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [reference, setReference] = useState<string | undefined>();
  // Set once a transaction has landed, so a panel can close on it. wagmi's receipt tracking,
  // which the EVM path closes on, never resolves for a Stellar or Solana reference.
  const [succeeded, setSucceeded] = useState(false);

  const signer =
    runtime === "stellar" ? stellar.address : runtime === "solana" ? solana.address : undefined;

  /** Sign and submit with whichever wallet the envelope's runtime needs. */
  const submit = useCallback(
    async (tx: UnsignedTransaction, what: string): Promise<string> => {
      if (tx.runtime === "stellar") return signAndSubmitStellar(stellar, tx, what);
      if (tx.runtime === "solana") {
        return solana.signAndSend(
          SolanaTransaction.from(Buffer.from(tx.transaction, "base64")),
          tx.blockhash,
          tx.lastValidBlockHeight,
        );
      }
      throw new Error(`This is not supported on ${(tx as { runtime: string }).runtime}.`);
    },
    [stellar, solana],
  );

  /**
   * Run one share-pool action: build it, sign it, submit it, report it. The ledger row comes
   * from the transaction's own events on the backend, so nothing is claimed about it here.
   */
  const run = useCallback(
    async (what: string, build: (owner: string) => Promise<{ transaction: UnsignedTransaction }>) => {
      if (!pool?.networkId || !pool.poolAddress) throw new Error("No pool selected.");
      if (!signer) {
        throw new Error(
          runtime === "stellar"
            ? `Connect your Freighter wallet for the ${what}.`
            : `Connect a Solana wallet for the ${what}.`,
        );
      }
      setIsExiting(true);
      setError(undefined);
      setSucceeded(false);
      try {
        const built = await build(signer);
        const ref = await submit(built.transaction, what);
        await confirmTransaction(ref, undefined, pool.networkId, pool.poolAddress).catch(() => undefined);
        setReference(ref);
        setSucceeded(true);
        return ref;
      } catch (e) {
        const message = e instanceof Error ? e.message : `The ${what} could not be completed.`;
        setError(message);
        throw new Error(message);
      } finally {
        setIsExiting(false);
      }
    },
    [pool?.networkId, pool?.poolAddress, runtime, signer, submit],
  );

  /**
   * Take assets out of a term deal, or queue shares to leave a managed yield pool.
   *
   * `ALL` is the whole balance, read from the contract by the backend; `unit` says whether a
   * managed yield amount is in assets or shares.
   */
  const withdraw = useCallback(
    (amount: string, unit?: "ASSETS" | "SHARES") =>
      run("withdrawal", (owner) =>
        buildNonEvmWithdrawal({
          poolAddress: pool!.poolAddress!,
          networkId: pool!.networkId!,
          amount,
          receiver: owner,
          ...(unit ? { unit } : {}),
        }),
      ),
    [run, pool?.poolAddress, pool?.networkId],
  );

  /** Collect a term deal's distributed coupons. */
  const claimCoupon = useCallback(
    () =>
      run("coupon claim", (holder) =>
        buildCouponClaim({ poolAddress: pool!.poolAddress!, networkId: pool!.networkId!, holder }),
      ),
    [run, pool?.poolAddress, pool?.networkId],
  );

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
      setSucceeded(false);
      try {
        const built = await buildLockedExit({
          position: positionId,
          action,
          owner: signer,
          poolAddress: pool.poolAddress,
          tierIndex: next?.tierIndex,
          interestPayment: next?.interestPayment,
        });
        const tx = built.transaction;

        const ref = await submit(tx, "withdrawal");

        // Hand the reference over so the pool's cached views are dropped before the next
        // read. Best-effort: the money has already moved, and the sweep catches up within
        // the minute regardless, so a failure here must not read as a failed withdrawal.
        await confirmTransaction(ref, undefined, pool.networkId, pool.poolAddress, {
          // ROLL_OVER is not a withdrawal: nothing leaves the pool, the position is
          // replaced. Recorded under its own type so the activity list does not read as
          // money going out when it did not.
          type:
            action === "REDEEM"
              ? "REDEEM"
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
        setSucceeded(true);
        return ref;
      } catch (e) {
        const message = e instanceof Error ? e.message : "The withdrawal could not be completed.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsExiting(false);
      }
    },
    [pool?.networkId, pool?.poolAddress, runtime, signer, submit],
  );

  const reset = useCallback(() => {
    setSucceeded(false);
    setError(undefined);
  }, []);

  return { exit, withdraw, claimCoupon, isExiting, error, reference, signer, succeeded, reset };
}
