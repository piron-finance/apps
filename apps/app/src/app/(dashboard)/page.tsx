"use client";

import { useState } from "react";
import { usePlatformMetrics } from "@/hooks/usePlatformData";
import { usePoolsData, useFeaturedPools } from "@/hooks/usePoolsData";
import {
  StatCard,
  PoolCard,
  PoolSection,
  Sidebar,
} from "@/components/dashboard";
import type { Pool } from "@/lib/api/types";

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
    return nav ? `NAV Price: ${parseFloat(nav).toFixed(4)} / share` : undefined;
  }
  if (pool.poolType === "SINGLE_ASSET") {
    const rate = pool.discountRate ? pool.discountRate / 100 : null;
    return rate ? `Target APY: ${rate.toFixed(1)}%` : undefined;
  }
  // LOCKED — subtitle handled by tiers prop
  return undefined;
}

function getPoolTiers(pool: Pool): { duration: string; rate: string }[] | undefined {
  if (pool.poolType !== "LOCKED" || !pool.lockTiers?.length) return undefined;
  return pool.lockTiers.map((t) => ({
    duration: `${t.lockDurationDays}d`,
    rate: `${parseFloat(t.interestRatePercent).toFixed(1)}%`,
  }));
}

function getPoolInfo(pool: Pool): string {
  if (pool.poolType === "SINGLE_ASSET") {
    const raised = pool.analytics?.totalValueLocked ? parseFloat(pool.analytics.totalValueLocked) : 0;
    const target = pool.targetRaise ? parseFloat(pool.targetRaise) : 0;
    const progress = target > 0 ? Math.round((raised / target) * 100) : 0;
    return `${formatTVL(pool.analytics?.totalValueLocked)} of ${formatTVL(pool.targetRaise || undefined)} (${progress}%)`;
  }
  const utilization = pool.analytics?.utilizationRate
    ? `${parseFloat(pool.analytics.utilizationRate).toFixed(0)}% at work`
    : "";
  return utilization || "";
}

function getPoolTags(pool: Pool): string[] {
  return pool.tags?.slice(0, 2) || [];
}

