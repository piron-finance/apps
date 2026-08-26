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
import { withdrawalsApi } from "@/lib/api/endpoints";

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

  useEffect(() => {
    if (!isSuccess || !address || !pool?.poolAddress) return;
    if (txHash) markMined(txHash);
    invalidateAfterMutation(address, pool.poolAddress);
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

  const poolABI =
    pool?.poolType === "STABLE_YIELD"
      ? STABLE_YIELD_POOL_ABI
      : pool?.poolType === "LOCKED"
      ? LOCKED_POOL_ABI
      : LIQUIDITY_POOL_ABI;

  /**
   * Tells the backend an exit is inbound so its indexer bursts before the tx
   * lands. Exits have no confirm-receipt endpoint, so this is the only thing
   * keeping them off the 60s indexer cadence. Fire-and-forget by design — a
   * failure here must never block the user's exit.
   */
  const signalExit = (functionName: string, args: unknown[], amount?: string) => {
    if (!pool) return;
    const positionId = Number(args[0]);
    const send =
      functionName === "redeemPosition"
        ? withdrawalsApi.signalRedeem(pool.poolAddress, positionId)
        : functionName === "earlyExitPosition"
        ? withdrawalsApi.signalEarlyExit(pool.poolAddress, positionId)
        : amount && address
        ? withdrawalsApi.signalWithdrawal(pool.poolAddress, amount, address)
        : null;

    send?.catch((err) => {
      console.warn(`[usePoolExit] ${functionName} pre-signal failed:`, err?.message);
    });
  };

  const call = async (functionName: string, args: unknown[], amount?: string) => {
    if (!pool || !address) throw new Error("Pool or wallet not connected");
    // Exit actions run on the pool's chain; switch (and add if needed) the wallet
    // so the write doesn't throw ChainMismatchError when it's on another network.
    if (walletChainId !== pool.chainId) {
      await switchChainAsync({ chainId: pool.chainId as any });
    }
    if (LEDGER_TYPES[functionName]) signalExit(functionName, args, amount);
    try {
      const hash = await writeContractAsync({
        address: pool.poolAddress as `0x${string}`,
        chainId: pool.chainId as any,
        abi: poolABI as any,
        functionName,
        args,
      });
      setTxHash(hash);
      const ledgerType = LEDGER_TYPES[functionName];
      if (ledgerType) {
        addPendingTx({
          txHash: hash,
          chainId: pool.chainId,
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
