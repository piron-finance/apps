"use client";

import { useCallback, useState } from "react";
import { Transaction as SolanaTransaction } from "@solana/web3.js";
import { useStellarWallet } from "@/lib/wallets/StellarWalletContext";
import { signAndSubmitStellar } from "@/lib/wallets/submitStellar";
import { useSolanaWallet } from "@/lib/wallets/SolanaWalletContext";
import { buildDepositTransaction, buildLockedDepositTransaction, confirmTransaction } from "@/lib/api/endpoints";
import { Pool } from "@/lib/api/types";
import { runtimeOf } from "@/lib/constants/networks";
import { useInvalidateAfterMutation } from "@/hooks/useQueryInvalidation";

/**
 * A deposit on Stellar or Solana: into a locked pool's tier, or into a term deal or managed
 * yield pool.
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

      // Tell the backend what the reference was, so it lands in the pool's activity list.
      // Best-effort: the deposit is already on chain and the position comes from the
      // chain sweep, so a failure here costs a ledger row, not the holding.
      const report = async (reference: string, amountReported: string) => {
        await confirmTransaction(reference, undefined, pool.networkId!, pool.poolAddress, {
          type: "DEPOSIT",
          amount: amountReported,
          from: signer,
        }).catch(() => undefined);
      };

      setIsDepositing(true);
      setError(undefined);
      try {
        // A term deal or managed yield pool takes `deposit(investor, assets)`: no tier and no
        // interest choice, built by the same endpoint the EVM path uses for its calldata.
        const built =
          pool.poolType === "LOCKED"
            ? await buildLockedDepositTransaction({
                poolAddress: pool.poolAddress,
                networkId: pool.networkId!,
                amount,
                depositor: signer,
                tierIndex,
                interestPayment,
              })
            : await buildDepositTransaction({
                poolAddress: pool.poolAddress,
                networkId: pool.networkId!,
                amount,
                receiver: signer,
              });
        const tx = built.transaction;

        if (tx.runtime === "stellar") {
          const hash = await signAndSubmitStellar(stellar, tx, "deposit");
          setReference(hash);
          await report(hash, amount);
          await invalidateAfterMutation(signer, pool.poolAddress);
          return hash;
        }

        if (tx.runtime === "solana") {
          const envelope = SolanaTransaction.from(Buffer.from(tx.transaction, "base64"));
          const signature = await solana.signAndSend(
            envelope,
            tx.blockhash,
            tx.lastValidBlockHeight
          );
          setReference(signature);
          await report(signature, amount);
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
