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
  queryClient.invalidateQueries({ queryKey: ["pool-transactions", poolAddress] });
  queryClient.invalidateQueries({ queryKey: ["pools"] });

  // Withdrawal state
  queryClient.invalidateQueries({ queryKey: ["withdrawal-queue-status", poolAddress] });
  queryClient.invalidateQueries({ queryKey: ["pool-withdrawal-requests", poolAddress] });
  queryClient.invalidateQueries({ queryKey: ["user-withdrawal-requests", address] });
}

/**
 * Delays, in ms, at which the post-mutation invalidation is repeated.
 *
 * The backend indexes on-chain events asynchronously, so a single immediate
 * invalidation races ahead of the indexer and refetches the same stale data.
 * These retries cover the window until it catches up. They are a backstop:
 * the primary mechanism is the receipt push in `useDeposit` plus the 3s poll
 * that `useHasPendingTx` turns on while a transaction is unconfirmed.
 */
const RETRY_DELAYS_MS = [2000, 5000, 12000];

/**
 * Returns a function that invalidates all user/pool query data after a mutation,
 * immediately and then again on the retry ladder above.
 */
export function useInvalidateAfterMutation() {
  const queryClient = useQueryClient();

  return (address: string, poolAddress: string) => {
    invalidateAll(queryClient, address, poolAddress);
    for (const delay of RETRY_DELAYS_MS) {
      setTimeout(() => invalidateAll(queryClient, address, poolAddress), delay);
    }
  };
}
