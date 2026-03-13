"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { fiatApi } from "@/lib/api/endpoints";

/**
 * Hook to initiate fiat deposit
 */
export function useFiatDeposit() {
  return useMutation({
    mutationFn: (data: {
      fiatAmount: number;
      fiatCurrency: string;
      cryptoAsset: string;
    }) => fiatApi.deposit(data),
  });
}

/**
 * Hook to get fiat transaction status
 */
export function useFiatTransaction(reference?: string) {
  return useQuery({
    queryKey: ["fiat-transaction", reference],
    queryFn: () => fiatApi.getTransaction(reference!),
    enabled: !!reference,
    staleTime: 10000, // Poll frequently
    refetchInterval: 10000, // Auto-refresh for pending transactions
    retry: 2,
  });
}
