import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { parseUnits } from "viem";
import LIQUIDITY_POOL_ABI from "@/contracts/abis/LiquidityPool.json";
import STABLE_YIELD_POOL_ABI from "@/contracts/abis/StableYieldPool.json";
import LOCKED_POOL_ABI from "@/contracts/abis/LockedPool.json";
import { Pool } from "@/lib/api/types";
import { useInvalidateAfterMutation } from "@/hooks/useQueryInvalidation";
import { usePendingTx, type PendingTxType } from "@/lib/context/PendingTxContext";
import { confirmTransaction, withdrawalsApi } from "@/lib/api/endpoints";
import { canSignFor, networkLabel } from "../lib/constants/networks";
import { useNonEvmExit } from "./useNonEvmExit";

/**
 * Every user-side EXIT/CLAIM action across the three pool types. Mirrors the
 * direct-contract-write pattern in `useDeposit`. Burning shares / claiming needs
 * no ERC20 approval (you already own the shares), so there is no approve step.
 *
 *  - SINGLE_ASSET (LiquidityPool): withdraw, redeem, claimCoupon, emergencyWithdraw
 *  - STABLE_YIELD (StableYieldPool): withdraw (auto-queues when liquidity is low), redeem, emergencyRedeem
 *  - LOCKED (LockedPool): redeemPosition, earlyExitPosition, setAutoRollover, transferPosition
 */
