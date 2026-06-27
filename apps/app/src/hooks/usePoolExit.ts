import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import LIQUIDITY_POOL_ABI from "@/contracts/abis/LiquidityPool.json";
import STABLE_YIELD_POOL_ABI from "@/contracts/abis/StableYieldPool.json";
import LOCKED_POOL_ABI from "@/contracts/abis/LockedPool.json";
import { Pool } from "@/lib/api/types";
import { useInvalidateAfterMutation } from "@/hooks/useQueryInvalidation";

/**
 * Every user-side EXIT/CLAIM action across the three pool types. Mirrors the
 * direct-contract-write pattern in `useDeposit`. Burning shares / claiming needs
 * no ERC20 approval (you already own the shares), so there is no approve step.
 *
 *  - SINGLE_ASSET (LiquidityPool): withdraw, redeem, claimCoupon, claimRefund, emergencyWithdraw
 *  - STABLE_YIELD (StableYieldPool): withdraw (auto-queues when liquidity is low), redeem, emergencyRedeem
 *  - LOCKED (LockedPool): redeemPosition, earlyExitPosition, setAutoRollover, transferPosition
 */
export function usePoolExit(pool?: Pool) {
  const { address } = useAccount();
  const invalidateAfterMutation = useInvalidateAfterMutation();
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess && address && pool?.poolAddress) {
      invalidateAfterMutation(address, pool.poolAddress);
    }
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const poolABI =
    pool?.poolType === "STABLE_YIELD"
      ? STABLE_YIELD_POOL_ABI
      : pool?.poolType === "LOCKED"
      ? LOCKED_POOL_ABI
      : LIQUIDITY_POOL_ABI;

  const call = async (functionName: string, args: unknown[]) => {
    if (!pool || !address) throw new Error("Pool or wallet not connected");
    try {
      const hash = await writeContractAsync({
        address: pool.poolAddress as `0x${string}`,
        chainId: pool.chainId as any,
        abi: poolABI as any,
        functionName,
        args,
      });
      setTxHash(hash);
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
    call("withdraw", [amt(assetAmount), me(), me()]);

  // ERC4626 redeem by SHARE amount.
  const redeemShares = (shares: string) =>
    call("redeem", [amt(shares), me(), me()]);

  // SINGLE_ASSET
  const claimCoupon = () => call("claimCoupon", []);
  const claimRefund = () => call("claimRefund", []); // post-cancellation refund
  const emergencyWithdraw = () => call("emergencyWithdraw", []);

  // STABLE_YIELD
  const emergencyRedeem = (shares: string) =>
    call("emergencyRedeem", [amt(shares), me(), me()]);

  // LOCKED — position-scoped
  const redeemPosition = (positionId: number | string) =>
    call("redeemPosition", [BigInt(positionId)]);
  const earlyExitPosition = (positionId: number | string) =>
    call("earlyExitPosition", [BigInt(positionId)]);
  const setAutoRollover = (positionId: number | string, enabled: boolean) =>
    call("setAutoRollover", [BigInt(positionId), enabled]);
  const transferPosition = (positionId: number | string, newOwner: string) =>
    call("transferPosition", [BigInt(positionId), newOwner as `0x${string}`]);

  return {
    // single-asset + stable-yield
    withdraw,
    redeemShares,
    claimCoupon,
    claimRefund,
    emergencyWithdraw,
    emergencyRedeem,
    // locked
    redeemPosition,
    earlyExitPosition,
    setAutoRollover,
    transferPosition,
    // tx state
    txHash,
    isConfirming,
    isSuccess,
    reset: () => setTxHash(undefined),
  };
}
