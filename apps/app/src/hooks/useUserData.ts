"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { usersApi } from "@/lib/api/endpoints";
import { useChainContext } from "@/lib/context/ChainContext";
import { useHasPendingTx } from "@/lib/context/PendingTxContext";
import { LIVE_POLL_MS, RESTING_USER_POLL_MS } from "@/lib/constants/polling";

/** Returns true if the error is an Axios 404 (user/position not found) */
function is404(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

/**
 * Hook to fetch user positions scoped to the active chain.
 * Returns null gracefully if the user doesn't exist yet (no deposits made).
 * Re-fetches automatically when the chain selection changes.
 */
export function useUserPositions(walletAddress?: string) {
  const { activeChainId } = useChainContext();
  const hasPending = useHasPendingTx();
  return useQuery({
    // Include chainId in query key so React Query treats each chain as separate cache entry
    queryKey: ["user-positions", walletAddress, activeChainId],
    queryFn: async () => {
      try {
        return await usersApi.getPositions(walletAddress!, activeChainId);
      } catch (error) {
        if (is404(error)) return null;
        throw error;
      }
    },
    enabled: !!walletAddress,
    // Drops to a few seconds while a transaction is unconfirmed so a new
    // position shows up without a refresh; 30s otherwise.
    staleTime: hasPending ? 0 : 30000,
    refetchInterval: hasPending ? LIVE_POLL_MS : RESTING_USER_POLL_MS,
    retry: (failureCount, error) => is404(error) ? false : failureCount < 2,
  });
}

/**
 * Hook to fetch user position in specific pool
 * Returns null gracefully if the user has no position (404 = no deposit yet)
 */
export function useUserPositionInPool(
  walletAddress?: string, 
  poolId?: string,
  options?: { enabled?: boolean }
) {
  const hasPending = useHasPendingTx();
  return useQuery({
    queryKey: ["user-position", walletAddress, poolId],
    queryFn: async () => {
      try {
        return await usersApi.getPositionInPool(walletAddress!, poolId!);
      } catch (error) {
        if (is404(error)) return null;
        throw error;
      }
    },
    enabled: !!walletAddress && !!poolId && (options?.enabled !== false),
    staleTime: hasPending ? 0 : 30000,
    refetchInterval: hasPending ? LIVE_POLL_MS : RESTING_USER_POLL_MS,
    retry: (failureCount, error) => is404(error) ? false : failureCount < 1,
  });
}

