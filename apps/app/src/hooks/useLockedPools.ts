"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { poolsApi, lockedPositionsApi, usersApi } from "@/lib/api/endpoints";
import { useHasPendingTx } from "@/lib/context/PendingTxContext";
import { LIVE_POLL_MS, RESTING_POLL_MS, RESTING_USER_POLL_MS } from "@/lib/constants/polling";
import { useInvestorWallets } from "./useInvestorWallets";

/**
 * Hook to fetch lock tiers for a pool
 */
export function usePoolTiers(poolAddress?: string) {
  return useQuery({
    queryKey: ["pool-tiers", poolAddress],
    queryFn: () => poolsApi.getTiers(poolAddress!),
    enabled: !!poolAddress,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to fetch locked pool live metrics
 */
export function useLockedPoolMetrics(chainId?: number, poolAddress?: string) {
  const hasPending = useHasPendingTx();
  return useQuery({
    queryKey: ["locked-pool-metrics", chainId, poolAddress],
    queryFn: () => poolsApi.getLockedMetrics(chainId!, poolAddress!),
    enabled: !!chainId && !!poolAddress,
    staleTime: hasPending ? 0 : 30000,
    refetchInterval: hasPending ? LIVE_POLL_MS : RESTING_POLL_MS,
    retry: 2,
  });
}

/**
 * Hook to preview a locked deposit
 */
export function useLockedDepositPreview(
  chainId?: number,
  poolAddress?: string,
  amount?: string,
  tierIndex?: number
) {
  return useQuery({
    queryKey: ["locked-deposit-preview", chainId, poolAddress, amount, tierIndex],
    queryFn: () => poolsApi.previewLockedDeposit(chainId!, poolAddress!, amount!, tierIndex!),
    enabled: !!chainId && !!poolAddress && !!amount && tierIndex !== undefined && parseFloat(amount) > 0,
    staleTime: 10000,
    retry: 1,
  });
}

/**
 * Hook to preview early exit from locked position
 */
export function useEarlyExitPreview(positionRowId?: string) {
  return useQuery({
    queryKey: ["early-exit-preview", positionRowId],
    queryFn: () => lockedPositionsApi.previewEarlyExit(positionRowId!),
    enabled: !!positionRowId,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook to fetch user's locked positions
 */
export function useUserLockedPositions(walletAddress?: string) {
  const hasPending = useHasPendingTx();
  return useQuery({
    queryKey: ["user-locked-positions", walletAddress],
    queryFn: () => usersApi.getLockedPositions(walletAddress!),
    enabled: !!walletAddress,
    // A locked deposit creates its LockedPosition record via the burst indexer,
    // so poll hard while one is in flight and let the pending row cover the gap.
    staleTime: hasPending ? 0 : 30000,
    refetchInterval: hasPending ? LIVE_POLL_MS : RESTING_USER_POLL_MS,
    retry: 2,
  });
}

/**
 * Locked positions across every connected wallet.
 *
 * A position is keyed on the address that holds it, and an investor may hold them through
 * more than one wallet — an EVM position through wagmi and a Stellar one through
 * Freighter. Asking only about the EVM address is why a Stellar holder saw an empty
 * portfolio while connected.
 *
 * One query per wallet rather than one combined request: the backend keys this endpoint
 * on a single address, and merging here keeps each wallet's result independently
 * cacheable and independently refetchable.
 */
export function useAllLockedPositions() {
  const wallets = useInvestorWallets();
  const hasPending = useHasPendingTx();

  const queries = useQueries({
    queries: wallets.map((wallet) => ({
      queryKey: ["user-locked-positions", wallet.address],
      queryFn: () => usersApi.getLockedPositions(wallet.address),
      staleTime: hasPending ? 0 : 30000,
      refetchInterval: hasPending ? LIVE_POLL_MS : RESTING_USER_POLL_MS,
      retry: 2,
    })),
  });

  return {
    positions: queries.flatMap((q) => {
      const data = q.data as unknown;
      if (Array.isArray(data)) return data;
      const rows = (data as { positions?: unknown[]; data?: unknown[] } | undefined);
      return rows?.positions ?? rows?.data ?? [];
    }),
    // Loading only while nothing has arrived: one slow wallet should not hide the
    // positions another has already returned.
    isLoading: queries.length > 0 && queries.every((q) => q.isLoading),
    isError: queries.length > 0 && queries.every((q) => q.isError),
    refetch: () => Promise.all(queries.map((q) => q.refetch())),
  };
}
