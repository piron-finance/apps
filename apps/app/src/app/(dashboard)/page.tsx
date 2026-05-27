"use client";

import { usePlatformMetrics } from "@/hooks/usePlatformData";
import { usePoolsData, useFeaturedPools } from "@/hooks/usePoolsData";
import {
  StatCard,
  PoolCard,
  PoolSection,
  Sidebar,
} from "@/components/dashboard";
import type { Pool } from "@/lib/api/types";
import { CHAIN_INFO } from "@/lib/constants/chains";
import { useChainContext, SUPPORTED_CHAINS } from "@/lib/context/ChainContext";
import { useState } from "react";

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
    return nav ? `NAV Price: ${parseFloat(nav).toFixed(4)} / share` : undefined;
  }
  if (pool.poolType === "SINGLE_ASSET") {
    const rate = pool.discountRate ? pool.discountRate / 100 : null;
    return rate ? `Target APY: ${rate.toFixed(1)}%` : undefined;
  }
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

function getPoolInfo(pool: Pool): string {
  if (pool.poolType === "SINGLE_ASSET") {
    const raised = pool.analytics?.totalValueLocked
      ? parseFloat(pool.analytics.totalValueLocked)
      : 0;
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

// ── Chain colour dot ─────────────────────────────────────────────────────────
function ChainDot({ chainId }: { chainId?: number }) {
  if (!chainId) return null;
  const color = CHAIN_INFO[chainId]?.color;
  if (!color) return null;
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: color }}
    />
  );
}

// ── Shared dropdown style ─────────────────────────────────────────────────────
const selectClass =
  "appearance-none bg-[#0d0d0d] border border-[#222] text-[11px] text-[#aaa] rounded-lg pl-3 pr-7 py-1.5 cursor-pointer focus:outline-none focus:border-[#444] transition-colors hover:border-[#333]";

// Chevron overlay for selects
function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative inline-flex items-center">
      {children}
      <svg
        className="pointer-events-none absolute right-2 text-[#555]"
        width="9"
        height="6"
        viewBox="0 0 9 6"
        fill="none"
      >
        <path
          d="M1 1L4.5 5L8 1"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeDuration, setActiveDuration] = useState("All");
  const [activeAsset, setActiveAsset] = useState("All");
  // Use global ChainContext — persists across navigation + shared with portfolio page
  const { activeChainId, setActiveChainId } = useChainContext();

  // All data scoped to the selected chain
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

  // Empty state component for pool sections when chain has no pools
  function EmptyChainState({ poolType }: { poolType: string }) {
    if (!poolsLoading && activeChainId !== undefined && pools.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center gap-2 py-10 text-center">
          <ChainDot chainId={activeChainId} />
          <p className="text-[13px] text-[#555]">
            No {poolType} pools deployed on {activeChainLabel} yet.
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-black p-3 sm:p-4 lg:p-6">
      {/* ── Chain Selector (dropdown) ───────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-2">
        <SelectWrapper>
          <select
            value={activeChainId ?? "all"}
            onChange={(e) => {
              const val = e.target.value;
              setActiveChainId(
                val === "all" ? undefined : Number(val),
              );
            }}
            className={selectClass}
          >
            {SUPPORTED_CHAINS.map((opt) => (
              <option key={opt.label} value={opt.id ?? "all"}>
                {opt.label}
              </option>
            ))}
          </select>
        </SelectWrapper>

        {/* Active chain indicator dot */}
        {activeChainId !== undefined && <ChainDot chainId={activeChainId} />}
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label="TOTAL VALUE LOCKED"
          value={
            metrics?.totalValueLockedFormatted ||
            formatTVL(metrics?.totalValueLocked) ||
            "$0"
          }
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
          subtitle={
            metrics?.volume24h
              ? `Volume: ${formatTVL(metrics.volume24h)}`
              : undefined
          }
        />
      </div>

      <div className="flex flex-col gap-4 xl:flex-row">
        {/* ── Main Content ─────────────────────────────────────────────── */}
        <div className="w-full space-y-4 xl:w-[68%]">

          {/* Featured Pools — only shown when pools exist for this chain */}
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
                    type={
                      pool.poolType === "STABLE_YIELD"
                        ? "Stable Yield"
                        : pool.poolType === "LOCKED"
                          ? "Locked"
                          : "Single Asset"
                    }
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
              <SelectWrapper>
                <select
                  value={activeAsset}
                  onChange={(e) => setActiveAsset(e.target.value)}
                  className={selectClass}
                >
                  {["All", "USDC", "USDT", "DAI", "CNGN"].map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All assets" : c}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            }
          >
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {poolsLoading ? (
                <div className="col-span-full py-8 text-center text-[#555]">
                  Loading pools…
                </div>
              ) : (
                <>
                  <EmptyChainState poolType="stable yield" />
                  {filteredStablePools.length === 0 &&
                  !(activeChainId !== undefined && pools.length === 0) ? (
                    <div className="col-span-full py-8 text-center text-[#555]">
                      No stable yield pools available
                    </div>
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
                </>
              )}
            </div>
          </PoolSection>

          {/* Locked Pools */}
          <PoolSection
            label="LOCKED"
            title="Lock your rate. Skip the volatility."
            subtitle="Fixed-term deposits with guaranteed APY. Choose when you receive interest. Early exit costs you."
            filters={
              <SelectWrapper>
                <select
                  value={activeDuration}
                  onChange={(e) => setActiveDuration(e.target.value)}
                  className={selectClass}
                >
                  {["All", "90d", "180d", "365d"].map((d) => (
                    <option key={d} value={d}>
                      {d === "All" ? "All durations" : d}
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            }
          >
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {poolsLoading ? (
                <div className="col-span-full py-8 text-center text-[#555]">
                  Loading pools…
                </div>
              ) : (
                <>
                  <EmptyChainState poolType="locked" />
                  {filteredLockedPools.length === 0 &&
                  !(activeChainId !== undefined && pools.length === 0) ? (
                    <div className="col-span-full py-8 text-center text-[#555]">
                      No locked pools available
                    </div>
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
                        right={
                          pool.maturityDate
                            ? `${Math.ceil((new Date(pool.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d tenor`
                            : ""
                        }
                        tags={getPoolTags(pool)}
                        link="Review terms →"
                        minInvestment={pool.minInvestment}
                        currency={pool.assetSymbol}
                      />
                    ))
                  )}
                </>
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
                <div className="col-span-full py-8 text-center text-[#555]">
                  Loading pools…
                </div>
              ) : (
                <>
                  <EmptyChainState poolType="single asset" />
                  {singleAssetPools.length === 0 &&
                  !(activeChainId !== undefined && pools.length === 0) ? (
                    <div className="col-span-full py-8 text-center text-[#555]">
                      No single asset pools available
                    </div>
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
                        right={
                          pool.maturityDate
                            ? `${Math.ceil((new Date(pool.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d tenor`
                            : ""
                        }
                        tags={getPoolTags(pool)}
                        link="View deal memo →"
                        minInvestment={pool.minInvestment}
                        currency={pool.assetSymbol}
                      />
                    ))
                  )}
                </>
              )}
            </div>
          </PoolSection>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
