"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { poolsApi, lockedPositionsApi, usersApi, buildLockedDepositTransaction } from "@/lib/api/endpoints";

/**
 * Hook to fetch lock tiers for a pool
 */
export function usePoolTiers(poolAddress?: string) {
  return useQuery({
    queryKey: ["pool-tiers", poolAddress],
    queryFn: () => poolsApi.getTiers(poolAddress!),
    enabled: !!poolAddress,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to fetch locked pool live metrics
 */
export function useLockedPoolMetrics(chainId?: number, poolAddress?: string) {
  return useQuery({
    queryKey: ["locked-pool-metrics", chainId, poolAddress],
    queryFn: () => poolsApi.getLockedMetrics(chainId!, poolAddress!),
    enabled: !!chainId && !!poolAddress,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook to preview a locked deposit
 */
export function useLockedDepositPreview(
  chainId?: number,
  poolAddress?: string,
  amount?: string,
  tierIndex?: number
) {
  return useQuery({
    queryKey: ["locked-deposit-preview", chainId, poolAddress, amount, tierIndex],
    queryFn: () => poolsApi.previewLockedDeposit(chainId!, poolAddress!, amount!, tierIndex!),
    enabled: !!chainId && !!poolAddress && !!amount && tierIndex !== undefined && parseFloat(amount) > 0,
    staleTime: 10000,
    retry: 1,
  });
}

/**
 * Hook to get locked position by ID
 */
export function useLockedPosition(positionId?: number) {
  return useQuery({
    queryKey: ["locked-position", positionId],
    queryFn: () => lockedPositionsApi.getById(positionId!),
    enabled: positionId !== undefined,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook to preview early exit from locked position
 */
export function useEarlyExitPreview(positionId?: number) {
  return useQuery({
    queryKey: ["early-exit-preview", positionId],
    queryFn: () => lockedPositionsApi.previewEarlyExit(positionId!),
    enabled: positionId !== undefined,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook to fetch user's locked positions
 */
export function useUserLockedPositions(walletAddress?: string) {
  return useQuery({
    queryKey: ["user-locked-positions", walletAddress],
    queryFn: () => usersApi.getLockedPositions(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook to build locked deposit transaction
 */
export function useLockedDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      poolAddress: string;
      amount: string;
      depositor: string;
      tierIndex: number;
      interestPayment?: "UPFRONT" | "AT_MATURITY";
    }) => buildLockedDepositTransaction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-locked-positions", variables.depositor] });
      queryClient.invalidateQueries({ queryKey: ["locked-pool-metrics"] });
    },
  });
}
