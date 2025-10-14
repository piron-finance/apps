import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { LIQUIDITY_POOL_ABI } from "@/contracts/abis";
import { Pool } from "@/types";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../convex/_generated/dataModel";
import { usePoolSync } from "./usePoolSync";

interface DepositState {
  isDepositing: boolean;
  isSuccess: boolean;
  isConfirmed: boolean;
  error: string | null;
  shares: string | null;
  isApproving: boolean;
  needsApprovalFirst: boolean;
  lastTransactionType: "approval" | "deposit" | null;
}

export function useDeposit(pool: Pool) {
  const { address, isConnected } = useAccount();
  const { user } = useUser();
  const recordDeposit = useMutation(api.transactions.recordDeposit);
  const { syncPoolData } = usePoolSync(pool);

  const dbUser = useQuery(
    api.users.getByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const [depositState, setDepositState] = useState<DepositState>({
    isDepositing: false,
    isSuccess: false,
    isConfirmed: false,
    error: null,
    shares: null,
    isApproving: false,
    needsApprovalFirst: false,
    lastTransactionType: null,
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: blockchainSuccess,
    data: receipt,
    isError: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: 10_000,
  });

  // Get pool asset address for approval checks
  const { data: assetAddress } = useReadContract({
    address: pool.contractAddress as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "asset",
    query: {
      enabled: !!pool.contractAddress,
    },
  });

  // Get user's current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: assetAddress as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "allowance",
        inputs: [
          { name: "owner", type: "address", internalType: "address" },
          { name: "spender", type: "address", internalType: "address" },
        ],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
    ],
    functionName: "allowance",
    args:
      address && pool.contractAddress
        ? [address, pool.contractAddress as `0x${string}`]
        : undefined,
    query: {
      enabled: !!address && !!assetAddress && !!pool.contractAddress,
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

  // Get user's asset balance
  const { data: balance } = useReadContract({
    address: assetAddress as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "account", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
    ],
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!assetAddress,
    },
  });

  // Get max deposit allowed
  const { data: maxDeposit } = useReadContract({
    address: pool.contractAddress as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "maxDeposit",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!pool.contractAddress,
    },
  });

  // Handle blockchain confirmation and database recording
  useEffect(() => {
    const handleBlockchainConfirmation = async () => {
      if (
        blockchainSuccess &&
        receipt &&
        receipt.status === "success" &&
        receipt.blockNumber &&
        receipt.transactionHash &&
        !depositState.isConfirmed
      ) {
        console.log("✅ Blockchain transaction confirmed:", {
          txHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          status: receipt.status,
          transactionType: depositState.lastTransactionType,
        });

        // Only record to database if this is a DEPOSIT transaction, not approval
        if (depositState.lastTransactionType === "deposit") {
          console.log("📝 Recording deposit to database...");

          // First mark as confirmed (blockchain success)
          setDepositState((prev) => ({
            ...prev,
            isConfirmed: true,
            isDepositing: false,
            isApproving: false,
          }));

          try {
            // Parse the actual deposit event from transaction logs to get real amounts
            let actualAssets = depositState.shares || "0";
            let actualShares = depositState.shares || "0";

            // Try to parse Deposit event from transaction logs
            if (receipt.logs && receipt.logs.length > 0) {
              try {
                for (const log of receipt.logs) {
                  // Look for Deposit event from the pool contract
                  if (
                    log.address.toLowerCase() ===
                    pool.contractAddress.toLowerCase()
                  ) {
                    // Deposit event signature: Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)
                    const depositEventSignature =
                      "0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7";

                    if (log.topics[0] === depositEventSignature) {
                      // Parse the event data
                      const decimals = assetDecimals || 6;
                      // assets and shares are in the data field
                      const assets = BigInt(`0x${log.data.slice(2, 66)}`);
                      const shares = BigInt(`0x${log.data.slice(66, 130)}`);

                      actualAssets = formatUnits(assets, decimals);
                      actualShares = formatUnits(shares, decimals);

                      console.log("📊 Parsed deposit event:", {
                        actualAssets,
                        actualShares,
                      });
                      break;
                    }
                  }
                }
              } catch (eventParseError) {
                console.warn(
                  "Failed to parse deposit event, using fallback values:",
                  eventParseError
                );
              }
            }

            if (dbUser?._id && pool._id) {
              await recordDeposit({
                userId: dbUser._id as Id<"users">,
                poolId: pool._id as Id<"pools">,
                amount: actualAssets, // Use actual asset amount from event
                shares: actualShares, // Use actual shares from event
                txHash: receipt.transactionHash,
                blockNumber: Number(receipt.blockNumber),
                gasUsed: receipt.gasUsed?.toString(),
                eventData: {
                  receiver: address,
                  owner: address,
                },
              });
              console.log("✅ Database updated successfully");

              // Sync pool data with onchain values after successful deposit
              try {
                await syncPoolData();
                console.log("✅ Pool data synced with onchain values");
              } catch (syncError) {
                console.warn("⚠️ Pool sync failed (non-critical):", syncError);
              }
            }

            // ONLY NOW set isSuccess to true (both blockchain AND database success)
            setDepositState((prev) => ({
              ...prev,
              isSuccess: true,
              error: null,
            }));
          } catch (error) {
            console.error("❌ Failed to record deposit in database:", error);
            // Blockchain succeeded but database failed
            setDepositState((prev) => ({
              ...prev,
              isSuccess: true, // Still successful since blockchain succeeded
              error:
                "Blockchain transaction successful, but database update failed. Please contact support.",
            }));
          }
        } else if (depositState.lastTransactionType === "approval") {
          console.log("✅ Approval confirmed, not recording to database");
          // Just mark as confirmed for approval, don't record to database
          setDepositState((prev) => ({
            ...prev,
            isConfirmed: true,
            isApproving: false,
          }));
        }
      }
    };

    handleBlockchainConfirmation();
  }, [
    blockchainSuccess,
    receipt,
    depositState.shares,
    depositState.isConfirmed,
    depositState.lastTransactionType,
    dbUser?._id,
    pool._id,
    pool.contractAddress,
    recordDeposit,
    address,
    assetDecimals,
    syncPoolData,
  ]);

  // Handle transaction timeout
  useEffect(() => {
    if (receiptError) {
      console.error("❌ Transaction confirmation timeout or error");
      setDepositState((prev) => ({
        ...prev,
        isDepositing: false,
        isApproving: false,
        error:
          "Transaction confirmation timeout. Please check your wallet and try again.",
      }));
    }
  }, [receiptError]);

  const approveTokens = async (amount: string): Promise<void> => {
    if (!assetAddress || !address || !pool.contractAddress) {
      throw new Error("Missing required data for approval");
    }

    setDepositState((prev) => ({
      ...prev,
      isApproving: true,
      error: null,
      lastTransactionType: "approval",
    }));

    const decimals = assetDecimals || 18; // Default to 18 if not available
    const amountWei = parseUnits(amount, decimals);

    console.log("🔄 Submitting approval transaction to blockchain...", {
      token: assetAddress,
      spender: pool.contractAddress,
      amount: amountWei.toString(),
      decimals,
    });

    await writeContract({
      address: assetAddress as `0x${string}`,
      abi: [
        {
          type: "function",
          name: "approve",
          inputs: [
            { name: "spender", type: "address", internalType: "address" },
            { name: "amount", type: "uint256", internalType: "uint256" },
          ],
          outputs: [{ name: "", type: "bool", internalType: "bool" }],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "approve",
      args: [pool.contractAddress as `0x${string}`, amountWei],
    });

    console.log(
      "📤 Approval transaction submitted, waiting for confirmation..."
    );
  };

  const deposit = useCallback(
    async (amount: string) => {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }

      if (!pool.contractAddress) {
        throw new Error("Pool contract address not available");
      }

      setDepositState((prev) => ({
        ...prev,
        isDepositing: true,
        error: null,
        shares: amount, // Store expected shares (1:1 during funding)
        lastTransactionType: "deposit",
      }));

      try {
        const decimals = assetDecimals || 18; // Default to 18 if not available
        const amountWei = parseUnits(amount, decimals);

        if (balance && amountWei > balance) {
          throw new Error("Insufficient balance");
        }

        if (maxDeposit && amountWei > maxDeposit) {
          throw new Error("Amount exceeds maximum deposit limit");
        }

        console.log("🔄 Submitting deposit transaction to blockchain...", {
          pool: pool.contractAddress,
          amount: amountWei.toString(),
          user: address,
          decimals,
        });

        await writeContract({
          address: pool.contractAddress as `0x${string}`,
          abi: LIQUIDITY_POOL_ABI,
          functionName: "deposit",
          args: [amountWei, address],
        });

        console.log("📤 Transaction submitted, waiting for confirmation...");
      } catch (error) {
        console.error("Deposit failed:", error);
        setDepositState((prev) => ({
          ...prev,
          isDepositing: false,
          isApproving: false,
          error: error instanceof Error ? error.message : "Deposit failed",
        }));
        throw error;
      }
    },
    [
      isConnected,
      address,
      pool.contractAddress,
      balance,
      maxDeposit,
      writeContract,
      assetDecimals,
    ]
  );

  const approveAndDeposit = async (amount: string) => {
    try {
      await approveTokens(amount);

      setDepositState((prev) => ({
        ...prev,
        needsApprovalFirst: true,
        shares: amount,
      }));
    } catch (error) {
      setDepositState((prev) => ({
        ...prev,
        isApproving: false,
        isDepositing: false,
        error: error instanceof Error ? error.message : "Approval failed",
      }));
      throw error;
    }
  };

  useEffect(() => {
    const handleApprovalSuccess = async () => {
      if (
        blockchainSuccess &&
        receipt &&
        receipt.status === "success" &&
        depositState.needsApprovalFirst &&
        depositState.shares &&
        !depositState.isDepositing
      ) {
        console.log("✅ Approval confirmed, proceeding with deposit...");
        try {
          await refetchAllowance();

          setDepositState((prev) => ({
            ...prev,
            needsApprovalFirst: false,
            isApproving: false,
            isConfirmed: false, // Reset confirmation state for next transaction
          }));

          await deposit(depositState.shares);
        } catch (error) {
          console.error("❌ Auto-deposit after approval failed:", error);
          setDepositState((prev) => ({
            ...prev,
            needsApprovalFirst: false,
            isApproving: false,
            error:
              error instanceof Error
                ? error.message
                : "Deposit after approval failed",
          }));
        }
      }
    };

    handleApprovalSuccess();
  }, [
    blockchainSuccess,
    receipt,
    depositState.needsApprovalFirst,
    depositState.shares,
    depositState.isDepositing,
    refetchAllowance,
    deposit,
  ]);

  // Reset state
  const reset = () => {
    setDepositState({
      isDepositing: false,
      isSuccess: false,
      isConfirmed: false,
      error: null,
      shares: null,
      isApproving: false,
      needsApprovalFirst: false,
      lastTransactionType: null,
    });
  };

  // Helper functions
  const hasInsufficientBalance = (amount: string) => {
    if (!balance || !amount) return false;
    try {
      const decimals = assetDecimals || 18; // Default to 18 if not available
      const amountWei = parseUnits(amount, decimals);
      return amountWei > balance;
    } catch {
      return false;
    }
  };

  const needsApproval = (amount: string) => {
    if (!allowance || !amount) return true;
    try {
      const decimals = assetDecimals || 18; // Default to 18 if not available
      const amountWei = parseUnits(amount, decimals);
      return allowance < amountWei;
    } catch {
      return true;
    }
  };

  const getMaxDepositAmount = () => {
    if (!maxDeposit || !balance) return "0";
    const decimals = assetDecimals || 18; // Default to 18 if not available
    const max = maxDeposit < balance ? maxDeposit : balance;
    return formatUnits(max, decimals);
  };

  const getUserBalance = () => {
    if (!balance) return "0";
    const decimals = assetDecimals || 18; // Default to 18 if not available
    return formatUnits(balance, decimals);
  };

  return {
    // State
    ...depositState,
    isPending,
    isConfirming,
    transactionHash: hash,

    // Data
    balance,
    allowance,
    maxDeposit,
    assetAddress,
    assetDecimals,

    // Functions
    deposit,
    approveTokens,
    approveAndDeposit,
    reset,

    // Helpers
    hasInsufficientBalance,
    needsApproval,
    getMaxDepositAmount,
    getUserBalance,
  };
}
