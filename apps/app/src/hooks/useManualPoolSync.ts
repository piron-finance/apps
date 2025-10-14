import { useState } from "react";
import { useReadContract } from "wagmi";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MANAGER_ABI } from "@/contracts/abis";
import { Pool } from "@/types";
import { Id } from "../../convex/_generated/dataModel";

interface SyncState {
  isSyncing: boolean;
  lastSyncTime: number | null;
  error: string | null;
  success: boolean;
}

export function useManualPoolSync(pool: Pool) {
  const { isSignedIn, user } = useUser();
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    success: false,
  });

  const updatePoolStatus = useMutation(api.pools.updateStatus);

  const adminCheck = useQuery(
    api.admins.checkAdminByEmail,
    isSignedIn && user?.emailAddresses?.[0]?.emailAddress
      ? { email: user.emailAddresses[0].emailAddress }
      : "skip"
  );
  const currentAdmin = adminCheck?.admin;

  const { refetch: fetchPoolData } = useReadContract({
    address: pool.managerAddress as `0x${string}`,
    abi: MANAGER_ABI,
    functionName: "pools",
    args: [pool.contractAddress as `0x${string}`],
    query: {
      enabled: false,
    },
  });

  const syncPoolData = async () => {
    if (!currentAdmin) return false;

    try {
      setState((prev) => ({ ...prev, isSyncing: true, error: null }));

      const result = await fetchPoolData();
      const poolData = result.data;

      if (!poolData) {
        throw new Error("No data returned");
      }

      const onchainStatus = poolData[1];

      const statusNames = [
        "FUNDING",
        "PENDING_INVESTMENT",
        "INVESTED",
        "MATURED",
        "EMERGENCY",
      ];
      const statusString = statusNames[onchainStatus] || "UNKNOWN";

      await updatePoolStatus({
        poolId: pool._id as Id<"pools">,
        status: statusString as
          | "FUNDING"
          | "PENDING_INVESTMENT"
          | "INVESTED"
          | "MATURED"
          | "EMERGENCY",
        adminId: currentAdmin._id,
      });

      setState((prev) => ({
        ...prev,
        isSyncing: false,
        success: true,
        lastSyncTime: Date.now(),
      }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, success: false }));
      }, 3000);

      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : "Sync failed",
      }));
      return false;
    }
  };

  const canSync = !!currentAdmin && !!pool._id;

  return {
    isSyncing: state.isSyncing,
    lastSyncTime: state.lastSyncTime,
    error: state.error,
    success: state.success,
    canSync,
    syncPoolData,
    clearError: () => setState((prev) => ({ ...prev, error: null })),
  };
}
