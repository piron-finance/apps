"use client";

import { useQuery } from "@tanstack/react-query";
import { withdrawalsApi } from "@/lib/api/endpoints";

/**
 * Hook to fetch pool withdrawal requests/queue for a user
 */
export function usePoolWithdrawalRequests(poolId?: string, userAddress?: string) {
  return useQuery({
    queryKey: ["pool-withdrawal-requests", poolId, userAddress],
    queryFn: () => withdrawalsApi.getPoolRequests(poolId!, userAddress!),
    enabled: !!poolId && !!userAddress,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook to preview a withdrawal
 */
export function useWithdrawalPreview(
  poolAddress?: string,
  amount?: string,
  userAddress?: string
) {
  return useQuery({
    queryKey: ["withdrawal-preview", poolAddress, amount, userAddress],
    queryFn: () => withdrawalsApi.preview(poolAddress!, amount!, userAddress!),
    enabled: !!poolAddress && !!amount && !!userAddress && parseFloat(amount) > 0,
    staleTime: 10000,
    retry: 1,
  });
}

/**
 * Hook to get withdrawal queue status
 */
export function useWithdrawalQueueStatus(poolAddress?: string, userAddress?: string) {
  return useQuery({
    queryKey: ["withdrawal-queue-status", poolAddress, userAddress],
    queryFn: () => withdrawalsApi.getQueueStatus(poolAddress!, userAddress!),
    enabled: !!poolAddress && !!userAddress,
    staleTime: 30000,
    retry: 2,
  });
}
