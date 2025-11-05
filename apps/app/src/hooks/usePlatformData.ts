"use client";

import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/endpoints";

/**
 * Hook to fetch platform-wide metrics
 */
export function usePlatformMetrics() {
  return useQuery({
    queryKey: ["platform-metrics"],
    queryFn: () => platformApi.getMetrics(),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
  });
}
