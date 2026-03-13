"use client";

import { useQuery } from "@tanstack/react-query";
import { feesApi } from "@/lib/api/endpoints";

/**
 * Hook to fetch pool deposit fee
 */
export function usePoolFee(poolAddress?: string) {
  return useQuery({
    queryKey: ["pool-fee", poolAddress],
    queryFn: () => feesApi.getPoolFee(poolAddress!),
    enabled: !!poolAddress,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch all pool fee rates
 */
export function usePoolFeeRates(poolAddress?: string) {
  return useQuery({
    queryKey: ["pool-fee-rates", poolAddress],
    queryFn: () => feesApi.getPoolRates(poolAddress!),
    enabled: !!poolAddress,
    staleTime: 300000,
    retry: 2,
  });
}

/**
 * Hook to calculate fee for a specific amount
 */
export function useFeeCalculation(poolAddress?: string, amount?: string) {
  return useQuery({
    queryKey: ["fee-calculation", poolAddress, amount],
    queryFn: () => feesApi.calculate(poolAddress!, amount!),
    enabled: !!poolAddress && !!amount && parseFloat(amount) > 0,
    staleTime: 10000, // 10 seconds - recalculate frequently
    retry: 1,
  });
}

/**
 * Hook to fetch fee splits configuration
 */
export function useFeeSplits(chainId?: number) {
  return useQuery({
    queryKey: ["fee-splits", chainId],
    queryFn: () => feesApi.getSplits(chainId),
    staleTime: 600000, // 10 minutes
    retry: 2,
  });
}
