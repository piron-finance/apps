"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProduct } from "@/hooks/useProductsData";
import { MetricRow } from "@/components/dashboard/stat-card";
import {
  ActivitySection,
  HoldingsSection,
  InvestPanel,
  NetworksSection,
  OverviewSection,
  PerformanceSection,
  TabBar,
} from "@/components/product";
import {
  aggregateNavSeries,
  sumTvl,
  weightedApy,
  weightedNav,
  type ChainScope,
} from "@/components/product/aggregate";
import { formatCompactUsd, formatNumber } from "@/components/product/formatters";
import {
  useDeploymentNavHistories,
  useDeploymentPools,
} from "@/components/product/use-deployments";
import { getChainName } from "@/lib/constants/chains";
import { poolTypeLabel } from "@/lib/pool-helpers";
import type { Product } from "@/lib/api/types";

/**
 * The fund page. One product is the subject; the networks it runs on are a
 * detail you pick at deposit time or inspect deliberately — never the shape of
 * the page.
 *
 * The page opens on **all networks**: money figures sum, per-unit rates are
 * TVL-weighted averages. Narrowing to one network is the same maths over an
 * array of one, so no section has to branch.
 */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "holdings", label: "Holdings" },
  { id: "networks", label: "Networks" },
  { id: "activity", label: "Activity" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProductDetailPage({
  params,
}: {
  params: { productKey: string };
}) {
  const { data: product, isLoading, error } = useProduct(params.productKey);

  if (isLoading) return <ProductSkeleton />;

  if (error || !product) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8">
        <p className="text-[14px] text-muted-foreground">Fund not found.</p>
        <Link
          href="/"
          className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded text-[13px] text-brand-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to markets
        </Link>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const [tab, setTab] = useState<TabId>("overview");
  const [scope, setScope] = useState<ChainScope>("all");

  // A scope that no longer matches any deployment falls back to the whole fund.
  const scopedInstances =
    scope === "all"
      ? product.instances
      : (product.instances.filter((i) => i.chainId === scope).length
          ? product.instances.filter((i) => i.chainId === scope)
          : product.instances);

  // A one-deployment fund is never "aggregated" — there's nothing to sum, so it
  // reads as a plain single-network fund throughout.
  const multi = product.instances.length > 1;
  const isAll =
    multi && (scope === "all" || scopedInstances.length === product.instances.length);
  const scopeLabel = isAll
    ? `all ${product.aggregates.instanceCount} networks`
    : getChainName(scopedInstances[0]!.chainId);

  // Detail for every deployment: the investor grand total needs all of them
  // regardless of scope, and the queries are shared with the scoped views.
  const { pools: allPools } = useDeploymentPools(product.instances);
  const scopedChainIds = new Set(scopedInstances.map((i) => i.chainId));
  const scopedPools = allPools.filter((p) => scopedChainIds.has(p.chainId));

  // NAV comes from the same snapshots the chart plots, so the headline figure and
  // the end of the line agree. `analytics.navPerShare` can lag them, so it's only
  // the fallback. The 30d key is shared with the chart's default — no extra fetch.
  const { streams } = useDeploymentNavHistories(scopedInstances, "30d");
  const navSeries = useMemo(
    () => aggregateNavSeries(streams.map((s) => s.data ?? [])),
    [streams],
  );
  const nav = navSeries.length
    ? navSeries[navSeries.length - 1]!.nav
    : weightedNav(scopedInstances);

  const apy = weightedApy(scopedInstances);
  const symbol = scopedInstances[0]?.assetSymbol ?? "";

  const rateLabel =
    product.poolType === "LOCKED"
      ? "Fixed rate"
      : product.poolType === "SINGLE_ASSET"
        ? "Target rate"
        : isAll && product.aggregates.instanceCount > 1
          ? "Blended APY"
          : "Current APY";

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-8 sm:px-8">
      <Link
        href="/"
        className="focus-ring -ml-1 inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Markets
      </Link>

      <ProductHeader product={product} />

      <div className="mt-8">
        <MetricRow
          items={[
            {
              label: "Assets under management",
              value: formatCompactUsd(sumTvl(scopedInstances)),
              subtitle: isAll
                ? product.aggregates.instanceCount > 1
                  ? `Summed across ${product.aggregates.instanceCount} networks`
                  : getChainName(scopedInstances[0]!.chainId)
                : getChainName(scopedInstances[0]!.chainId),
            },
            {
              label: rateLabel,
              value: apy != null ? `${apy.toFixed(2)}%` : "—",
              subtitle:
                isAll && product.aggregates.instanceCount > 1
                  ? "TVL-weighted across networks"
                  : "Annualised",
            },
            {
              label: "NAV per share",
              value: nav != null ? formatNumber(nav, 4) : "—",
              subtitle:
                isAll && product.aggregates.instanceCount > 1
                  ? `${symbol} · weighted average`
                  : `${symbol} · ${getChainName(scopedInstances[0]!.chainId)}`,
            },
            {
              label: "Risk rating",
              value: product.riskRating || "Unrated",
              subtitle: product.securityType || poolTypeLabel(product.poolType),
            },
          ]}
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <div className="min-w-0">
          <TabBar
            tabs={TABS.map((t) =>
              t.id === "networks"
                ? { ...t, count: product.aggregates.instanceCount }
                : t,
            )}
            active={tab}
            onChange={setTab}
          />

          <div
            role="tabpanel"
            id={`product-panel-${tab}`}
            aria-labelledby={`product-tab-${tab}`}
            className="pt-8"
          >
            {tab === "overview" && (
              <div className="space-y-10">
                <OverviewSection
                  product={product}
                  scopedInstances={scopedInstances}
                  scopedPools={scopedPools}
                  allPools={allPools}
                />
                {product.poolType === "STABLE_YIELD" && (
                  <PerformanceSection
                    instances={scopedInstances}
                    scopeLabel={scopeLabel}
                    isAll={isAll}
                  />
                )}
              </div>
            )}

            {tab === "holdings" && (
              <HoldingsSection
                instances={scopedInstances}
                scopeLabel={scopeLabel}
                isAll={isAll}
              />
            )}

            {tab === "networks" && (
              <NetworksSection
                product={product}
                scope={scope}
                onScopeChange={setScope}
                pools={scopedPools}
              />
            )}

            {tab === "activity" && (
              <ActivitySection
                instances={scopedInstances}
                scopeLabel={scopeLabel}
                isAll={isAll}
              />
            )}
          </div>
        </div>

        <InvestPanel
          product={product}
          scope={scope}
          instances={scopedInstances}
          onScopeChange={setScope}
        />
      </div>
    </div>
  );
}

