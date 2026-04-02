"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { usersApi } from "@/lib/api/endpoints";

/** Returns true if the error is an Axios 404 (user/position not found) */
function is404(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}



/**
 * Hook to fetch user positions
 * Returns null gracefully if the user doesn't exist yet (no deposits made)
 */
export function useUserPositions(walletAddress?: string) {
  return useQuery({
    queryKey: ["user-positions", walletAddress],
    queryFn: async () => {
      try {
        return await usersApi.getPositions(walletAddress!);
      } catch (error) {
        if (is404(error)) return null;
        throw error;
      }
    },
    enabled: !!walletAddress,
    staleTime: 30000,
    refetchInterval: 30000, // poll every 30s so balances stay current
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
    staleTime: 30000,
    refetchInterval: 30000,
    retry: (failureCount, error) => is404(error) ? false : failureCount < 1,
  });
}

