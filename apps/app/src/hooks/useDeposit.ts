import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import ERC20_ABI from "@/contracts/abis/IERC20.json";
import LIQUIDITY_POOL_ABI from "@/contracts/abis/LiquidityPool.json";
import STABLE_YIELD_POOL_ABI from "@/contracts/abis/StableYieldPool.json";
import { Pool } from "@/lib/api/types";
import { buildDepositTransaction } from "@/lib/api/endpoints";

interface UseDepositReturn {
  // Functions
  deposit: (amount: string) => Promise<`0x${string}`>;
  approve: (amount: string) => Promise<`0x${string}`>;
  approveAndDeposit: (amount: string) => Promise<void>;
  needsApproval: (amount: string) => boolean;
  hasInsufficientBalance: (amount: string) => boolean;
  getUserBalance: () => string;
  getMaxDepositAmount: () => string;
  reset: () => void;
  refetchAllowance: () => void;
  
  // States
  isApproving: boolean;
  isApprovalSuccess: boolean;
  isConfirming: boolean;
  isPending: boolean;
  isDepositing: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  
  // Data
  error: null;
  shares: string | null;
  transactionHash: `0x${string}` | undefined;
  approvalTxHash: `0x${string}` | undefined;
  balance: string | undefined;
  balanceRaw: bigint | undefined;
}

export function useDeposit(pool?: Pool): UseDepositReturn {
  const { address } = useAccount();
  const [depositTxHash, setDepositTxHash] = useState<`0x${string}` | undefined>();
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | undefined>();

  // Select the correct ABI based on pool type
  const poolABI = pool?.poolType === "STABLE_YIELD" ? STABLE_YIELD_POOL_ABI : LIQUIDITY_POOL_ABI;

  // Wagmi hooks for contract interactions
  const { writeContractAsync } = useWriteContract();

  // Get user's token balance (only query the chain the pool is on)
  const { data: balance } = useReadContract({
    address: pool?.assetAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: pool?.chainId,
    query: {
      enabled: Boolean(address && pool?.assetAddress && pool?.chainId),
    },
  });

  // Get current allowance (only query the chain the pool is on)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: pool?.assetAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && pool ? [address, pool.poolAddress as `0x${string}`] : undefined,
    chainId: pool?.chainId,
    query: {
      enabled: Boolean(address && pool?.assetAddress && pool?.poolAddress && pool?.chainId),
    },
  });

  // Wait for approval transaction
  const { isLoading: isApproving, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approvalTxHash,
    });

  // Wait for deposit transaction
  const {
    isLoading: isConfirming,
    isSuccess: isDepositSuccess,
    data: depositReceipt,
  } = useWaitForTransactionReceipt({
    hash: depositTxHash,
  });

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
        chainId: pool.chainId,
      });

      setApprovalTxHash(hash);
      return hash;
    } catch (error) {
      console.error("Approval failed:", error);
      throw error;
    }
  };

  const deposit = async (amount: string) => {
    if (!pool || !address) {
      throw new Error("Pool or wallet not connected");
    }

    try {
      // Call backend to build deposit transaction
      const { transaction } = await buildDepositTransaction({
        poolAddress: pool.poolAddress,
        amount,
        receiver: address,
      });

      // Send the transaction using wagmi
      const hash = await writeContractAsync({
        address: transaction.to as `0x${string}`,
        chainId: pool.chainId,
        abi: poolABI as any,
        functionName: "deposit",
        args: [
          parseUnits(amount, pool.assetDecimals),
          address as `0x${string}`,
        ],
      });

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
    ? formatUnits(BigInt(depositReceipt.logs[0].topics[3]), pool?.assetDecimals || 18)
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
    balanceRaw: balance, // Raw balance data for checking if loaded
  };
}