function ProductHeader({ product }: { product: Product }) {
  const meta = [
    product.issuer,
    product.securityType,
    product.region || product.country,
  ].filter(Boolean) as string[];

  const isActive = product.aggregates.combinedStatus === "ACTIVE";

  return (
    <header className="mt-6 flex items-start gap-4">
      {product.issuerLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.issuerLogo}
          alt={product.issuer || product.name}
          className="mt-1 h-11 w-11 shrink-0 rounded-full border border-border object-cover"
        />
      ) : (
        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[16px] font-semibold text-brand-ink">
          {product.name?.[0]?.toUpperCase() || "P"}
        </div>
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-subtle-foreground">
            {poolTypeLabel(product.poolType)}
          </span>
          {product.aggregates.combinedStatus && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${
                isActive
                  ? "bg-brand-soft text-brand-ink"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isActive ? "animate-pulse bg-brand" : "bg-current opacity-60"}`}
              />
              {isActive ? "Open" : "Closed"}
            </span>
          )}
        </div>

        <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-display text-foreground sm:text-[32px]">
          {product.name}
        </h1>

        {meta.length > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted-foreground">
            {meta.map((m, i) => (
              <span key={m} className="flex items-center gap-2">
                {i > 0 && <span className="text-subtle-foreground">·</span>}
                {m}
              </span>
            ))}
          </p>
        )}
      </div>
    </header>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-8 sm:px-8">
      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      <div className="mt-8 flex items-start gap-4">
        <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          <div className="h-8 w-80 max-w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-56 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mt-10 h-28 animate-pulse rounded bg-muted" />
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
