"use client";

import axios from "axios";
import { useQueries } from "@tanstack/react-query";
import { poolsApi, transactionsApi, usersApi } from "@/lib/api/endpoints";
import type {
  Instrument,
  NAVHistoryResponse,
  Pool,
  PoolInstrumentsResponse,
  ProductInstance,
  Transaction,
  UserPosition,
} from "@/lib/api/types";

const is404 = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

/**
 * Fan-out fetches across a product's deployments.
 *
 * Query keys deliberately mirror the single-pool hooks in `usePoolsData` /
 * `useTransactions`, so scoping to one network reuses the cached entry rather
 * than issuing a second request for the same thing.
 */

export function useDeploymentPools(instances: ProductInstance[]): {
  pools: Pool[];
  byChain: Map<number, Pool>;
  isLoading: boolean;
} {
  const results = useQueries({
    queries: instances.map((instance) => ({
      queryKey: ["pool", instance.poolAddress],
      queryFn: () => poolsApi.getById(instance.poolAddress),
      staleTime: 30_000,
      retry: 2,
    })),
  });

  const pools = results
    .map((r) => r.data)
    .filter((p): p is Pool => Boolean(p));

  return {
    pools,
    byChain: new Map(pools.map((p) => [p.chainId, p])),
    isLoading: results.some((r) => r.isLoading),
  };
}

export function useDeploymentNavHistories(
  instances: ProductInstance[],
  period: string,
): { streams: NAVHistoryResponse[]; isLoading: boolean } {
  const results = useQueries({
    queries: instances.map((instance) => ({
      queryKey: ["pool-nav-history", instance.poolAddress, period, "daily"],
      queryFn: () => poolsApi.getNavHistory(instance.poolAddress, period, "daily"),
      staleTime: 300_000,
      retry: 0,
    })),
  });

  return {
    streams: results
      .map((r) => r.data)
      .filter((d): d is NAVHistoryResponse => Boolean(d)),
    isLoading: results.some((r) => r.isLoading),
  };
}

/** Instruments across the scoped deployments, each tagged with its network. */
export function useDeploymentInstruments(instances: ProductInstance[]): {
  instruments: (Instrument & { chainId: number })[];
  active: number;
  matured: number;
  isLoading: boolean;
} {
  const results = useQueries({
    queries: instances.map((instance) => ({
      queryKey: ["pool-instruments", instance.poolAddress],
      queryFn: () => poolsApi.getInstruments(instance.poolAddress),
      staleTime: 300_000,
      retry: 2,
    })),
  });

  const instruments: (Instrument & { chainId: number })[] = [];
  let active = 0;
  let matured = 0;

  results.forEach((result, index) => {
    const data = result.data as PoolInstrumentsResponse | undefined;
    if (!data) return;
    const chainId = instances[index]!.chainId;
    for (const instrument of data.instruments) {
      instruments.push({ ...instrument, chainId });
    }
    active += data.summary?.active ?? 0;
    matured += data.summary?.matured ?? 0;
  });

  instruments.sort(
    (a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime(),
  );

  return {
    instruments,
    active,
    matured,
    isLoading: results.some((r) => r.isLoading),
  };
}

/**
 * The wallet's position in each scoped deployment.
 *
 * `useUserPositions` is scoped to ChainContext's active chain, which can't
 * answer "what do I hold in this fund overall" — so we ask each pool directly.
 * A 404 just means no deposit yet.
 */
export function useDeploymentPositions(
  instances: ProductInstance[],
  walletAddress?: string,
): { positions: UserPosition[]; isLoading: boolean } {
  const results = useQueries({
    queries: instances.map((instance) => ({
      queryKey: ["user-position", walletAddress, instance.poolAddress],
      queryFn: async () => {
        try {
          return await usersApi.getPositionInPool(walletAddress!, instance.poolAddress);
        } catch (error) {
          if (is404(error)) return null;
          throw error;
        }
      },
      enabled: !!walletAddress,
      staleTime: 30_000,
      retry: (failureCount: number, error: unknown) =>
        is404(error) ? false : failureCount < 1,
    })),
  });

  return {
    positions: results
      .map((r) => r.data)
      .filter((p): p is UserPosition => Boolean(p)),
    isLoading: results.some((r) => r.isLoading),
  };
}

/** Transactions across the scoped deployments, newest first. */
export function useDeploymentTransactions(
  instances: ProductInstance[],
  limit = 25,
): { transactions: (Transaction & { chainId: number })[]; isLoading: boolean } {
  const results = useQueries({
    queries: instances.map((instance) => ({
      queryKey: ["pool-transactions", instance.poolAddress, { limit }],
      queryFn: () => transactionsApi.getPoolTransactions(instance.poolAddress, { limit }),
      staleTime: 10_000,
      retry: 2,
    })),
  });

  const transactions: (Transaction & { chainId: number })[] = [];
  results.forEach((result, index) => {
    const chainId = instances[index]!.chainId;
    for (const tx of result.data?.data ?? []) {
      // The row's own chainId is authoritative when present.
      transactions.push({ ...tx, chainId: tx.chainId ?? chainId });
    }
  });

  transactions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return {
    transactions: transactions.slice(0, limit),
    isLoading: results.some((r) => r.isLoading),
  };
}
