"use client";

import { useState } from "react";
import { usePlatformMetrics } from "@/hooks/usePlatformData";
import { usePoolsData, useFeaturedPools } from "@/hooks/usePoolsData";
import { MetricRow } from "@/components/dashboard/stat-card";
import { PoolSection } from "@/components/dashboard/pool-section";
import { PoolCardGrid, type PoolCardData } from "@/components/dashboard/pool-card";
import { Sidebar } from "@/components/dashboard/sidebar";
import { FirstRunStepper } from "@/components/dashboard/first-run-stepper";
import { SelectField } from "@/components/ui/select-field";
import type { Pool } from "@/lib/api/types";
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

function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
  return days > 0 ? days : null;
}

// ── Card mapping, one function per pool type ─────────────────────────────────
function flexibleCard(pool: Pool): PoolCardData {
  const nav = pool.analytics?.navPerShare;
  const utilization = pool.analytics?.utilizationRate;
  return {
    id: pool.id,
    poolId: pool.poolAddress,
    chainId: pool.chainId,
    kind: "Flexible yield",
    accent: "brand" as const,
    name: pool.name,
    asset: pool.assetSymbol,
    subtitle: nav ? `NAV ${parseFloat(nav).toFixed(4)}` : (pool.issuer ?? undefined),
    rate: formatAPY(pool.projectedAPY ?? pool.analytics?.apy),
    rateLabel: "Current APY",
    footnotes: [
      { label: "TVL", value: formatTVL(pool.analytics?.totalValueLocked) },
      utilization
        ? { label: "At work", value: `${parseFloat(utilization).toFixed(0)}%` }
        : {
            label: "Min",
            value: pool.minInvestment
              ? `${parseFloat(pool.minInvestment).toLocaleString()} ${pool.assetSymbol}`
              : "—",
          },
    ],
  };
}

function fixedCard(pool: Pool): PoolCardData {
  const rates = (pool.lockTiers ?? []).map((t) =>
    parseFloat(t.interestRatePercent),
  );
  const durations = (pool.lockTiers ?? []).map((t) => t.lockDurationDays);
  const rate = rates.length
    ? Math.min(...rates) === Math.max(...rates)
      ? `${Math.max(...rates).toFixed(2)}%`
      : `${Math.min(...rates).toFixed(1)}–${Math.max(...rates).toFixed(1)}%`
    : "—";
  const term = durations.length
    ? Math.min(...durations) === Math.max(...durations)
      ? `${Math.max(...durations)}d`
      : `${Math.min(...durations)}–${Math.max(...durations)}d`
    : undefined;

  return {
    id: pool.id,
    poolId: pool.poolAddress,
    chainId: pool.chainId,
    kind: "Fixed yield",
    accent: "info" as const,
    name: pool.name,
    asset: pool.assetSymbol,
    subtitle: pool.lockTiers?.length
      ? `${pool.lockTiers.length} lock tiers`
      : (pool.issuer ?? undefined),
    rate,
    rateLabel: "Fixed rate",
    footnotes: [
      { label: "TVL", value: formatTVL(pool.analytics?.totalValueLocked) },
      { label: "Term", value: term ?? "—" },
    ],
  };
}

