"use client";

import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api/endpoints";
import type { TransactionFilters } from "@/lib/api/types";

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
    staleTime: 10000, // 10 seconds - transactions change frequently
    retry: 2,
  });
}

/**
 * Hook to fetch transactions for a specific user/wallet
 */
export function useUserTransactions(
  walletAddress?: string,
  filters?: TransactionFilters
) {
  return useQuery({
    queryKey: ["user-transactions", walletAddress, filters],
    queryFn: () =>
      transactionsApi.getUserTransactions(walletAddress!, filters),
    enabled: !!walletAddress,
    staleTime: 10000, // 10 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch a specific transaction by hash
 */
export function useTransaction(txHash?: string) {
  return useQuery({
    queryKey: ["transaction", txHash],
    queryFn: () => transactionsApi.getTransactionByHash(txHash!),
    enabled: !!txHash,
    staleTime: 60000, // 1 minute - individual transactions don't change
    retry: 2,
  });
}

