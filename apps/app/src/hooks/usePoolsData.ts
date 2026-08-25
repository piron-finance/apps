"use client";

import { useQuery } from "@tanstack/react-query";
import { poolsApi } from "@/lib/api/endpoints";
import type { PoolFilters } from "@/lib/api/types";
import { useHasPendingTx } from "@/lib/context/PendingTxContext";
import { LIVE_POLL_MS, RESTING_POLL_MS } from "@/lib/constants/polling";

/**
 * Hook to fetch all pools with optional filters
 */
export function usePoolsData(filters?: PoolFilters) {
  const hasPending = useHasPendingTx();
  return useQuery({
    queryKey: ["pools", filters],
    queryFn: () => poolsApi.getAll(filters),
    // Pool TVL on the dashboard cards moves the moment the user's own deposit
    // is indexed, so track it closely while one is in flight.
    staleTime: hasPending ? 0 : 30000,
    refetchInterval: hasPending ? LIVE_POLL_MS : false,
    retry: 2,
  });
}

/**
 * Hook to fetch single pool by poolAddress
 * NOTE: Listing endpoint doesn't include assetAddress, so we MUST fetch detail endpoint
 */
export function usePoolData(poolAddress: string) {
  const hasPending = useHasPendingTx();
  return useQuery({
    queryKey: ["pool", poolAddress],
    queryFn: () => poolsApi.getById(poolAddress),
    enabled: !!poolAddress,
    staleTime: hasPending ? 0 : 30000,
    // NAV and pool state can change
    refetchInterval: hasPending ? LIVE_POLL_MS : RESTING_POLL_MS,
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
    enabled: !!poolId,
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

/**
 * Hook to fetch featured pools
 */
export function useFeaturedPools() {
  return useQuery({
    queryKey: ["featured-pools"],
    queryFn: () => poolsApi.getFeatured(),
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to fetch pool stats
 */
export function usePoolStats(poolAddress?: string) {
  const hasPending = useHasPendingTx();
  return useQuery({
    queryKey: ["pool-stats", poolAddress],
    queryFn: () => poolsApi.getStats(poolAddress!),
    enabled: !!poolAddress,
    staleTime: hasPending ? 0 : 30000,
    refetchInterval: hasPending ? LIVE_POLL_MS : RESTING_POLL_MS,
    retry: 2,
  });
}

/**
 * Hook to fetch pool instruments/allocation
 */
export function usePoolInstruments(poolId?: string) {
  return useQuery({
    queryKey: ["pool-instruments", poolId],
    queryFn: () => poolsApi.getInstruments(poolId!),
    enabled: !!poolId,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
}
