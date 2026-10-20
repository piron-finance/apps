"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/endpoints";

/**
 * Product-first data. A product groups per-chain pool instances; chain is a
 * deposit-time detail. Deposits/withdrawals still go through the pool hooks
 * (instances are the transaction unit) — these are for browse/detail only.
 */

export function useProductsData(chainId?: number, networkId?: string) {
  return useQuery({
    // Keyed on both, so switching between two networks does not serve the other's
    // cached rows. networkId is the identity that can name every runtime.
    queryKey: ["products", networkId ?? chainId ?? "all"],
    queryFn: () => productsApi.getAll(chainId, networkId),
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
