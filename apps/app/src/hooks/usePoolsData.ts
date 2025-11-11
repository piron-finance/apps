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
 * Hook to fetch single pool by ID
 * Smart: Uses cached data from pools list if available
 */
export function usePoolData(poolId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["pool", poolId],
    queryFn: () => poolsApi.getById(poolId),
    enabled: !!poolId,
    staleTime: 30000,
    retry: 2,
    initialData: () => {
      // Try to get pool from any cached pools list
      const poolsQueries = queryClient.getQueriesData({ queryKey: ["pools"] });

      for (const [, data] of poolsQueries) {
        if (data && typeof data === "object" && "data" in data) {
          const poolsData = data as { data: any[] };
          const pool = poolsData.data.find((p: any) => p.id === poolId);
          if (pool) return pool;
        }
      }

      return undefined;
    },
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