export function usePoolExit(pool?: Pool) {
  const { address, chainId: walletChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const invalidateAfterMutation = useInvalidateAfterMutation();
  const { add: addPendingTx, markMined } = usePendingTx();
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Same hand-off as a deposit: give the backend the mined hash so it indexes the exit
  // from its receipt and drops its cached pool data, and only then refetch. Refetching
  // first returns the position as it was before the exit.
  useEffect(() => {
    if (!isSuccess || !address || !pool?.poolAddress || !txHash) return;
    markMined(txHash);
    confirmTransaction(txHash, pool.chainId ?? undefined, pool.networkId, pool.poolAddress)
      .catch((err) => {
        // Non-fatal: the backend's own sweep still picks the exit up.
        console.warn("[usePoolExit] confirm push failed, falling back to indexer:", err?.message);
      })
      .finally(() => invalidateAfterMutation(address, pool.poolAddress));
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * How each contract call surfaces in the transaction ledger, so the optimistic
   * row is tagged the same way the indexed one will be. Calls absent from this
   * map (setAutoRollover, transferPosition) produce no ledger entry, so they get
   * no pending row.
   */
  const LEDGER_TYPES: Record<string, PendingTxType> = {
    withdraw: "WITHDRAWAL",
    redeem: "WITHDRAWAL",
    emergencyWithdraw: "WITHDRAWAL",
    emergencyRedeem: "WITHDRAWAL",
    claimCoupon: "WITHDRAWAL",
    redeemPosition: "POSITION_REDEEMED",
    earlyExitPosition: "EARLY_EXIT",
  };

  /**
   * Whether this pool's exits are signed by a non-EVM wallet.
   *
   * Read off the chain id, which the backend's CHECK constraint guarantees is null for
   * every non-EVM pool, rather than the optional `runtime` field.
   */
  const isNonEvm = Boolean(pool) && (pool!.chainId === null || pool!.chainId === undefined);
  const nonEvm = useNonEvmExit(isNonEvm ? pool : undefined);

  const poolABI =
    pool?.poolType === "STABLE_YIELD"
      ? STABLE_YIELD_POOL_ABI
      : pool?.poolType === "LOCKED"
      ? LOCKED_POOL_ABI
      : LIQUIDITY_POOL_ABI;

  /**
   * Tells the backend an exit is inbound so its indexer bursts before the tx
   * lands. The mined hash is handed over afterwards (see the effect above), which
   * is what makes the exit show up at once; this keeps the indexer close behind as
   * the fallback. Fire-and-forget by design — a failure here must never block the
   * user's exit.
   */
  const signalExit = (functionName: string, args: unknown[], amount?: string) => {
    if (!pool) return;
    const positionId = Number(args[0]);
    const send =
      functionName === "redeemPosition"
        ? withdrawalsApi.signalRedeem(pool.poolAddress, positionId, pool.chainId ?? undefined)
        : functionName === "earlyExitPosition"
        ? withdrawalsApi.signalEarlyExit(pool.poolAddress, positionId, pool.chainId ?? undefined)
        : amount && address
        ? withdrawalsApi.signalWithdrawal(pool.poolAddress, amount, address)
        : null;

    send?.catch((err) => {
      console.warn(`[usePoolExit] ${functionName} pre-signal failed:`, err?.message);
    });
  };

  const call = async (functionName: string, args: unknown[], amount?: string) => {
    if (!pool || !address) throw new Error("Pool or wallet not connected");
    // Refuse before touching the wallet when there is no chain to target. The unguarded
    // `switchChainAsync({ chainId: pool.chainId as any })` compiled only because of the
    // cast: off EVM `chainId` is null, so this asked the wallet to switch to null and
    // threw. An investor exiting a Stellar position saw a wallet error instead of being
    // told this app cannot sign for that network yet — and an exit is money leaving a
    // pool, so a misleading failure there is worse than on a deposit.
    if (!canSignFor(pool)) {
      throw new Error(
        `Exiting a position on ${networkLabel(pool)} is not available in this app yet. ` +
          "Your position and its value are real; signing for this network needs a wallet " +
          "connection we have not shipped.",
      );
    }
    // Reached only by the operations with no non-EVM equivalent. Redeeming and exiting
    // a locked position are delegated before this, so what lands here is a single-asset
    // or stable-yield call, or a locked extra like setAutoRollover that exists on the
    // Solidity contract alone.
    if (pool.chainId === null || pool.chainId === undefined) {
      throw new Error(
        `This action is not available on ${networkLabel(pool)}. Withdrawing from a ` +
          "locked position is — nothing has been submitted.",
      );
    }
    // Captured past the guard, so the rest of this function has a number rather than
    // re-widening what was just proved with a `?? undefined` or a cast.
    const chainId: number = pool.chainId;
    // Exit actions run on the pool's chain; switch (and add if needed) the wallet
    // so the write doesn't throw ChainMismatchError when it's on another network.
    if (walletChainId !== chainId) {
      await switchChainAsync({ chainId: chainId as never });
    }
    if (LEDGER_TYPES[functionName]) signalExit(functionName, args, amount);
    try {
      const hash = await writeContractAsync({
        address: pool.poolAddress as `0x${string}`,
        chainId: chainId as never,
        abi: poolABI as any,
        functionName,
        args,
      });
      setTxHash(hash);
      const ledgerType = LEDGER_TYPES[functionName];
      if (ledgerType) {
        addPendingTx({
          txHash: hash,
          chainId: pool.chainId ?? undefined,
          poolAddress: pool.poolAddress,
          userAddress: address,
          type: ledgerType,
          amount: amount ?? null,
        });
      }
      return hash;
    } catch (error) {
      console.error(`${functionName} failed:`, error);
      throw error;
    }
  };

  const amt = (v: string) => parseUnits(v, pool?.assetDecimals ?? 18);
  const me = () => address as `0x${string}`;

  // ERC4626 withdraw by ASSET amount (single-asset + stable-yield).
  // Stable-yield auto-queues the request when reserves are low.
  const withdraw = (assetAmount: string) =>
    call("withdraw", [amt(assetAmount), me(), me()], assetAmount);

  // ERC4626 redeem by SHARE amount.
  const redeemShares = (shares: string) =>
    call("redeem", [amt(shares), me(), me()], shares);

  // SINGLE_ASSET
  const claimCoupon = () => call("claimCoupon", []);
  const emergencyWithdraw = () => call("emergencyWithdraw", []);

  // STABLE_YIELD
  const emergencyRedeem = (shares: string) =>
    call("emergencyRedeem", [amt(shares), me()], shares);

  // LOCKED — position-scoped
  // Off EVM these go through the backend-built envelope instead of wagmi. Delegated at
  // the two entry points rather than inside `call`, because `call` encodes against an ABI
  // this runtime has none of — and these are the only two locked exits the contracts
  // expose to a holder.
  const redeemPosition = (positionId: number | string) =>
    isNonEvm
      ? nonEvm.exit(positionId, "REDEEM")
      : call("redeemPosition", [BigInt(positionId)]);
  const earlyExitPosition = (positionId: number | string) =>
    isNonEvm
      ? nonEvm.exit(positionId, "EARLY_EXIT")
      : call("earlyExitPosition", [BigInt(positionId)]);
  /** Roll a matured position into another tier. Non-EVM only; EVM has no such call. */
  const rollOverPosition = (
    positionId: number | string,
    tierIndex: number,
    interestPayment?: "UPFRONT" | "AT_MATURITY",
  ) => {
    if (!isNonEvm) {
      throw new Error("Rolling over is not available on this network.");
    }
    return nonEvm.exit(positionId, "ROLL_OVER", { tierIndex, interestPayment });
  };
  const setAutoRollover = (positionId: number | string, enabled: boolean) =>
    call("setAutoRollover", [BigInt(positionId), enabled]);
  const transferPosition = (positionId: number | string, newOwner: string) =>
    call("transferPosition", [BigInt(positionId), newOwner as `0x${string}`]);

  return {
    // single-asset + stable-yield
    withdraw,
    redeemShares,
    claimCoupon,
    emergencyWithdraw,
    emergencyRedeem,
    // locked
    redeemPosition,
    earlyExitPosition,
    rollOverPosition,
    setAutoRollover,
    transferPosition,
    // tx state
    txHash: isNonEvm ? (nonEvm.reference as `0x${string}` | undefined) : txHash,
    isConfirming,
    isSuccess,
    reset: () => setTxHash(undefined),
  };
}
