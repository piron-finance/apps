"use client";

import { useQueryClient } from "@tanstack/react-query";

/**
 * Invalidates all queries that could be stale after a deposit, withdrawal,
 * locked deposit, redeem, or early exit.
 */
function invalidateAll(
  queryClient: ReturnType<typeof useQueryClient>,
  address: string,
  poolAddress: string
) {
  // User data
  queryClient.invalidateQueries({ queryKey: ["user-positions"] });
  queryClient.invalidateQueries({ queryKey: ["user-position", address] });
  queryClient.invalidateQueries({ queryKey: ["user-transactions", address] });
  queryClient.invalidateQueries({ queryKey: ["user-locked-positions", address] });

  // Pool data
  queryClient.invalidateQueries({ queryKey: ["pool", poolAddress] });
  queryClient.invalidateQueries({ queryKey: ["pool-stats", poolAddress] });
  queryClient.invalidateQueries({ queryKey: ["pools"] });

  // Withdrawal state
  queryClient.invalidateQueries({ queryKey: ["withdrawal-queue-status", poolAddress] });
  queryClient.invalidateQueries({ queryKey: ["pool-withdrawal-requests", poolAddress] });
  queryClient.invalidateQueries({ queryKey: ["user-withdrawal-requests", address] });
}

/**
 * Returns a function that invalidates all user/pool query data after a mutation,
 * then retries at 3 s and 8 s to handle backend indexer lag.
 *
 * The backend indexes on-chain events asynchronously — a single immediate
 * invalidation often races ahead of the indexer and refetches stale data.
 * The delayed retries guarantee at least one refetch after the backend has caught up.
 */
export function useInvalidateAfterMutation() {
  const queryClient = useQueryClient();

  return (address: string, poolAddress: string) => {
    invalidateAll(queryClient, address, poolAddress);
    setTimeout(() => invalidateAll(queryClient, address, poolAddress), 3000);
    setTimeout(() => invalidateAll(queryClient, address, poolAddress), 8000);
  };
}
