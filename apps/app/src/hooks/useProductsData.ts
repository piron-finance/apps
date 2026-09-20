"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/endpoints";
import { isChainDisabled } from "@/lib/constants/disabled-chains";
import type { Product, ProductsResponse } from "@/lib/api/types";

/**
 * Product-first data. A product groups per-chain pool instances; chain is a
 * deposit-time detail. Deposits/withdrawals still go through the pool hooks
 * (instances are the transaction unit) — these are for browse/detail only.
 */

/**
 * Strips disabled chains from a product: instances on those chains are removed,
 * and the aggregate chain list is narrowed to match.
 *
 * Hiding a chain in the selector is not enough on its own. All Chains sends no
 * chainId at all, so the API returns every instance including the hidden ones.
 */
function stripFromProduct(product: Product): Product {
  const instances = product.instances.filter((i) => !isChainDisabled(i.chainId));
  return {
    ...product,
    instances,
    aggregates: {
      ...product.aggregates,
      chains: product.aggregates.chains.filter((id) => !isChainDisabled(id)),
      instanceCount: instances.length,
    },
  };
}

/** A product with no instances left is dropped entirely. */
function stripDisabledChains(products: Product[]): Product[] {
  return products.map(stripFromProduct).filter((p) => p.instances.length > 0);
}

export function useProductsData(chainId?: number) {
  return useQuery({
    queryKey: ["products", chainId ?? "all"],
    queryFn: () => productsApi.getAll(chainId),
    select: (res: ProductsResponse): ProductsResponse => ({
      ...res,
      data: stripDisabledChains(res.data ?? []),
    }),
    staleTime: 30_000,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getFeatured(),
    select: stripDisabledChains,
    staleTime: 30_000,
  });
}

export function useProduct(productKey?: string) {
  return useQuery({
    queryKey: ["product", productKey],
    queryFn: () => productsApi.getByKey(productKey as string),
    select: stripFromProduct,
    enabled: !!productKey,
    staleTime: 30_000,
  });
}
