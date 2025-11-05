"use client";

import { useQuery } from "@tanstack/react-query";
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
 * Hook to fetch single pool by ID
 */
export function usePoolData(poolId: string) {
  return useQuery({
    queryKey: ["pool", poolId],
    queryFn: () => poolsApi.getById(poolId),
    enabled: !!poolId,
    staleTime: 30000,
    retry: 2,
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
    retry: 2,
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
