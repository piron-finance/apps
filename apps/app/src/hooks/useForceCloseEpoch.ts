import React, { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MANAGER_ABI } from "@/contracts/abis";
import { Pool, PoolStatus } from "@/types";
import { Id } from "../../convex/_generated/dataModel";

interface EpochManagementState {
  isClosing: boolean;
  isSuccess: boolean;
  error: string | null;
}

export function useEpochManagement(pool: Pool) {
  const { address } = useAccount();
  const [state, setState] = useState<EpochManagementState>({
    isClosing: false,
    isSuccess: false,
    error: null,
  });

  const updatePoolStatus = useMutation(api.pools.updateStatus);

  const currentAdmin = useQuery(
    api.admins.getByWallet,
    address ? { walletAddress: address } : "skip"
  );

  const { writeContract, data: hash, isPending } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: blockchainSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  React.useEffect(() => {
    if (blockchainSuccess && receipt && currentAdmin && !state.isSuccess) {
      console.log("✅ Epoch closed successfully on blockchain");

      updatePoolStatus({
        poolId: pool._id as Id<"pools">,
        status: "PENDING_INVESTMENT",
        adminId: currentAdmin._id,
      })
        .then(() => {
          console.log("✅ Pool status updated in database");
          setState((prev) => ({
            ...prev,
            isClosing: false,
            isSuccess: true,
            error: null,
          }));
        })
        .catch((error) => {
          console.error("❌ Failed to update pool status:", error);
          setState((prev) => ({
            ...prev,
            isClosing: false,
            error: "Failed to update pool status in database",
          }));
        });
    }
  }, [
    blockchainSuccess,
    receipt,
    currentAdmin,
    updatePoolStatus,
    pool._id,
    state.isSuccess,
  ]);

  const closeEpoch = async (isForced: boolean = false) => {
    if (!address || !currentAdmin || !pool.managerAddress) {
      const error = "Missing required data for epoch close";
      console.error(error);
      setState((prev) => ({ ...prev, error }));
      return false;
    }

    try {
      setState((prev) => ({
        ...prev,
        isClosing: true,
        error: null,
        isSuccess: false,
      }));

      console.log(
        `🔄 ${isForced ? "Force" : "Regular"} closing epoch for pool:`,
        {
          poolAddress: pool.contractAddress,
          managerAddress: pool.managerAddress,
          isForced,
        }
      );

      await writeContract({
        address: pool.managerAddress as `0x${string}`,
        abi: MANAGER_ABI,
        functionName: "closeEpoch",
        args: [pool.contractAddress as `0x${string}`],
      });

      return true;
    } catch (error) {
      console.error("❌ Failed to close epoch:", error);
      setState((prev) => ({
        ...prev,
        isClosing: false,
        error: error instanceof Error ? error.message : "Failed to close epoch",
      }));
      return false;
    }
  };

  const forceCloseEpoch = async () => {
    return await closeEpoch(true);
  };

  const regularCloseEpoch = async () => {
    return await closeEpoch(false);
  };

  const reset = () => {
    setState({
      isClosing: false,
      isSuccess: false,
      error: null,
    });
  };

  // Time calculations
  const currentTime = Date.now() / 1000;
  const timeRemaining = pool.epochEndTime - currentTime;
  const hasEpochPassed = timeRemaining <= 0;

  // Determine what actions are available
  const canForceClose =
    pool.status === PoolStatus.FUNDING && !hasEpochPassed && !!currentAdmin;

  const canRegularClose =
    pool.status === PoolStatus.FUNDING && hasEpochPassed && !!currentAdmin;

  const canCloseEpoch = canForceClose || canRegularClose;

  return {
    ...state,
    isPending,
    isConfirming,
    transactionHash: hash,

    // Time info
    hasEpochPassed,
    timeRemaining,

    // Admin info
    currentAdmin,

    // Action availability
    canForceClose,
    canRegularClose,
    canCloseEpoch,

    // Functions
    forceCloseEpoch,
    regularCloseEpoch,
    reset,
  };
}
