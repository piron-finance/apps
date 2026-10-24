"use client";

import { useCallback, useState } from "react";
import { Transaction as SolanaTransaction } from "@solana/web3.js";
import { TransactionBuilder } from "@stellar/stellar-sdk";
import { rpc as stellarRpc } from "@stellar/stellar-sdk";
import { useStellarWallet } from "@/lib/wallets/StellarWalletContext";
import { useSolanaWallet } from "@/lib/wallets/SolanaWalletContext";
import { buildLockedDepositTransaction } from "@/lib/api/endpoints";
import { Pool } from "@/lib/api/types";
import { runtimeOf } from "@/lib/constants/networks";
import { useInvalidateAfterMutation } from "@/hooks/useQueryInvalidation";

/**
 * A locked deposit on Stellar or Solana.
 *
 * Kept apart from `useDeposit` rather than folded into it. The EVM flow is approve, wait,
 * deposit, wait — two transactions against an ERC20 allowance, with wagmi managing
 * receipts. Neither runtime here has an approval step, and both sign an envelope the
 * backend prepared rather than calldata assembled in the browser. Those are different
 * enough that one hook serving both would be mostly branches.
 *
 * The shape is the same in both cases, which is the point of the discriminated envelope:
 * ask the backend to build, hand the result to the wallet, submit, report the reference.
 * Confirmation is not reported back — the backend's sweep reads the pool from chain
 * within the minute, which is more reliable than a client that might close its tab.
 */

export interface NonEvmDepositState {
  deposit: (amount: string, tierIndex: number, interestPayment: "UPFRONT" | "AT_MATURITY") => Promise<string>;
  isDepositing: boolean;
  error?: string;
  /** Transaction hash (Stellar) or signature (Solana) once submitted. */
  reference?: string;
  /** The address that will sign, or undefined when no matching wallet is connected. */
  signer?: string;
  /** Set when this pool's runtime has no connected wallet, for a control to explain itself. */
  needsWalletReason?: string;
  reset: () => void;
}

export function useNonEvmDeposit(pool?: Pool): NonEvmDepositState {
  const runtime = runtimeOf(pool?.networkId ?? undefined);
  const stellar = useStellarWallet();
  const solana = useSolanaWallet();
  const invalidateAfterMutation = useInvalidateAfterMutation();

  const [isDepositing, setIsDepositing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [reference, setReference] = useState<string | undefined>();

  const signer =
    runtime === "stellar" ? stellar.address : runtime === "solana" ? solana.address : undefined;

  const needsWalletReason = (() => {
    if (!pool || !runtime || runtime === "evm") return undefined;
    if (signer) return undefined;
    if (runtime === "stellar") {
      return stellar.available
        ? "Connect your Freighter wallet to deposit on Stellar."
        : "Freighter is needed to deposit on Stellar. Install it from freighter.app.";
    }
    return solana.available
      ? `Connect your ${solana.walletName ?? "Solana"} wallet to deposit on this pool.`
      : "A Solana wallet is needed to deposit on this pool. Install Phantom from phantom.app.";
  })();

  const reset = useCallback(() => {
    setError(undefined);
    setReference(undefined);
    setIsDepositing(false);
  }, []);

  const deposit = useCallback(
    async (amount: string, tierIndex: number, interestPayment: "UPFRONT" | "AT_MATURITY") => {
      if (!pool) throw new Error("No pool selected.");
      if (!runtime || runtime === "evm") {
        throw new Error("This pool is on an EVM chain; use the EVM deposit flow.");
      }
      if (!signer) throw new Error(needsWalletReason ?? "Connect a wallet first.");

      setIsDepositing(true);
      setError(undefined);
      try {
        const built = await buildLockedDepositTransaction({
          poolAddress: pool.poolAddress,
          networkId: pool.networkId!,
          amount,
          depositor: signer,
          tierIndex,
          interestPayment,
        });
        const tx = built.transaction;

        if (tx.runtime === "stellar") {
          // A prepared Soroban envelope carries time bounds of a few minutes, so a stale
          // one is refused by the network rather than mis-signed. Saying so here turns an
          // opaque rejection into something an investor can act on.
          if (tx.validUntilTime && tx.validUntilTime * 1000 < Date.now()) {
            throw new Error("This quote expired before it was signed. Try again.");
          }
          const signedXdr = await stellar.signXdr(tx.xdr, tx.networkPassphrase);
          const server = new stellarRpc.Server(tx.rpcUrl ?? "https://soroban-testnet.stellar.org");
          const envelope = TransactionBuilder.fromXDR(signedXdr, tx.networkPassphrase);
          const sent = await server.sendTransaction(envelope);
          if (sent.status === "ERROR") {
            throw new Error(`The network rejected the deposit: ${JSON.stringify(sent.errorResult)}`);
          }
          // Poll to SUCCESS before reporting, so the caller is not told a deposit landed
          // while it is still only submitted.
          let result = await server.getTransaction(sent.hash);
          for (let i = 0; i < 30 && result.status === "NOT_FOUND"; i++) {
            await new Promise((r) => setTimeout(r, 1000));
            result = await server.getTransaction(sent.hash);
          }
          if (result.status !== "SUCCESS") {
            throw new Error(`The deposit did not complete: ${result.status}`);
          }
          setReference(sent.hash);
          await invalidateAfterMutation(signer, pool.poolAddress);
          return sent.hash;
        }

        if (tx.runtime === "solana") {
          const envelope = SolanaTransaction.from(Buffer.from(tx.transaction, "base64"));
          const signature = await solana.signAndSend(
            envelope,
            tx.blockhash,
            tx.lastValidBlockHeight
          );
          setReference(signature);
          await invalidateAfterMutation(signer, pool.poolAddress);
          return signature;
        }

        throw new Error(`Deposits are not supported on ${(tx as { runtime: string }).runtime}.`);
      } catch (e) {
        const message = e instanceof Error ? e.message : "The deposit could not be completed.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsDepositing(false);
      }
    },
    [pool, runtime, signer, needsWalletReason, stellar, solana, invalidateAfterMutation]
  );

  return { deposit, isDepositing, error, reference, signer, needsWalletReason, reset };
}
