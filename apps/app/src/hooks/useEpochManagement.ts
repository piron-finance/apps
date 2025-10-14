import React, { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MANAGER_ABI } from "@/contracts/abis";
import { Pool } from "@/types";
import { Id } from "../../convex/_generated/dataModel";

interface EpochManagementState {
  isClosing: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionStartTime: number | null;
}

export function useEpochManagement(pool: Pool) {
  const { address } = useAccount();
  const { isSignedIn, user } = useUser();
  const [state, setState] = useState<EpochManagementState>({
    isClosing: false,
    isSuccess: false,
    error: null,
    transactionStartTime: null,
  });

  const updatePoolStatus = useMutation(api.pools.updateStatus);

  const adminCheck = useQuery(
    api.admins.checkAdminByEmail,
    isSignedIn && user?.emailAddresses?.[0]?.emailAddress
      ? { email: user.emailAddresses[0].emailAddress }
      : "skip"
  );

  const currentAdmin = adminCheck?.admin;

  const { data: onchainPoolData } = useReadContract({
    address: pool.managerAddress as `0x${string}`,
    abi: MANAGER_ABI,
    functionName: "pools",
    args: [pool.contractAddress as `0x${string}`],
    query: {
      enabled: !!pool.managerAddress && !!pool.contractAddress,
    },
  });

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

  // Timeout mechanism for stuck transactions (2 minutes)
  React.useEffect(() => {
    if (!state.transactionStartTime) return;

    const timeoutId = setTimeout(
      () => {
        const timeElapsed = Date.now() - state.transactionStartTime!;
        const twoMinutes = 2 * 60 * 1000;

        if (timeElapsed >= twoMinutes && !state.isSuccess) {
          setState((prev) => ({
            ...prev,
            isClosing: false,
            error: "Transaction timed out. Please try again.",
            transactionStartTime: null,
          }));
        }
      },
      2 * 60 * 1000
    ); // 2 minutes

    return () => clearTimeout(timeoutId);
  }, [state.transactionStartTime, state.isSuccess]);

  const closeEpoch = async () => {
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
        transactionStartTime: Date.now(),
      }));

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
        transactionStartTime: null,
      }));
      return false;
    }
  };

  const forceCloseEpoch = async () => {
    return await closeEpoch();
  };

  const regularCloseEpoch = async () => {
    return await closeEpoch();
  };

  const reset = () => {
    setState({
      isClosing: false,
      isSuccess: false,
      error: null,
      transactionStartTime: null,
    });
  };

  // Time calculations using onchain data
  const currentTime = Date.now() / 1000;

  // Use onchain epoch end time if available, fallback to database value
  const onchainEpochEndTime = onchainPoolData?.[0]?.epochEndTime;
  const epochEndTime = onchainEpochEndTime
    ? Number(onchainEpochEndTime)
    : pool.epochEndTime;

  const timeRemaining = epochEndTime - currentTime;
  const hasEpochPassed = timeRemaining <= 0;

  // Determine what actions are available
  const canForceClose =
    String(pool.status) === "FUNDING" && !hasEpochPassed && !!currentAdmin;

  const canRegularClose =
    String(pool.status) === "FUNDING" && hasEpochPassed && !!currentAdmin;

  const canCloseEpoch = canForceClose || canRegularClose;

  return {
    ...state,
    isPending,
    isConfirming,
    transactionHash: hash,

    // Time info
    hasEpochPassed,
    timeRemaining,
    epochEndTime,
    onchainEpochEndTime: onchainEpochEndTime
      ? Number(onchainEpochEndTime)
      : null,

    // Admin info
    currentAdmin,

    // Action availability
    canForceClose,
    canRegularClose,
    canCloseEpoch,

    // Onchain data
    onchainPoolData,

    // Functions
    forceCloseEpoch,
    regularCloseEpoch,
    reset,
  };
}
