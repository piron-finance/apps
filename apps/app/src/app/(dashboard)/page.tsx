"use client";

import { useState } from "react";
import { usePlatformMetrics } from "@/hooks/usePlatformData";
import { usePoolsData, useFeaturedPools } from "@/hooks/usePoolsData";
import {
  OverviewStrip,
  PoolCard,
  PoolSection,
  Sidebar,
} from "@/components/dashboard";
import { FirstRunStepper } from "@/components/dashboard/first-run-stepper";
import { PoolCardSkeletonGrid } from "@/components/dashboard/skeletons";
import { SelectField } from "@/components/ui/select-field";
import type { Pool } from "@/lib/api/types";
import { poolTypeLabel } from "@/lib/pool-helpers";
import { useChainContext, SUPPORTED_CHAINS } from "@/lib/context/ChainContext";

// ── Helpers ──────────────────────────────────────────────────────────────────
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
  return `${num.toFixed(1)}%`;
}

function getPoolTVL(pool: Pool): string {
  return pool.analytics?.totalValueLocked
    ? formatTVL(pool.analytics.totalValueLocked)
    : "$0";
}

function getPoolSubtitle(pool: Pool): string | undefined {
  if (pool.poolType === "STABLE_YIELD") {
    const nav = pool.analytics?.navPerShare;
    return nav ? `NAV ${parseFloat(nav).toFixed(4)} per share` : undefined;
  }
  if (pool.issuer) return `Issued by ${pool.issuer}`;
  return undefined;
}

function getPoolTiers(
  pool: Pool,
): { duration: string; rate: string }[] | undefined {
  if (pool.poolType !== "LOCKED" || !pool.lockTiers?.length) return undefined;
  return pool.lockTiers.map((t) => ({
    duration: `${t.lockDurationDays}d`,
    rate: `${parseFloat(t.interestRatePercent).toFixed(1)}%`,
  }));
}

/** The headline rate an investor shops on, per pool type. */
function getPoolRate(pool: Pool): { rate: string; rateLabel: string } {
  if (pool.poolType === "LOCKED" && pool.lockTiers?.length) {
    const rates = pool.lockTiers.map((t) => parseFloat(t.interestRatePercent));
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    return {
      rate: min === max ? `${max.toFixed(1)}%` : `${min.toFixed(1)}–${max.toFixed(1)}%`,
      rateLabel: "Fixed rate",
    };
  }
  if (pool.poolType === "SINGLE_ASSET" && pool.discountRate) {
    return {
      rate: `${(pool.discountRate / 100).toFixed(1)}%`,
      rateLabel: "Target APY",
    };
  }
  const apy = pool.projectedAPY ?? pool.analytics?.apy;
  return { rate: formatAPY(apy), rateLabel: "Current APY" };
}

function getFundingProgress(pool: Pool): number | undefined {
  if (pool.poolType !== "SINGLE_ASSET") return undefined;
  const target = pool.targetRaise ? parseFloat(pool.targetRaise) : 0;
  if (target <= 0) return undefined;
  const raised = parseFloat(pool.analytics?.totalValueLocked || "0");
  return Math.round((raised / target) * 100);
}

