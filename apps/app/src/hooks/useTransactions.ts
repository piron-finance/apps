"use client";

import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/lib/api/endpoints";
import { useHasPendingTx } from "@/lib/context/PendingTxContext";
import { LIVE_POLL_MS, RESTING_POLL_MS } from "@/lib/constants/polling";

/**
 * Hook to fetch transactions for a specific pool.
 *
 * Polls every few seconds while the user has an unconfirmed transaction so a
 * fresh deposit or withdrawal appears without a page refresh, then falls back to
 * a resting cadence once everything is settled.
 */
export function usePoolTransactions(
  poolAddress: string,
  params?: { page?: number; limit?: number }
) {
  const hasPending = useHasPendingTx();

  return useQuery({
    queryKey: ["pool-transactions", poolAddress, params],
    queryFn: () => transactionsApi.getPoolTransactions(poolAddress, params),
    enabled: !!poolAddress,
    staleTime: hasPending ? 0 : 10000,
    refetchInterval: hasPending ? LIVE_POLL_MS : RESTING_POLL_MS,
    retry: 2,
  });
}
