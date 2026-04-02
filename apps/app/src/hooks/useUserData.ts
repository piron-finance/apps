"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usersApi } from "@/lib/api/endpoints";

/** Returns true if the error is an Axios 404 (user/position not found) */
function is404(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

/**
 * Hook to fetch user profile
 */
export function useUserProfile(walletAddress?: string) {
  return useQuery({
    queryKey: ["user-profile", walletAddress],
    queryFn: () => usersApi.getProfile(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch user KYC status
 */
export function useUserKYCStatus(walletAddress?: string) {
  return useQuery({
    queryKey: ["user-kyc-status", walletAddress],
    queryFn: () => usersApi.getKYCStatus(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to submit KYC
 */
export function useSubmitKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ walletAddress, kycData }: { walletAddress: string; kycData: any }) =>
      usersApi.submitKYC(walletAddress, kycData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-kyc-status", variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", variables.walletAddress] });
    },
  });
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

/**
 * Hook to fetch user transactions
 */
export function useUserTransactions(walletAddress?: string, params?: any) {
  return useQuery({
    queryKey: ["user-transactions", walletAddress, params],
    queryFn: () => usersApi.getTransactions(walletAddress!, params),
    enabled: !!walletAddress,
    staleTime: 30000,
    retry: 2,
  });
}