export default function DashboardPage() {
  const [activeDuration, setActiveDuration] = useState("All");
  const [activeAsset, setActiveAsset] = useState("All");

  const { data: metrics, isLoading: metricsLoading } = usePlatformMetrics();
  const { data: poolsResponse, isLoading: poolsLoading } = usePoolsData();
  const { data: featuredResponse } = useFeaturedPools();

  const pools = poolsResponse?.data || [];
  const featuredPools = featuredResponse?.data || [];

  const stableYieldPools = pools.filter((p) => p.poolType === "STABLE_YIELD");
  const lockedPools = pools.filter((p) => p.poolType === "LOCKED");
  const singleAssetPools = pools.filter((p) => p.poolType === "SINGLE_ASSET");

  const filteredStablePools = activeAsset === "All"
    ? stableYieldPools
    : stableYieldPools.filter((p) => p.assetSymbol === activeAsset);

  const filteredLockedPools = activeDuration === "All"
    ? lockedPools
    : lockedPools.filter(() => true);

  // TVL change badge — avoid showing misleading "+100%" when TVL was zero
  const tvlChangeNum = metrics?.tvlChange24hPercentage
    ? parseFloat(String(metrics.tvlChange24hPercentage))
    : null;
  const tvlChange = tvlChangeNum !== null && Math.abs(tvlChangeNum) < 99.5
    ? `${tvlChangeNum >= 0 ? "+" : ""}${tvlChangeNum.toFixed(1)}%`
    : tvlChangeNum !== null && tvlChangeNum > 0
      ? "New"
      : undefined;

  // Blended APY — use platform metric, fall back to manual calc from pools
  const blendedAPY = (() => {
    if (metrics?.averageAPY && parseFloat(String(metrics.averageAPY)) > 0) {
      return formatAPY(metrics.averageAPY);
    }
    // Manual fallback: TVL-weighted across all pools
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

  return (
    <div className="min-h-screen bg-black p-3 sm:p-4 lg:p-6">
      {/* Stats Row */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label="TOTAL VALUE LOCKED"
          value={metrics?.totalValueLockedFormatted || formatTVL(metrics?.totalValueLocked) || "$0"}
          badge={tvlChange}
        />
        <StatCard
          label="LIVE POOLS"
          value={String(metrics?.activePools || pools.length || 0)}
          subtitle={`${stableYieldPools.length} Stable · ${lockedPools.length} Locked · ${singleAssetPools.length} Single`}
        />
        <StatCard
          label="BLENDED APY"
          value={blendedAPY}
          subtitle="TVL-weighted, net of fees"
        />
        <StatCard
          label="24H FLOW"
          value={metrics?.netFlows24h ? formatTVL(metrics.netFlows24h) : "$0"}
          subtitle={metrics?.volume24h ? `Volume: ${formatTVL(metrics.volume24h)}` : undefined}
        />
      </div>

      <div className="flex flex-col gap-4 xl:flex-row">
        {/* Main Content */}
        <div className="w-full space-y-4 xl:w-[68%]">
          {/* Featured Pools */}
          {featuredPools.length > 0 && (
            <PoolSection
              label="FEATURED"
              title="Top picks this week."
              subtitle="Curated pools with strong performance and high liquidity."
            >
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {featuredPools.slice(0, 2).map((pool) => (
                  <PoolCard
                    key={pool.id}
                    poolId={pool.poolAddress}
                    type={pool.poolType === "STABLE_YIELD" ? "Stable Yield" : pool.poolType === "LOCKED" ? "Locked" : "Single Asset"}
                    asset={pool.assetSymbol}
                    name={pool.name}
                    tvl={getPoolTVL(pool)}
                    subtitle={getPoolSubtitle(pool)}
                    tiers={getPoolTiers(pool)}
                    info={getPoolInfo(pool)}
                    right=""
                    tags={getPoolTags(pool)}
                    link="Enter pool →"
                    minInvestment={pool.minInvestment}
                    currency={pool.assetSymbol}
                  />
                ))}
              </div>
            </PoolSection>
          )}

          {/* Stable Yield Pools */}
          <PoolSection
            label="STABLE YIELD"
            title="Withdraw anytime. Earn daily."
            subtitle="NAV-priced pools holding T-bills and money market paper. Your capital works from day one."
            filters={
              <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
                {["All", "USDC", "USDT", "DAI", "CNGN"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveAsset(c)}
                    className={`px-3 py-1 text-[11px] border border-[#1a1a1a] rounded-lg transition-colors ${
                      activeAsset === c
                        ? "text-white border-[#333]"
                        : "text-[#666] hover:text-[#888] hover:border-[#333]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            }
          >
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {poolsLoading ? (
                <div className="col-span-full py-8 text-center text-[#666]">Loading pools...</div>
              ) : filteredStablePools.length === 0 ? (
                <div className="col-span-full py-8 text-center text-[#666]">No stable yield pools available</div>
              ) : (
                filteredStablePools.map((pool) => (
                  <PoolCard
                    key={pool.id}
                    poolId={pool.poolAddress}
                    type="Stable Yield"
                    asset={pool.assetSymbol}
                    name={pool.name}
                    tvl={getPoolTVL(pool)}
                    subtitle={getPoolSubtitle(pool)}
                    tiers={getPoolTiers(pool)}
                    info={getPoolInfo(pool)}
                    right=""
                    tags={getPoolTags(pool)}
                    link="Enter pool →"
                    minInvestment={pool.minInvestment}
                    currency={pool.assetSymbol}
                  />
                ))
              )}
            </div>
          </PoolSection>

          {/* Locked Pools */}
          <PoolSection
            label="LOCKED"
            title="Lock your rate. Skip the volatility."
            subtitle="Fixed-term deposits with guaranteed APY. Choose when you receive interest. Early exit costs you."
            filters={
              <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
                {["All", "90d", "180d", "365d"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDuration(d)}
                    className={`px-3 py-1 text-[11px] border border-[#1a1a1a] rounded-lg transition-colors ${
                      activeDuration === d
                        ? "text-white border-[#333]"
                        : "text-[#666] hover:text-[#888]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            }
          >
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {poolsLoading ? (
                <div className="col-span-full py-8 text-center text-[#666]">Loading pools...</div>
              ) : filteredLockedPools.length === 0 ? (
                <div className="col-span-full py-8 text-center text-[#666]">No locked pools available</div>
              ) : (
                filteredLockedPools.map((pool) => (
                  <PoolCard
                    key={pool.id}
                    poolId={pool.poolAddress}
                    type="Locked"
                    asset={pool.assetSymbol}
                    name={pool.name}
                    tvl={getPoolTVL(pool)}
                    subtitle={getPoolSubtitle(pool)}
                    tiers={getPoolTiers(pool)}
                    info={getPoolInfo(pool)}
                    right={pool.maturityDate ? `${Math.ceil((new Date(pool.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d tenor` : ""}
                    tags={getPoolTags(pool)}
                    link="Review terms →"
                    minInvestment={pool.minInvestment}
                    currency={pool.assetSymbol}
                  />
                ))
              )}
            </div>
          </PoolSection>

          {/* Single-Asset Pools */}
          <PoolSection
            label="SINGLE ASSET"
            title="One deal. Full visibility."
            subtitle="Finance a specific receivable or credit facility. SPV-wrapped with documents on-chain."
          >
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {poolsLoading ? (
                <div className="col-span-full py-8 text-center text-[#666]">Loading pools...</div>
              ) : singleAssetPools.length === 0 ? (
                <div className="col-span-full py-8 text-center text-[#666]">No single asset pools available</div>
              ) : (
                singleAssetPools.map((pool) => (
                  <PoolCard
                    key={pool.id}
                    poolId={pool.poolAddress}
                    type="Single Asset"
                    asset={pool.assetSymbol}
                    name={pool.name}
                    tvl={getPoolTVL(pool)}
                    subtitle={getPoolSubtitle(pool)}
                    tiers={getPoolTiers(pool)}
                    info={getPoolInfo(pool)}
                    right={pool.maturityDate ? `${Math.ceil((new Date(pool.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d tenor` : ""}
                    tags={getPoolTags(pool)}
                    link="View deal memo →"
                    minInvestment={pool.minInvestment}
                    currency={pool.assetSymbol}
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
