"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawalsApi } from "@/lib/api/endpoints";

/**
 * Hook to fetch pool withdrawal requests/queue
 */
export function usePoolWithdrawalRequests(poolId?: string) {
  return useQuery({
    queryKey: ["pool-withdrawal-requests", poolId],
    queryFn: () => withdrawalsApi.getPoolRequests(poolId!),
    enabled: !!poolId,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch user's withdrawal requests
 */
export function useUserWithdrawalRequests(walletAddress?: string) {
  return useQuery({
    queryKey: ["user-withdrawal-requests", walletAddress],
    queryFn: () => withdrawalsApi.getUserRequests(walletAddress!),
    enabled: !!walletAddress,
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

/**
 * Hook to build and execute withdrawal
 */
export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { poolAddress: string; amount: string; receiver: string }) =>
      withdrawalsApi.buildWithdrawal(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-positions"] });
      queryClient.invalidateQueries({ queryKey: ["user-position", variables.receiver] });
      queryClient.invalidateQueries({ queryKey: ["pool-transactions", variables.poolAddress] });
    },
  });
}

/**
 * Hook to redeem matured locked position
 */
export function useRedeemMatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { positionId: number; poolAddress: string }) =>
      withdrawalsApi.redeemMatured(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-locked-positions"] });
      queryClient.invalidateQueries({ queryKey: ["locked-position"] });
    },
  });
}

/**
 * Hook for early exit from locked position
 */
export function useEarlyExit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { positionId: number; poolAddress: string }) =>
      withdrawalsApi.earlyExit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-locked-positions"] });
      queryClient.invalidateQueries({ queryKey: ["locked-position"] });
    },
  });
}

/**
 * Hook to set auto-rollover
 */
export function useSetAutoRollover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { positionId: number; poolAddress: string; newTierIndex?: number }) =>
      withdrawalsApi.setAutoRollover(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-locked-positions"] });
      queryClient.invalidateQueries({ queryKey: ["locked-position"] });
    },
  });
}

/**
 * Hook to transfer locked position
 */
export function useTransferPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { positionId: number; poolAddress: string; toAddress: string }) =>
      withdrawalsApi.transferPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-locked-positions"] });
    },
  });
}
