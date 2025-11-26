"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { poolsApi } from "@/lib/api/endpoints";
import type { PoolFilters } from "@/lib/api/types";

/**
 * Hook to fetch all pools with optional filters
 */
export function usePoolsData(filters?: PoolFilters) {
  return useQuery({
    queryKey: ["pools", filters],
    queryFn: () => poolsApi.getAll(filters),
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch single pool by poolAddress
 * NOTE: Listing endpoint doesn't include assetAddress, so we MUST fetch detail endpoint
 */
export function usePoolData(poolAddress: string) {
  return useQuery({
    queryKey: ["pool", poolAddress],
    queryFn: () => poolsApi.getById(poolAddress),
    enabled: !!poolAddress,
    staleTime: 30000,
    retry: 2,
    // Don't use initialData - listing doesn't have all fields (e.g. assetAddress)
  });
}

/**
 * Hook to fetch pool analytics
 */
export function usePoolAnalytics(poolId: string) {
  return useQuery({
    queryKey: ["pool-analytics", poolId],
    queryFn: () => poolsApi.getAnalytics(poolId),
    enabled: !!poolId,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to fetch pool NAV history
 */
export function usePoolNavHistory(
  poolId: string,
  period: string = "30d",
  interval: string = "daily"
) {
  return useQuery({
    queryKey: ["pool-nav-history", poolId, period, interval],
    queryFn: () => poolsApi.getNavHistory(poolId, period, interval),
    enabled: false, // Disabled - backend endpoint not implemented yet
    staleTime: 300000, // 5 minutes
    retry: 0,
  });
}

/**
 * Hook to fetch pool performance
 */
export function usePoolPerformance(poolId: string, period: string = "30d") {
  return useQuery({
    queryKey: ["pool-performance", poolId, period],
    queryFn: () => poolsApi.getPerformance(poolId, period),
    enabled: !!poolId,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
}
