"use client";

import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api/endpoints";

/**
 * Hook to fetch transactions for a specific pool
 */
export function usePoolTransactions(
  poolAddress: string,
  params?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ["pool-transactions", poolAddress, params],
    queryFn: () => transactionsApi.getPoolTransactions(poolAddress, params),
    enabled: !!poolAddress,
    staleTime: 10000,
    retry: 2,
  });
}
