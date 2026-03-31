import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits, formatUnits } from "viem";
import ERC20_ABI from "@/contracts/abis/IERC20.json";
import LIQUIDITY_POOL_ABI from "@/contracts/abis/LiquidityPool.json";
import STABLE_YIELD_POOL_ABI from "@/contracts/abis/StableYieldPool.json";
import LOCKED_POOL_ABI from "@/contracts/abis/LockedPool.json";
import { Pool } from "@/lib/api/types";
import { buildDepositTransaction } from "@/lib/api/endpoints";

interface UseDepositReturn {
  deposit: (amount: string, tierIndex?: number, interestPayment?: "UPFRONT" | "AT_MATURITY") => Promise<`0x${string}`>;
  approve: (amount: string) => Promise<`0x${string}`>;
  approveAndDeposit: (amount: string) => Promise<void>;
  needsApproval: (amount: string) => boolean;
  hasInsufficientBalance: (amount: string) => boolean;
  getUserBalance: () => string;
  getMaxDepositAmount: () => string;
  reset: () => void;
  refetchAllowance: () => void;


  isApproving: boolean;
  isApprovalSuccess: boolean;
  isConfirming: boolean;
  isPending: boolean;
  isDepositing: boolean;
  isSuccess: boolean;
  isLoading: boolean;


  error: null;
  shares: string | null;
  transactionHash: `0x${string}` | undefined;
  approvalTxHash: `0x${string}` | undefined;
  balance: string | undefined;
  balanceRaw: bigint | undefined;
}

export function useDeposit(pool?: Pool): UseDepositReturn {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [depositTxHash, setDepositTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [approvalTxHash, setApprovalTxHash] = useState<
    `0x${string}` | undefined
  >();


  const poolABI =
    pool?.poolType === "STABLE_YIELD"
      ? STABLE_YIELD_POOL_ABI
      : pool?.poolType === "LOCKED"
      ? LOCKED_POOL_ABI
      : LIQUIDITY_POOL_ABI;


  const { writeContractAsync } = useWriteContract();

  const { data: balance } = useReadContract({
    address: pool?.assetAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: pool?.chainId as any,
    query: {
      enabled: Boolean(address && pool?.assetAddress && pool?.chainId),
    },
  });


  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: pool?.assetAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      address && pool
        ? [address, pool.poolAddress as `0x${string}`]
        : undefined,
    chainId: pool?.chainId as any,
    query: {
      enabled: Boolean(
        address && pool?.assetAddress && pool?.poolAddress && pool?.chainId
      ),
    },
  });


  const { isLoading: isApproving, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approvalTxHash,
    });

  const {
    isLoading: isConfirming,
    isSuccess: isDepositSuccess,
    data: depositReceipt,
  } = useWaitForTransactionReceipt({
    hash: depositTxHash,
  });

  // Invalidate all user/pool data once deposit is confirmed on-chain
  useEffect(() => {
    if (isDepositSuccess && address) {
      queryClient.invalidateQueries({ queryKey: ["user-positions"] });
      queryClient.invalidateQueries({ queryKey: ["user-position", address] });
      queryClient.invalidateQueries({ queryKey: ["user-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["pool-stats", pool?.poolAddress] });
      queryClient.invalidateQueries({ queryKey: ["pool", pool?.poolAddress] });
    }
  }, [isDepositSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const needsApproval = (amount: string): boolean => {
    if (!pool || !allowance) return true;

    try {
      const amountBigInt = parseUnits(amount, pool.assetDecimals);
      return (allowance as bigint) < amountBigInt;
    } catch {
      return true;
    }
  };

  const hasInsufficientBalance = (amount: string): boolean => {
    if (!pool || !balance) return true;

    try {
      const amountBigInt = parseUnits(amount, pool.assetDecimals);
      return (balance as bigint) < amountBigInt;
    } catch {
      return true;
    }
  };

  const getUserBalance = (): string => {
    if (!pool || !balance) return "0";
    return formatUnits(balance as bigint, pool.assetDecimals);
  };

  const getMaxDepositAmount = (): string => {
    return getUserBalance();
  };

  const approve = async (amount: string) => {
    if (!pool || !address) {
      throw new Error("Pool or wallet not connected");
    }

    const amountBigInt = parseUnits(amount, pool.assetDecimals);

    try {
      const hash = await writeContractAsync({
        address: pool.assetAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [pool.poolAddress as `0x${string}`, amountBigInt],
        chainId: pool.chainId as any,
      });

      setApprovalTxHash(hash);
      return hash;
    } catch (error) {
      console.error("Approval failed:", error);
      throw error;
    }
  };

  const deposit = async (amount: string, tierIndex?: number, interestPayment?: "UPFRONT" | "AT_MATURITY") => {
    if (!pool || !address) {
      throw new Error("Pool or wallet not connected");
    }

    try {
      const amountBigInt = parseUnits(amount, pool.assetDecimals);

      let hash: `0x${string}`;

      if (pool.poolType === "LOCKED") {
        // UPFRONT = 0, AT_MATURITY = 1
        const paymentChoice = interestPayment === "UPFRONT" ? 0 : 1;
        hash = await writeContractAsync({
          address: pool.poolAddress as `0x${string}`,
          chainId: pool.chainId as any,
          abi: LOCKED_POOL_ABI as any,
          functionName: "depositLocked",
          args: [amountBigInt, tierIndex ?? 0, paymentChoice],
        });
      } else {
        await buildDepositTransaction({
          poolAddress: pool.poolAddress,
          amount,
          receiver: address,
        });

        hash = await writeContractAsync({
          address: pool.poolAddress as `0x${string}`,
          chainId: pool.chainId as any,
          abi: poolABI as any,
          functionName: "deposit",
          args: [amountBigInt, address as `0x${string}`],
        });
      }

      setDepositTxHash(hash);
      return hash;
    } catch (error) {
      console.error("Deposit failed:", error);
      throw error;
    }
  };

  const approveAndDeposit = async (amount: string) => {
    // First approve
    await approve(amount);

    // Wait for approval to be confirmed
    // The deposit will be handled separately after approval
  };

  const reset = () => {
    setDepositTxHash(undefined);
    setApprovalTxHash(undefined);
  };

  // Extract shares from deposit receipt if available
  const shares = depositReceipt?.logs?.[0]?.topics?.[3]
    ? formatUnits(
        BigInt(depositReceipt.logs[0].topics[3]),
        pool?.assetDecimals || 18
      )
    : null;

  return {
    // Functions
    deposit,
    approve,
    approveAndDeposit,
    needsApproval,
    hasInsufficientBalance,
    getUserBalance,
    getMaxDepositAmount,
    reset,
    refetchAllowance,

    // States
    isApproving,
    isApprovalSuccess,
    isConfirming,
    isPending: false,
    isDepositing: isApproving || isConfirming,
    isSuccess: isDepositSuccess,
    isLoading: isApproving || isConfirming,

    // Data
    error: null,
    shares,
    transactionHash: depositTxHash,
    approvalTxHash,
    balance: balance ? getUserBalance() : undefined, // Return undefined if balance not loaded
    balanceRaw: balance as bigint | undefined, // Raw balance data for checking if loaded
  };
}