function termCard(pool: Pool): PoolCardData {
  const target = pool.targetRaise ? parseFloat(pool.targetRaise) : 0;
  const raised = parseFloat(pool.analytics?.totalValueLocked || "0");
  const progress = target > 0 ? Math.round((raised / target) * 100) : undefined;
  const tenor = daysUntil(pool.maturityDate);

  return {
    id: pool.id,
    poolId: pool.poolAddress,
    chainId: pool.chainId,
    kind: "Term deal",
    accent: "warning" as const,
    name: pool.name,
    asset: pool.assetSymbol,
    subtitle: pool.issuer ?? undefined,
    rate: pool.discountRate ? `${(pool.discountRate / 100).toFixed(2)}%` : "—",
    rateLabel: "Target APY",
    footnotes: [
      { label: "Raised", value: formatTVL(pool.analytics?.totalValueLocked) },
      { label: "Tenor", value: tenor ? `${tenor}d` : "—" },
    ],
    progress,
    progressLabel:
      progress !== undefined
        ? `${progress}% of ${formatTVL(pool.targetRaise || undefined)} target`
        : undefined,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeDuration, setActiveDuration] = useState("All");
  const [activeAsset, setActiveAsset] = useState("All");
  // Global ChainContext — set from the header, shared with the portfolio page.
  const { activeChainId } = useChainContext();

  const { data: metrics } = usePlatformMetrics(activeChainId);
  const { data: poolsResponse, isLoading: poolsLoading } = usePoolsData(
    activeChainId !== undefined ? { chainId: activeChainId } : undefined,
  );
  const { data: featuredResponse } = useFeaturedPools();

  const pools = poolsResponse?.data || [];

  const allFeatured = featuredResponse?.data || [];
  const featuredPools =
    activeChainId !== undefined
      ? allFeatured.filter((p) => p.chainId === activeChainId)
      : allFeatured;

  const stableYieldPools = pools.filter((p) => p.poolType === "STABLE_YIELD");
  const lockedPools = pools.filter((p) => p.poolType === "LOCKED");
  const singleAssetPools = pools.filter((p) => p.poolType === "SINGLE_ASSET");

  // Filter options derive from the pools actually present, so a selection can
  // never lead to an empty dead-end.
  const assetOptions = [
    "All",
    ...Array.from(
      new Set(stableYieldPools.map((p) => p.assetSymbol).filter(Boolean)),
    ),
  ];
  const durationOptions = [
    "All",
    ...Array.from(
      new Set(
        lockedPools.flatMap(
          (p) => p.lockTiers?.map((t) => `${t.lockDurationDays}d`) ?? [],
        ),
      ),
    ),
  ];

  const filteredStable =
    activeAsset === "All"
      ? stableYieldPools
      : stableYieldPools.filter((p) => p.assetSymbol === activeAsset);

  const filteredLocked =
    activeDuration === "All"
      ? lockedPools
      : lockedPools.filter((p) =>
          p.lockTiers?.some((t) => `${t.lockDurationDays}d` === activeDuration),
        );

  const tvlChangeNum = metrics?.tvlChange24hPercentage
    ? parseFloat(String(metrics.tvlChange24hPercentage))
    : null;
  const tvlChange =
    tvlChangeNum !== null && Math.abs(tvlChangeNum) < 99.5
      ? `${tvlChangeNum >= 0 ? "+" : ""}${tvlChangeNum.toFixed(1)}%`
      : undefined;

  // Blended APY — use the platform metric, fall back to a TVL-weighted calc.
  const blendedAPY = (() => {
    if (metrics?.averageAPY && parseFloat(String(metrics.averageAPY)) > 0) {
      return formatAPY(metrics.averageAPY);
    }
    let totalWeight = 0;
    let weightedSum = 0;
    for (const pool of pools) {
      const tvl = parseFloat(pool.analytics?.totalValueLocked || "0");
      if (tvl <= 0) continue;
      let apy = 0;
      if (pool.poolType === "SINGLE_ASSET" && pool.discountRate) {
        apy = pool.discountRate / 100;
      } else if (pool.projectedAPY) {
        apy = parseFloat(String(pool.projectedAPY));
      } else if (pool.analytics?.apy) {
        apy = parseFloat(pool.analytics.apy);
      }
      weightedSum += apy * tvl;
      totalWeight += tvl;
    }
    return totalWeight > 0 ? formatAPY(weightedSum / totalWeight) : "—";
  })();

  const chainLabel =
    SUPPORTED_CHAINS.find((o) => o.id === activeChainId)?.label ?? "All chains";

  const noPoolsOnChain =
    !poolsLoading && activeChainId !== undefined && pools.length === 0;

  const emptyFor = (kind: string) =>
    noPoolsOnChain
      ? `No pools are deployed on ${chainLabel} yet. Switch networks from the header.`
      : `No ${kind} pools match the current filter.`;

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
            label: "Live pools",
            value: String(pools.length),
            subtitle: `${stableYieldPools.length} flexible · ${lockedPools.length} fixed · ${singleAssetPools.length} term`,
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
          {featuredPools.length > 0 && (
            <PoolSection
              title="Featured"
              description="Curated pools with strong performance and deep liquidity."
              count={featuredPools.length}
            >
              <PoolCardGrid
                pools={featuredPools.slice(0, 3).map((p) =>
                  p.poolType === "LOCKED"
                    ? fixedCard(p)
                    : p.poolType === "SINGLE_ASSET"
                      ? termCard(p)
                      : flexibleCard(p),
                )}
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
              pools={filteredStable.map(flexibleCard)}
              emptyMessage={emptyFor("flexible yield")}
            />
          </PoolSection>

          <PoolSection
            title="Fixed yield"
            description="Fixed-term deposits with the rate set at deposit. Choose when you receive interest; early exit carries a penalty."
            count={filteredLocked.length}
            filters={
              durationOptions.length > 2 ? (
                <SelectField
                  prefix="Term"
                  value={activeDuration}
                  onChange={(e) => setActiveDuration(e.target.value)}
                >
                  {durationOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </SelectField>
              ) : undefined
            }
          >
            <PoolCardGrid
              loading={poolsLoading}
              pools={filteredLocked.map(fixedCard)}
              emptyMessage={emptyFor("fixed yield")}
            />
          </PoolSection>

          <PoolSection
            title="Term deals"
            description="Finance a specific receivable or credit facility. SPV-wrapped, with deal documents onchain."
            count={singleAssetPools.length}
          >
            <PoolCardGrid
              loading={poolsLoading}
              pools={singleAssetPools.map(termCard)}
              emptyMessage={emptyFor("term deal")}
            />
          </PoolSection>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
