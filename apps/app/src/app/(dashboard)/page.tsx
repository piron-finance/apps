"use client";

import { useState } from "react";
import { usePlatformMetrics } from "@/hooks/usePlatformData";
import { useProductsData, useFeaturedProducts } from "@/hooks/useProductsData";
import { MetricRow } from "@/components/dashboard/stat-card";
import { PoolSection } from "@/components/dashboard/pool-section";
import {
  PoolCardGrid,
  type PoolCardData,
  type PoolAccent,
} from "@/components/dashboard/pool-card";
import { Sidebar } from "@/components/dashboard/sidebar";
import { FirstRunStepper } from "@/components/dashboard/first-run-stepper";
import { SelectField } from "@/components/ui/select-field";
import type { Product } from "@/lib/api/types";
import { useChainContext, SUPPORTED_CHAINS } from "@/lib/context/ChainContext";

// ── Formatting ───────────────────────────────────────────────────────────────
function formatTVL(value: string | undefined): string {
  if (!value) return "$0";
  const num = parseFloat(value);
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

function formatAPY(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return `${num.toFixed(2)}%`;
}

// ── Product → card ───────────────────────────────────────────────────────────
const KIND: Record<
  string,
  { kind: string; accent: PoolAccent; rateLabel: string }
> = {
  STABLE_YIELD: {
    kind: "Flexible yield",
    accent: "brand",
    rateLabel: "Blended APY",
  },
  LOCKED: { kind: "Fixed yield", accent: "info", rateLabel: "Fixed rate" },
  SINGLE_ASSET: {
    kind: "Term deal",
    accent: "warning",
    rateLabel: "Target APY",
  },
};

function productCard(product: Product): PoolCardData {
  const k = KIND[product.poolType] ?? KIND.STABLE_YIELD;
  const asset = product.instances[0]?.assetSymbol ?? "";
  const minInvestment = product.instances[0]?.minInvestment;
  const count = product.aggregates.instanceCount;
  return {
    id: product.productKey,
    poolId: product.instances[0]?.poolAddress ?? product.productKey,
    productKey: product.productKey,
    chains: product.aggregates.chains,
    kind: k.kind,
    accent: k.accent,
    name: product.name,
    asset,
    subtitle: product.issuer ?? undefined,
    rate: formatAPY(product.aggregates.blendedApy),
    rateLabel: k.rateLabel,
    footnotes: [
      {
        label: count > 1 ? "TVL (all networks)" : "TVL",
        value: formatTVL(product.aggregates.totalTvl),
      },
      {
        label: "Min",
        value: minInvestment
          ? `${parseFloat(minInvestment).toLocaleString()} ${asset}`
          : "—",
      },
    ],
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeAsset, setActiveAsset] = useState("All");
  const { activeChainId } = useChainContext();

  const { data: metrics } = usePlatformMetrics(activeChainId);
  const { data: productsResponse, isLoading: poolsLoading } =
    useProductsData(activeChainId);
  const { data: featuredData } = useFeaturedProducts();

  const products = productsResponse?.data || [];

  const allFeatured = featuredData || [];
  const featuredProducts =
    activeChainId !== undefined
      ? allFeatured.filter((p) => p.aggregates.chains.includes(activeChainId))
      : allFeatured;

  const stableProducts = products.filter((p) => p.poolType === "STABLE_YIELD");
  const lockedProducts = products.filter((p) => p.poolType === "LOCKED");
  const termProducts = products.filter((p) => p.poolType === "SINGLE_ASSET");

  const assetOptions = [
    "All",
    ...Array.from(
      new Set(
        stableProducts
          .map((p) => p.instances[0]?.assetSymbol)
          .filter((s): s is string => !!s),
      ),
    ),
  ];

  const filteredStable =
    activeAsset === "All"
      ? stableProducts
      : stableProducts.filter(
          (p) => p.instances[0]?.assetSymbol === activeAsset,
        );

  const filteredLocked = lockedProducts;

  const tvlChangeNum = metrics?.tvlChange24hPercentage
    ? parseFloat(String(metrics.tvlChange24hPercentage))
    : null;
  const tvlChange =
    tvlChangeNum !== null && Math.abs(tvlChangeNum) < 99.5
      ? `${tvlChangeNum >= 0 ? "+" : ""}${tvlChangeNum.toFixed(1)}%`
      : undefined;

  // Blended APY — use the platform metric, fall back to a TVL-weighted calc
  // across products' aggregated numbers.
  const blendedAPY = (() => {
    if (metrics?.averageAPY && parseFloat(String(metrics.averageAPY)) > 0) {
      return formatAPY(metrics.averageAPY);
    }
    let totalWeight = 0;
    let weightedSum = 0;
    for (const p of products) {
      const tvl = parseFloat(p.aggregates.totalTvl || "0");
      const apy = p.aggregates.blendedApy;
      if (tvl <= 0 || apy == null) continue;
      weightedSum += apy * tvl;
      totalWeight += tvl;
    }
    return totalWeight > 0 ? formatAPY(weightedSum / totalWeight) : "—";
  })();

  const chainLabel =
    SUPPORTED_CHAINS.find((o) => o.id === activeChainId)?.label ?? "All chains";

  const noPoolsOnChain =
    !poolsLoading && activeChainId !== undefined && products.length === 0;

  const emptyFor = (kind: string) =>
    noPoolsOnChain
      ? `No products are available on ${chainLabel} yet. Switch networks from the header.`
      : `No ${kind} products match the current filter.`;

  return (
    <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
      <FirstRunStepper />

      {/* ── Page header ────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-10 pt-14">
        <div className="max-w-2xl">
          <h1 className="text-[27px] font-semibold leading-none tracking-display text-foreground">
            Markets
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            Tokenized treasuries, fixed-rate deposits and single-deal credit.
            Published terms, live NAV, wallet-native custody.
          </p>
        </div>
        <p className="text-[12.5px] text-subtle-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{chainLabel}</span>
        </p>
      </header>

      {/* ── Headline figures ───────────────────────────────────────────── */}
      <MetricRow
        items={[
          {
            label: "Total value locked",
            value:
              metrics?.totalValueLockedFormatted ||
              formatTVL(metrics?.totalValueLocked) ||
              "$0",
            badge: tvlChange,
            badgeTone:
              tvlChangeNum !== null && tvlChangeNum < 0
                ? "negative"
                : "positive",
            subtitle: "Across every live pool",
          },
          {
            label: "Live products",
            value: String(products.length),
            subtitle: `${stableProducts.length} flexible · ${lockedProducts.length} fixed · ${termProducts.length} term`,
          },
          {
            label: "Blended APY",
            value: blendedAPY,
            subtitle: "TVL-weighted, net of fees",
          },
          {
            label: "24h net flow",
            value: metrics?.netFlows24h ? formatTVL(metrics.netFlows24h) : "$0",
            subtitle: metrics?.volume24h
              ? `Volume ${formatTVL(metrics.volume24h)}`
              : "Deposits less withdrawals",
          },
        ]}
      />

      {/* ── Markets + rail, both starting on the same baseline ─────────── */}
      <div className="flex flex-col gap-14 pb-6 pt-14 xl:flex-row xl:gap-12">
        <div id="pools-start" className="min-w-0 flex-1 space-y-16">
          {featuredProducts.length > 0 && (
            <PoolSection
              title="Featured"
              description="Curated products with strong performance and deep liquidity."
              count={featuredProducts.length}
            >
              <PoolCardGrid
                pools={featuredProducts.slice(0, 3).map(productCard)}
                emptyMessage="Nothing featured right now."
              />
            </PoolSection>
          )}

          <PoolSection
            title="Flexible yield"
            description="NAV-priced pools holding treasuries and money market paper. Withdraw any time; capital works from day one."
            count={filteredStable.length}
            filters={
              assetOptions.length > 2 ? (
                <SelectField
                  prefix="Asset"
                  value={activeAsset}
                  onChange={(e) => setActiveAsset(e.target.value)}
                >
                  {assetOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </SelectField>
              ) : undefined
            }
          >
            <PoolCardGrid
              loading={poolsLoading}
              pools={filteredStable.map(productCard)}
              emptyMessage={emptyFor("flexible yield")}
            />
          </PoolSection>

          <PoolSection
            title="Fixed yield"
            description="Fixed-term deposits with the rate set at deposit. Choose when you receive interest; early exit carries a penalty."
            count={filteredLocked.length}
          >
            <PoolCardGrid
              loading={poolsLoading}
              pools={filteredLocked.map(productCard)}
              emptyMessage={emptyFor("fixed yield")}
            />
          </PoolSection>

          <PoolSection
            title="Term deals"
            description="Finance a specific receivable or credit facility. SPV-wrapped, with deal documents onchain."
            count={termProducts.length}
          >
            <PoolCardGrid
              loading={poolsLoading}
              pools={termProducts.map(productCard)}
              emptyMessage={emptyFor("term deal")}
            />
          </PoolSection>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
