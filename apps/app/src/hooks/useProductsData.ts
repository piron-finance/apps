"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/endpoints";

/**
 * Product-first data. A product groups per-chain pool instances; chain is a
 * deposit-time detail. Deposits/withdrawals still go through the pool hooks
 * (instances are the transaction unit) — these are for browse/detail only.
 */

export function useProductsData(chainId?: number) {
  return useQuery({
    queryKey: ["products", chainId ?? "all"],
    queryFn: () => productsApi.getAll(chainId),
    staleTime: 30_000,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getFeatured(),
    staleTime: 30_000,
  });
}

export function useProduct(productKey?: string) {
  return useQuery({
    queryKey: ["product", productKey],
    queryFn: () => productsApi.getByKey(productKey as string),
    enabled: !!productKey,
    staleTime: 30_000,
  });
}
