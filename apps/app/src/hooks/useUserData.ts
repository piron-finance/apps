"use client";

import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/endpoints";

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
 * Hook to fetch user positions
 */
export function useUserPositions(walletAddress?: string) {
  return useQuery({
    queryKey: ["user-positions", walletAddress],
    queryFn: () => usersApi.getPositions(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch user position in specific pool
 */
export function useUserPositionInPool(walletAddress?: string, poolId?: string) {
  return useQuery({
    queryKey: ["user-position", walletAddress, poolId],
    queryFn: () => usersApi.getPositionInPool(walletAddress!, poolId!),
    enabled: !!walletAddress && !!poolId,
    staleTime: 30000,
    retry: 2,
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
