"use client";

import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/endpoints";

/**
 * Hook to fetch platform metrics.
 * Pass chainId to scope all stats (TVL, APY, pool counts) to a specific chain.
 * Omit chainId (or pass undefined) for cross-chain totals.
 */
export function usePlatformMetrics(chainId?: number) {
  return useQuery({
    queryKey: ["platform-metrics", chainId ?? "all"],
    queryFn: () => platformApi.getMetrics(chainId),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
  });
}