function getPoolMeta(pool: Pool): { label: string; value: string } | undefined {
  if (pool.maturityDate) {
    const days = Math.ceil(
      (new Date(pool.maturityDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
    if (days > 0) return { label: "Tenor", value: `${days}d` };
  }
  if (pool.analytics?.utilizationRate) {
    return {
      label: "At work",
      value: `${parseFloat(pool.analytics.utilizationRate).toFixed(0)}%`,
    };
  }
  return undefined;
}

/** Everything the card needs, derived once so the JSX below stays readable. */
function poolCardProps(pool: Pool, link: string) {
  const { rate, rateLabel } = getPoolRate(pool);
  const progress = getFundingProgress(pool);

  return {
    key: pool.id,
    poolId: pool.poolAddress,
    chainId: pool.chainId,
    type: poolTypeLabel(pool.poolType),
    asset: pool.assetSymbol,
    name: pool.name,
    rate,
    rateLabel,
    tvl: getPoolTVL(pool),
    tvlLabel: pool.poolType === "SINGLE_ASSET" ? "Raised" : "TVL",
    subtitle: getPoolSubtitle(pool),
    tiers: getPoolTiers(pool),
    meta: getPoolMeta(pool),
    progress,
    progressLabel:
      progress !== undefined
        ? `${formatTVL(pool.analytics?.totalValueLocked)} of ${formatTVL(pool.targetRaise || undefined)} raised · ${progress}%`
        : undefined,
    minInvestment: pool.minInvestment,
    tags: pool.tags?.slice(0, 2) || [],
    link,
  };
}

const GRID = "mt-6 grid grid-cols-1 gap-4 md:grid-cols-2";

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-border py-12 text-center">
      <p className="text-[13px] text-muted-foreground">{children}</p>
    </div>
  );
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

  // Featured pools: fetch all, then filter client-side by selected chain
  const allFeatured = featuredResponse?.data || [];
  const featuredPools =
    activeChainId !== undefined
      ? allFeatured.filter((p) => p.chainId === activeChainId)
      : allFeatured;

  const stableYieldPools = pools.filter((p) => p.poolType === "STABLE_YIELD");
  const lockedPools = pools.filter((p) => p.poolType === "LOCKED");
  const singleAssetPools = pools.filter((p) => p.poolType === "SINGLE_ASSET");

  // Filter options derived from the pools actually present, so a selection can
  // never lead to an empty "No pools" dead-end.
  const stableAssetOptions = [
    "All",
    ...Array.from(
      new Set(stableYieldPools.map((p) => p.assetSymbol).filter(Boolean)),
    ),
  ];
  const lockedDurationOptions = [
    "All",
    ...Array.from(
      new Set(
        lockedPools.flatMap(
          (p) => p.lockTiers?.map((t) => `${t.lockDurationDays}d`) ?? [],
        ),
      ),
    ),
  ];

  const filteredStablePools =
    activeAsset === "All"
      ? stableYieldPools
      : stableYieldPools.filter((p) => p.assetSymbol === activeAsset);

  const filteredLockedPools =
    activeDuration === "All"
      ? lockedPools
      : lockedPools.filter((p) =>
          p.lockTiers?.some((t) => `${t.lockDurationDays}d` === activeDuration),
        );

  // TVL change badge
  const tvlChangeNum = metrics?.tvlChange24hPercentage
    ? parseFloat(String(metrics.tvlChange24hPercentage))
    : null;
  const tvlChange =
    tvlChangeNum !== null && Math.abs(tvlChangeNum) < 99.5
      ? `${tvlChangeNum >= 0 ? "+" : ""}${tvlChangeNum.toFixed(1)}%`
      : tvlChangeNum !== null && tvlChangeNum > 0
        ? "New"
        : undefined;

  // Blended APY — use platform metric, fall back to manual calc from pools
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

  const activeChainLabel =
    SUPPORTED_CHAINS.find((o) => o.id === activeChainId)?.label ?? "All Chains";

  const chainHasNoPools =
    !poolsLoading && activeChainId !== undefined && pools.length === 0;

  function emptyFor(poolType: string) {
    return chainHasNoPools
      ? `No ${poolType} pools are deployed on ${activeChainLabel} yet. Switch networks from the header to see more.`
      : `No ${poolType} pools match this filter.`;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="max-w-2xl">
        <p className="eyebrow">Piron markets · {activeChainLabel}</p>
        <h1 className="mt-3 font-display text-[38px] leading-[1.05] tracking-[-0.015em] text-foreground sm:text-[46px]">
          Fixed income,
          <span className="text-brand-ink"> settled onchain</span>.
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
          Tokenized T-bills, fixed-rate deposits and single-deal credit — each
          with published terms, live NAV and wallet-native custody.
        </p>
      </header>

      {/* ── Platform overview ────────────────────────────────────────────── */}
      <div className="mt-8">
        <OverviewStrip
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
              subtitle: "Across every live pool on this network",
            },
            {
              label: "Live pools",
              value: String(pools.length),
              subtitle: `${stableYieldPools.length} Flexible · ${lockedPools.length} Fixed · ${singleAssetPools.length} Term`,
            },
            {
              label: "Blended APY",
              value: blendedAPY,
              subtitle: "TVL-weighted, net of fees",
            },
            {
              label: "24h flow",
              value: metrics?.netFlows24h
                ? formatTVL(metrics.netFlows24h)
                : "$0",
              subtitle: metrics?.volume24h
                ? `Volume: ${formatTVL(metrics.volume24h)}`
                : "Net deposits less withdrawals",
            },
          ]}
        />
      </div>

      {/* ── First-run onboarding (wallet-aware; auto-hides once done) ─────── */}
      <div className="mt-4">
        <FirstRunStepper />
      </div>

      <div className="mt-10 flex flex-col gap-10 xl:flex-row xl:gap-8">
        {/* ── Main column ──────────────────────────────────────────────── */}
        <div id="pools-start" className="min-w-0 flex-1 space-y-12">
          {/* Featured */}
          {featuredPools.length > 0 && (
            <PoolSection
              label="Featured"
              title="Top picks this week."
              subtitle="Curated pools with strong performance and deep liquidity."
            >
              <div className={GRID}>
                {featuredPools.slice(0, 2).map((pool) => (
                  <PoolCard
                    {...poolCardProps(pool, "Enter pool")}
                    key={pool.id}
                    featured
                  />
                ))}
              </div>
            </PoolSection>
          )}

          {/* Flexible Yield */}
          <PoolSection
            label="Flexible yield"
            title="Withdraw anytime. Earn daily."
            subtitle="NAV-priced pools holding T-bills and money market paper. Your capital works from day one."
            count={filteredStablePools.length}
            filters={
              stableAssetOptions.length > 2 ? (
                <SelectField
                  prefix="Asset"
                  value={activeAsset}
                  onChange={(e) => setActiveAsset(e.target.value)}
                >
                  {stableAssetOptions.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All" : c}
                    </option>
                  ))}
                </SelectField>
              ) : undefined
            }
          >
            <div className={GRID}>
              {poolsLoading ? (
                <PoolCardSkeletonGrid count={2} />
              ) : filteredStablePools.length === 0 ? (
                <EmptyState>{emptyFor("Flexible Yield")}</EmptyState>
              ) : (
                filteredStablePools.map((pool) => (
                  <PoolCard {...poolCardProps(pool, "Enter pool")} key={pool.id} />
                ))
              )}
            </div>
          </PoolSection>

          {/* Fixed Yield */}
          <PoolSection
            label="Fixed yield"
            title="Lock your rate. Skip the volatility."
            subtitle="Fixed-term deposits with the rate set at deposit. Choose when you receive interest — early exit costs you."
            count={filteredLockedPools.length}
            filters={
              lockedDurationOptions.length > 2 ? (
                <SelectField
                  prefix="Duration"
                  value={activeDuration}
                  onChange={(e) => setActiveDuration(e.target.value)}
                >
                  {lockedDurationOptions.map((d) => (
                    <option key={d} value={d}>
                      {d === "All" ? "All" : d}
                    </option>
                  ))}
                </SelectField>
              ) : undefined
            }
          >
            <div className={GRID}>
              {poolsLoading ? (
                <PoolCardSkeletonGrid count={2} />
              ) : filteredLockedPools.length === 0 ? (
                <EmptyState>{emptyFor("Fixed Yield")}</EmptyState>
              ) : (
                filteredLockedPools.map((pool) => (
                  <PoolCard
                    {...poolCardProps(pool, "Review terms")}
                    key={pool.id}
                  />
                ))
              )}
            </div>
          </PoolSection>

          {/* Term Deals */}
          <PoolSection
            label="Term deals"
            title="One deal. Full visibility."
            subtitle="Finance a specific receivable or credit facility. SPV-wrapped with documents onchain."
            count={singleAssetPools.length}
          >
            <div className={GRID}>
              {poolsLoading ? (
                <PoolCardSkeletonGrid count={2} />
              ) : singleAssetPools.length === 0 ? (
                <EmptyState>{emptyFor("Term Deal")}</EmptyState>
              ) : (
                singleAssetPools.map((pool) => (
                  <PoolCard
                    {...poolCardProps(pool, "View deal memo")}
                    key={pool.id}
                  />
                ))
              )}
            </div>
          </PoolSection>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
