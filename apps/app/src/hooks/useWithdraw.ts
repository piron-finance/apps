import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { LIQUIDITY_POOL_ABI } from "@/contracts/abis";
import { Pool } from "@/types";

interface WithdrawState {
  isWithdrawing: boolean;
  isSuccess: boolean;
  error: string | null;
  assetsReceived: string | null;
}

export function useWithdraw(pool: Pool) {
  const { address, isConnected } = useAccount();

  const [withdrawState, setWithdrawState] = useState<WithdrawState>({
    isWithdrawing: false,
    isSuccess: false,
    error: null,
    assetsReceived: null,
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Get pool asset address for decimal detection
  const { data: assetAddress } = useReadContract({
    address: pool.contractAddress as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "asset",
    query: {
      enabled: !!pool.contractAddress,
    },
  });

  // Get asset decimals
  const { data: assetDecimals } = useReadContract({
    address: assetAddress as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "decimals",
        inputs: [],
        outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
        stateMutability: "view",
      },
    ],
    functionName: "decimals",
    query: {
      enabled: !!assetAddress,
    },
  });

  // Get user's share balance
  const { data: shareBalance } = useReadContract({
    address: pool.contractAddress as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!pool.contractAddress,
    },
  });

  // Get max withdraw allowed
  const { data: maxWithdraw } = useReadContract({
    address: pool.contractAddress as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "maxWithdraw",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!pool.contractAddress,
    },
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && receipt) {
      setWithdrawState((prev) => ({
        ...prev,
        isSuccess: true,
        isWithdrawing: false,
        error: null,
      }));
    }
  }, [isSuccess, receipt]);

  // Withdraw specific asset amount
  const withdraw = async (assets: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (!pool.contractAddress) {
      throw new Error("Pool contract address not available");
    }

    setWithdrawState((prev) => ({
      ...prev,
      isWithdrawing: true,
      error: null,
      assetsReceived: assets,
    }));

    try {
      const decimals = assetDecimals || 6; // Default to 6 if not available (USDC standard)
      const assetsWei = parseUnits(assets, decimals);

      // Validate amount
      if (maxWithdraw && assetsWei > maxWithdraw) {
        throw new Error("Amount exceeds maximum withdrawal limit");
      }

      // Execute withdrawal
      await writeContract({
        address: pool.contractAddress as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: "withdraw",
        args: [assetsWei, address, address],
      });
    } catch (error) {
      console.error("Withdrawal failed:", error);
      setWithdrawState((prev) => ({
        ...prev,
        isWithdrawing: false,
        error: error instanceof Error ? error.message : "Withdrawal failed",
      }));
      throw error;
    }
  };

  // Redeem specific share amount
  const redeem = async (shares: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (!pool.contractAddress) {
      throw new Error("Pool contract address not available");
    }

    setWithdrawState((prev) => ({
      ...prev,
      isWithdrawing: true,
      error: null,
      assetsReceived: shares, // Approximate, 1:1 during funding
    }));

    try {
      const decimals = assetDecimals || 6; // Default to 6 if not available (USDC standard)
      const sharesWei = parseUnits(shares, decimals);

      // Validate amount
      if (shareBalance && sharesWei > shareBalance) {
        throw new Error("Insufficient share balance");
      }

      // Execute redemption
      await writeContract({
        address: pool.contractAddress as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: "redeem",
        args: [sharesWei, address, address],
      });
    } catch (error) {
      console.error("Redemption failed:", error);
      setWithdrawState((prev) => ({
        ...prev,
        isWithdrawing: false,
        error: error instanceof Error ? error.message : "Redemption failed",
      }));
      throw error;
    }
  };

  // Emergency withdraw (for emergency status pools)
  const emergencyWithdraw = async () => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (!pool.contractAddress) {
      throw new Error("Pool contract address not available");
    }

    setWithdrawState((prev) => ({
      ...prev,
      isWithdrawing: true,
      error: null,
    }));

    try {
      await writeContract({
        address: pool.contractAddress as `0x${string}`,
        abi: LIQUIDITY_POOL_ABI,
        functionName: "emergencyWithdraw",
        args: [],
      });
    } catch (error) {
      console.error("Emergency withdrawal failed:", error);
      setWithdrawState((prev) => ({
        ...prev,
        isWithdrawing: false,
        error:
          error instanceof Error
            ? error.message
            : "Emergency withdrawal failed",
      }));
      throw error;
    }
  };

  // Reset state
  const reset = () => {
    setWithdrawState({
      isWithdrawing: false,
      isSuccess: false,
      error: null,
      assetsReceived: null,
    });
  };

  // Helper functions
  const hasInsufficientShares = (shares: string) => {
    if (!shareBalance || !shares) return false;
    try {
      const decimals = assetDecimals || 6; // Default to 6 if not available (USDC standard)
      const sharesWei = parseUnits(shares, decimals);
      return sharesWei > shareBalance;
    } catch {
      return false;
    }
  };

  const getMaxWithdrawAmount = () => {
    if (!maxWithdraw) return "0";
    const decimals = assetDecimals || 6; // Default to 6 if not available (USDC standard)
    return formatUnits(maxWithdraw, decimals);
  };

  const getShareBalance = () => {
    if (!shareBalance) return "0";
    const decimals = assetDecimals || 6; // Default to 6 if not available (USDC standard)
    return formatUnits(shareBalance, decimals);
  };

  return {
    // State
    ...withdrawState,
    isPending,
    isConfirming,
    transactionHash: hash,

    // Data
    shareBalance,
    maxWithdraw,
    assetAddress,
    assetDecimals,

    // Functions
    withdraw,
    redeem,
    emergencyWithdraw,
    reset,

    // Helpers
    hasInsufficientShares,
    getMaxWithdrawAmount,
    getShareBalance,
  };
}
