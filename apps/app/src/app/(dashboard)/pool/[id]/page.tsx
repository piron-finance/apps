"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAccount } from "wagmi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { usePoolData, usePoolNavHistory, usePoolPerformance, usePoolInstruments, usePoolStats } from "@/hooks/usePoolsData";
import { usePoolTransactions } from "@/hooks/useTransactions";
import { useUserPositionInPool } from "@/hooks/useUserData";
import { useDeposit } from "@/hooks/useDeposit";
import { usePoolExit } from "@/hooks/usePoolExit";
import { useFeeCalculation, usePoolFeeRates } from "@/hooks/useFees";
import { useWithdrawalPreview, useWithdrawalQueueStatus, usePoolWithdrawalRequests } from "@/hooks/useWithdrawals";
import { usePoolTiers, useLockedPoolMetrics, useLockedDepositPreview, useUserLockedPositions, useEarlyExitPreview } from "@/hooks/useLockedPools";
import type { Pool, Transaction, LockedPosition } from "@/lib/api/types";
import { getEffectiveApy, getDepositAvailability, poolTypeLabel, type DepositAvailability } from "@/lib/pool-helpers";
import { getTransactionUrl } from "@/lib/constants/chains";
import { MetricRow } from "@/components/dashboard/stat-card";

function formatValue(value: string | number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(decimals)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(decimals)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(decimals)}K`;
  return `$${num.toFixed(decimals)}`;
}

function formatAPY(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return `${num.toFixed(1)}%`;
}

function formatMinDeposit(formatted: string | undefined): string {
  // formatted is already token-denominated (e.g. "100", "0.0000000000000001")
  const n = parseFloat((formatted || "0").replace(/,/g, ""));
  if (!n || isNaN(n) || n < 0.01) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", { 
    month: "short", 
    day: "numeric", 
    hour: "numeric", 
    minute: "2-digit",
    hour12: true 
  });
}

/**
 * Recharts draws SVG nodes per point, so an unbounded series from the API will
 * pin the main thread. Keep every nth point, always preserving the first and
 * last so the curve still starts and ends where the data does.
 */
const MAX_CHART_POINTS = 240;

function downsample<T>(points: T[], max: number): T[] {
  if (points.length <= max) return points;
  const stride = Math.ceil(points.length / max);
  const out: T[] = [];
  for (let i = 0; i < points.length; i += stride) out.push(points[i]);
  const last = points[points.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

/**
 * Declared at module scope on purpose. Defined inside the chart component it
 * was a new component type on every render, so React unmounted and remounted
 * the whole tooltip subtree each time — and the chart sets state on every
 * pointer move, so moving across it churned mount/unmount continuously.
 */
function NavTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-pop">
      <p className="mb-1 font-mono text-[10px] text-muted-foreground">{data.date}</p>
      <div className="flex items-center gap-2 text-[11px]">
        <span className="h-2 w-2 rounded-full bg-brand" />
        <span className="text-muted-foreground">NAV / share</span>
        <span className="ml-auto font-mono font-semibold text-foreground">
          {data.nav.toFixed(4)} {data.symbol}
        </span>
      </div>
    </div>
  );
}

export default function PoolDetailPage({ params }: { params: { id: string } }) {
  const { data: pool, isLoading: poolLoading } = usePoolData(params.id);

  if (poolLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="text-muted-foreground">Loading pool data...</div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="text-muted-foreground">Pool not found</div>
      </div>
    );
  }

  return <PoolDetailContent pool={pool} />;
}

function PoolDetailContent({ pool }: { pool: Pool }) {
  const isLockedPool = pool.poolType === "LOCKED";
  const tvl = pool.analytics?.totalValueLocked;
  const utilization = pool.analytics?.utilizationRate;

  const [depositOpen, setDepositOpen] = useState(false);
  const availability = getDepositAvailability(pool);
  const effectiveApy = getEffectiveApy(pool);

  const openDeposit = useCallback(() => {
    if (availability.canDeposit) setDepositOpen(true);
  }, [availability.canDeposit]);

  //  locked pool metrics for locked pools
  const { data: lockedMetrics } = useLockedPoolMetrics(
    isLockedPool ? pool.chainId : undefined,
    isLockedPool ? pool.poolAddress : undefined
  );
  const { data: tiersData } = usePoolTiers(isLockedPool ? pool.poolAddress : undefined);

  //  pool.lockTiers from the detail response as an immediate source; fall back to tiers API
  const tiers = (tiersData?.tiers?.length ? tiersData.tiers : pool.lockTiers) || [];
  const minLockDays = tiers.length > 0 ? Math.min(...tiers.map(t => t.lockDurationDays)) : undefined;
  const maxLockDays = tiers.length > 0 ? Math.max(...tiers.map(t => t.lockDurationDays)) : undefined;
  const minAPY = tiers.length > 0 ? Math.min(...tiers.map(t => parseFloat(t.interestRatePercent))) : undefined;
  const maxAPY = tiers.length > 0 ? Math.max(...tiers.map(t => parseFloat(t.interestRatePercent))) : undefined;

  // The four headline figures differ by pool type but read as one strip.
  const headlineMetrics = isLockedPool
    ? [
        {
          label: "Total deposits",
          value:
            lockedMetrics
              ? parseFloat(
                  (lockedMetrics.totalDepositsFormatted || "0").replace(/,/g, ""),
                ).toLocaleString("en-US", { maximumFractionDigits: 2 })
              : formatValue(tvl),
        },
        {
          label: "Active positions",
          value: String(lockedMetrics?.activePositions ?? "—"),
        },
        {
          label: "Lock periods",
          value:
            minLockDays && maxLockDays
              ? minLockDays === maxLockDays
                ? `${minLockDays}d`
                : `${minLockDays}–${maxLockDays}d`
              : "—",
        },
        {
          label: "APY range",
          value:
            minAPY !== undefined && maxAPY !== undefined
              ? minAPY === maxAPY
                ? `${minAPY}%`
                : `${minAPY}–${maxAPY}%`
              : "—",
        },
      ]
    : [
        { label: "TVL", value: formatValue(tvl) },
        {
          label: effectiveApy.isFixed ? "Fixed APY" : "Current APY",
          value: effectiveApy.hasValue ? formatAPY(effectiveApy.apy) : "—",
        },
        {
          label: "Utilization",
          value: utilization ? `${parseFloat(utilization).toFixed(0)}%` : "—",
        },
        { label: "Min hold", value: "7 days" },
      ];

  return (
    <div className="mx-auto max-w-[1320px] px-5 pb-4 pt-6 sm:px-8">
      <Link
        href="/"
        className="focus-ring -ml-1 mb-5 inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-[12.5px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to pools
      </Link>

      <PoolHeader pool={pool} availability={availability} />

      {/* Headline figures */}
      <div className="mb-10 mt-6">
        <MetricRow items={headlineMetrics} />
      </div>

      <div className="flex flex-col gap-10 xl:flex-row xl:gap-10">
        {/* Left column — ruled sections, no boxes */}
        <div className="w-full min-w-0 space-y-9 xl:flex-1">
          {!isLockedPool && (
            pool.poolType === "STABLE_YIELD"
              ? <NAVYieldHistory pool={pool} />
              : <FundingProgress pool={pool} availability={availability} onDeposit={openDeposit} />
          )}
          <div id="positions-section">
            {isLockedPool ? (
              <LockedPositions pool={pool} />
            ) : (
              <YourPositions pool={pool} />
            )}
          </div>
          <PoolTransactionsTable poolAddress={pool.poolAddress} assetSymbol={pool.assetSymbol} chainId={pool.chainId} />
          <AboutPoolCard pool={pool} />
        </div>

        {/* Right rail — one vertical rule separates it from the detail */}
        <div className="w-full space-y-8 xl:w-[336px] xl:shrink-0 xl:border-l xl:border-border xl:pl-10">
          {isLockedPool ? (
            <LockedAPYCard pool={pool} tiers={tiers} lockedMetrics={lockedMetrics} availability={availability} onDeposit={openDeposit} />
          ) : (
            <APYCard pool={pool} availability={availability} effectiveApy={effectiveApy} onDeposit={openDeposit} />
          )}
          <PoolStatsCard pool={pool} isLockedPool={isLockedPool} lockedMetrics={lockedMetrics} tiers={tiers} effectiveApy={effectiveApy} />
          {!isLockedPool && <AllocationCard pool={pool} />}
          <HoldingExitsCard pool={pool} isLockedPool={isLockedPool} tiers={tiers} />
          <RiskCard pool={pool} />
        </div>
      </div>

      <DepositModal
        pool={pool}
        tiers={tiers}
        availability={availability}
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
      />
    </div>
  );
}

function PoolHeader({ pool, availability }: { pool: Pool; availability: DepositAvailability }) {
  const isOpen = availability.state === "open";
  const statusStyles: Record<DepositAvailability["state"], string> = {
    open: "bg-brand-soft text-brand-ink border-brand-line",
    filled: "bg-brand-soft text-brand-ink border-brand-line",
    "funding-ended": "bg-muted text-muted-foreground border-border",
    matured: "bg-info-soft text-info border-info/30",
    closed: "bg-muted text-muted-foreground border-border",
    pending: "bg-warning-soft text-warning border-warning/30",
  };
  const statusLabel =
    availability.state === "open" ? "Open" : availability.state === "filled" ? "Funded" : availability.label;

  return (
    <div className="border-b border-border pb-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {poolTypeLabel(pool.poolType)}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles[availability.state]}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isOpen ? "animate-pulse bg-brand" : "bg-current opacity-60"}`}
          />
          {statusLabel}
        </span>
        {pool.tags?.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border-subtle px-2.5 py-1 text-[11px] text-subtle-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-3.5">
        {pool.issuerLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pool.issuerLogo}
            alt={pool.issuer || pool.name}
            className="mt-0.5 h-9 w-9 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[14px] font-semibold text-brand-ink">
            {pool.name?.[0]?.toUpperCase() || "P"}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold leading-tight tracking-display text-foreground sm:text-[30px]">
            {pool.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted-foreground">
            {pool.issuer && (
              <span>
                Issued by{" "}
                <span className="font-medium text-foreground">
                  {pool.issuer}
                </span>
              </span>
            )}
            {pool.issuer && (pool.region || pool.country) && (
              <span className="text-subtle-foreground">·</span>
            )}
            {(pool.region || pool.country) && (
              <span>{pool.region || pool.country}</span>
            )}
          </div>
        </div>
      </div>

      {pool.description && (
        <p className="mt-4 max-w-3xl text-[13.5px] leading-relaxed text-muted-foreground">
          {pool.description}
        </p>
      )}
    </div>
  );
}

function NAVYieldHistory({ pool }: { pool: Pool }) {
  const [activeTab, setActiveTab] = useState<"30D" | "90D" | "1Y">("30D");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const periodMap = { "30D": "30d", "90D": "90d", "1Y": "365d" };
  const { data: navHistory } = usePoolNavHistory(pool.poolAddress, periodMap[activeTab]);
  const { data: performance } = usePoolPerformance(pool.poolAddress, periodMap[activeTab]);

  // The pool's real, current NAV per share. A stable-yield pool opens at par (1.0)
  // and accrues upward, so this is our source of truth for the headline figure.
  const realNav = pool.analytics?.navPerShare ? parseFloat(pool.analytics.navPerShare) : 1.0;

  // Real NAV points from the backend (daily snapshots + a genesis anchor at par).
  // We never fabricate a curve: with fewer than two real points there's nothing
  // honest to plot, so the chart shows a "building history" empty state instead.
  const chartData = useMemo(() => {
    if (!navHistory?.data || navHistory.data.length === 0) return [];
    const points = navHistory.data.map((point) => ({
      date: new Date(point.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: new Date(point.timestamp),
      nav: parseFloat(point.navPerShare),
      symbol: pool.assetSymbol,
    }));
    return downsample(points, MAX_CHART_POINTS);
  }, [navHistory, pool.assetSymbol]);

  const hasHistory = chartData.length >= 2;

  const { minNav, maxNav } = useMemo(() => {
    if (chartData.length === 0) return { minNav: 0, maxNav: 1 };
    let min = Infinity;
    let max = -Infinity;
    for (const d of chartData) {
      if (d.nav < min) min = d.nav;
      if (d.nav > max) max = d.nav;
    }
    const padding = (max - min) * 0.1 || 0.001;
    return { minNav: min - padding, maxNav: max + padding };
  }, [chartData]);

  const currentNav = chartData[chartData.length - 1]?.nav ?? realNav;
  const startNav = chartData[0]?.nav ?? realNav;
  const navChange = startNav > 0 ? ((currentNav - startNav) / startNav) * 100 : 0;

  const activeData = activeIndex !== null ? chartData[activeIndex] : null;
  const displayNav = activeData?.nav ?? currentNav;
  const displayDate = activeData?.date ?? null;

  const handleMouseMove = useCallback((state: any) => {
    if (state.activeTooltipIndex !== undefined) {
      setActiveIndex(state.activeTooltipIndex);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);



  return (
    <div className="section-block">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight text-foreground">NAV & yield history</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span data-numeric className="text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-[28px]">
              {displayNav.toFixed(4)} {pool.assetSymbol}
            </span>
            <span className={`text-[12px] ${navChange >= 0 ? "text-positive" : "text-negative"}`}>
              {navChange >= 0 ? "+" : ""}{navChange.toFixed(2)}%
            </span>
          </div>
          {displayDate && (
            <span className="text-[11px] text-muted-foreground">{displayDate}</span>
          )}
        </div>
        <div className="inline-flex items-center gap-0.5 rounded border border-border bg-surface-sunken p-0.5">
          {(["30D", "90D", "1Y"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`focus-ring rounded-sm px-2.5 py-1 text-[11.5px] font-medium ${
                activeTab === tab
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-52">
        {!hasHistory ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <span className="text-[13px] text-muted-foreground">Building NAV history</span>
            <span className="max-w-[260px] text-[11px] text-subtle-foreground">
              The chart fills in as daily NAV snapshots accrue. Current NAV is {realNav.toFixed(4)} {pool.assetSymbol}.
            </span>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="navAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--chart-grid))" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={{ stroke: "hsl(var(--chart-grid))" }}
              tickLine={false}
              tick={{ fill: "hsl(var(--chart-axis))", fontSize: 10 }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              domain={[minNav, maxNav]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--chart-axis))", fontSize: 10 }}
              tickFormatter={(value) => value.toFixed(4)}
              width={55}
            />
            <Tooltip
              content={<NavTooltip />}
              cursor={{
                stroke: "hsl(var(--chart-1))",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="nav"
              stroke="hsl(var(--chart-1))"
              strokeWidth={1.75}
              fill="url(#navAreaGradient)"
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 4,
                fill: "hsl(var(--chart-1))",
                stroke: "hsl(var(--surface))",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center gap-6 text-[11px] mt-4 pt-4 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-brand rounded" />
          <span className="text-muted-foreground">NAV per share</span>
        </div>
        {performance && (
          <span className="text-subtle-foreground">
            {performance.averageAPY?.toFixed(1)}% avg APY · {performance.volatility?.toFixed(2)}% volatility
          </span>
        )}
        {!performance && (
          <span className="text-subtle-foreground">Past performance is not a guarantee of future returns.</span>
        )}
      </div>
    </div>
  );
}

function FundingProgress({ pool, availability, onDeposit }: { pool: Pool; availability: DepositAvailability; onDeposit: () => void }) {
  const { data: stats } = usePoolStats(pool.poolAddress);

  const tvlRaw = stats?.totalValueLocked || pool.analytics?.totalValueLocked || "0";
  const raised = parseFloat(tvlRaw);
  const target = pool.targetRaise ? parseFloat(pool.targetRaise) : 0;
  const percent = target > 0 ? Math.min((raised / target) * 100, 100) : 0;

  const epochEnd = pool.epochEndTime ? new Date(pool.epochEndTime) : null;
  const now = new Date();
  const daysLeft = epochEnd ? Math.max(0, Math.ceil((epochEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null;
  const fundingOpen = epochEnd ? now < epochEnd : true;

  const investors = stats?.totalInvestors || pool.analytics?.totalInvestors || pool.analytics?.uniqueInvestors || 0;

  const milestones = [25, 50, 75, 100];

  return (
    <div className="section-block">
      <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight text-foreground">Funding progress</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {fundingOpen
              ? daysLeft !== null
                ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining in funding period`
                : "Funding period open"
              : "Funding period ended"}
          </p>
        </div>
        <div className="text-right">
          <span className={`px-2.5 py-1 text-[10px] font-medium rounded-full ${
            fundingOpen
              ? "bg-brand-soft text-brand-ink"
              : "bg-muted text-muted-foreground"
          }`}>
            {fundingOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      {/* Big number */}
      <div className="mt-4 mb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-foreground">
            {raised.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          {target > 0 && (
            <span className="text-[13px] text-muted-foreground">
              / {target.toLocaleString(undefined, { maximumFractionDigits: 0 })} {pool.assetSymbol}
            </span>
          )}
        </div>
        {target > 0 && (
          <span className="text-[12px] text-brand-ink font-medium">{percent.toFixed(1)}% funded</span>
        )}
      </div>

      {/* Progress bar */}
      {target > 0 && (
        <div className="mt-3 mb-2">
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${percent}%`,
                background: percent >= 100
                  ? "linear-gradient(90deg, hsl(var(--brand)), hsl(var(--brand-strong)))"
                  : "linear-gradient(90deg, hsl(var(--brand)), hsl(var(--brand) / 0.75))",
              }}
            />
            {/* Milestone markers */}
            {milestones.map((m) => (
              <div
                key={m}
                className="absolute top-0 bottom-0 w-px bg-border-strong"
                style={{ left: `${m}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {milestones.map((m) => (
              <span key={m} className={`text-[9px] ${percent >= m ? "text-brand-ink" : "text-subtle-foreground"}`}>
                {m}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4 text-[11px] sm:flex sm:flex-wrap sm:items-center sm:gap-6">
        <div>
          <span className="text-muted-foreground">Investors</span>
          <p className="text-foreground font-medium">{investors}</p>
        </div>
        <div className="hidden h-6 w-px bg-border sm:block" />
        <div>
          <span className="text-muted-foreground">Min deposit</span>
          <p className="text-foreground font-medium">
            {pool.minInvestment
              ? `${parseFloat(pool.minInvestment).toLocaleString()} ${pool.assetSymbol}`
              : "—"}
          </p>
        </div>
        {epochEnd && (
          <>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div>
              <span className="text-muted-foreground">Epoch ends</span>
              <p className="text-foreground font-medium">
                {epochEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </>
        )}
        {target > 0 && (
          <>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div>
              <span className="text-muted-foreground">Remaining</span>
              <p className="text-foreground font-medium">
                {Math.max(0, target - raised).toLocaleString(undefined, { maximumFractionDigits: 0 })} {pool.assetSymbol}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4">
        {availability.canDeposit ? (
          <button
            onClick={onDeposit}
            className="w-full rounded-full bg-brand px-5 py-2.5 text-[12px] font-medium text-brand-foreground hover:bg-brand-strong sm:w-auto sm:px-8"
          >
            Deposit
          </button>
        ) : (
          <div className="rounded-lg border border-border-subtle bg-surface-sunken px-4 py-3 text-[12px] text-muted-foreground">
            {availability.reason}
          </div>
        )}
      </div>
    </div>
  );
}

function DepositModal({
  pool,
  tiers: tiersProp,
  availability,
  open: isOpen,
  onClose,
}: {
  pool: Pool;
  tiers?: any[];
  availability: DepositAvailability;
  open: boolean;
  onClose: () => void;
}) {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [amount, setAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [interestPayment, setInterestPayment] = useState<"UPFRONT" | "AT_MATURITY">("AT_MATURITY");

  const isLockedPool = pool.poolType === "LOCKED";
  const [pendingDepositAfterApproval, setPendingDepositAfterApproval] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  // Tracks whether the user submitted a deposit in THIS modal session, so a
  // lingering on-chain success from a prior deposit doesn't show the success
  // screen the next time the modal is opened.
  const [submitted, setSubmitted] = useState(false);

  const {
    deposit,
    approve,
    needsApproval,
    hasInsufficientBalance,
    exceedsMaxDeposit,
    poolNotAcceptingDeposits,
    refetchAllowance,
    reset,
    isApproving,
    isApprovalSuccess,
    isConfirming,
    isDepositing,
    isSuccess,
    transactionHash,
    balance,
    refetchBalance,
  } = useDeposit(pool);

  const showSuccess = submitted && isSuccess;

  // Lock body scroll + allow Escape to dismiss while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  // Clear transient deposit state whenever the modal closes so it reopens fresh.
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSubmitted(false);
      setPendingDepositAfterApproval(false);
      setDepositError(null);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pull a fresh on-chain balance the moment a deposit confirms so the wallet
  // balance reflects without a page reload (query invalidation is handled in the hook).
  useEffect(() => {
    if (isSuccess) refetchBalance();
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isApprovalSuccess && pendingDepositAfterApproval) {
      setSubmitted(true);
      refetchAllowance().then(() => {
        deposit(amount, isLockedPool ? selectedTier : undefined, isLockedPool ? interestPayment : undefined)
          .catch((err: any) => {
            const msg = err?.response?.data?.message || err?.shortMessage || err?.message || "Deposit failed";
            setDepositError(msg);
          })
          .finally(() => setPendingDepositAfterApproval(false));
      });
    }
  }, [isApprovalSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: feeRates } = usePoolFeeRates(pool.poolAddress);

  // Debounce amount for API queries so they don't fire on every keystroke
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout>();
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedAmount(amount);
      // Re-check the on-chain wallet balance once the user stops typing, so a
      // freshly-received transfer is reflected without needing a page reload.
      if (isConnected && amount) refetchBalance();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [amount]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: feeCalc } = useFeeCalculation(pool.poolAddress, debouncedAmount);

  const { data: lockedPreview, isFetching: isPreviewFetching, isError: isPreviewError } = useLockedDepositPreview(
    isLockedPool ? pool.chainId : undefined,
    isLockedPool ? pool.poolAddress : undefined,
    debouncedAmount,
    selectedTier
  );

  const tiers = tiersProp || [];

  const sharePrice = pool.analytics?.navPerShare ? parseFloat(pool.analytics.navPerShare) : 1;
  const depositFeeRate = feeRates?.depositFee ? parseFloat(feeRates.depositFee) : 0.001;
  const effectiveApy = getEffectiveApy(pool);
  const apy = effectiveApy.hasValue ? effectiveApy.apy : 0;
  const minDeposit = pool.minInvestment ? parseFloat(pool.minInvestment) : pool.minDeposit ? parseFloat(pool.minDeposit) : 50;

  const parsedAmount = parseFloat(amount) || 0;
  

  const feeAmount = feeCalc?.fee ? parseFloat(feeCalc.fee) : parsedAmount * depositFeeRate;
  const netAmount = feeCalc?.netAmount ? parseFloat(feeCalc.netAmount) : parsedAmount - feeAmount;
  const shares = parsedAmount > 0 ? netAmount / sharePrice : 0;
  const estimatedYield = parsedAmount > 0 ? (netAmount * apy) / 100 : 0;

  const userBalance = balance ? parseFloat(balance) : 0;
  const requiresApproval = isConnected && parsedAmount > 0 && needsApproval(amount);
  const insufficientBalance = isConnected && parsedAmount > 0 && hasInsufficientBalance(amount);
  const depositsDisabled = !availability.canDeposit || (isConnected && poolNotAcceptingDeposits());
  const overMaxDeposit = isConnected && parsedAmount > 0 && exceedsMaxDeposit(amount);

  const handleMaxClick = () => {
    if (isConnected && balance) {
      setAmount(balance);
    }
  };

  const handleAction = async () => {
    if (!isConnected) {
      open();
      return;
    }

    setDepositError(null);
    try {
      if (requiresApproval) {
        setPendingDepositAfterApproval(true);
        await approve(amount);
      } else {
        setSubmitted(true);
        await deposit(amount, isLockedPool ? selectedTier : undefined, isLockedPool ? interestPayment : undefined);
      }
    } catch (error: any) {
      setPendingDepositAfterApproval(false);
      const msg = error?.response?.data?.message || error?.shortMessage || error?.message || "Deposit failed";
      setDepositError(msg);
    }
  };

  const getButtonText = () => {
    if (!availability.canDeposit) return availability.label;
    if (!isConnected) return "Connect wallet to continue";
    if (depositsDisabled) return "Pool not accepting deposits";
    if (isApproving) return pendingDepositAfterApproval ? "Approving (1/2)..." : "Approving...";
    if (pendingDepositAfterApproval && isApprovalSuccess) return "Depositing (2/2)...";
    if (isConfirming) return "Confirming deposit...";
    if (parsedAmount === 0) return "Enter amount";
    if (parsedAmount < minDeposit) return `Minimum ${minDeposit.toLocaleString()} ${pool.assetSymbol}`;
    if (insufficientBalance) return "Insufficient balance";
    if (overMaxDeposit) return "Exceeds pool capacity";
    if (requiresApproval) return `Approve & Deposit`;
    return "Deposit";
  };

  const isButtonDisabled = isDepositing || depositsDisabled || (isConnected && (parsedAmount === 0 || parsedAmount < minDeposit || insufficientBalance || overMaxDeposit));
  const feePercent = (depositFeeRate * 100).toFixed(2);

  if (!isOpen) return null;

  const handleDone = () => {
    setAmount("");
    setDepositError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/25 p-0 backdrop-blur-md sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-border bg-surface p-5 shadow-pop sm:rounded-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <span className="eyebrow">Deposit</span>
            <h3 className="mt-1.5 text-[18px] font-semibold tracking-tight text-foreground">{isLockedPool ? "Lock funds" : `Deposit into ${pool.name}`}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-subtle-foreground hover:bg-muted hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

      {showSuccess ? (
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="hsl(var(--brand-ink))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h4 className="text-[17px] font-semibold tracking-tight text-foreground">Deposit confirmed</h4>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {parsedAmount > 0 ? `${parsedAmount.toLocaleString()} ${pool.assetSymbol} deposited.` : "Your deposit was confirmed."}
            {!isLockedPool && parsedAmount > 0 ? ` You received ~${shares.toFixed(2)} shares.` : ""}
          </p>
          {transactionHash && (
            <a
              href={getTransactionUrl(pool.chainId, transactionHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[12px] text-brand-ink hover:underline"
            >
              View transaction ↗
            </a>
          )}
          <button
            onClick={handleDone}
            className="mt-6 w-full rounded-full bg-brand px-5 py-2.5 text-[12px] font-medium text-brand-foreground hover:bg-brand-strong"
          >
            Done
          </button>
        </div>
      ) : (
      <>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 text-[11px] text-muted-foreground border border-border-subtle rounded-lg">{pool.assetSymbol} only</span>
          {!isLockedPool && <span className="px-3 py-1 text-[11px] text-foreground border border-border-subtle rounded-lg">7 day hold</span>}
          {isLockedPool && <span className="px-3 py-1 text-[11px] text-muted-foreground border border-border-subtle rounded-lg">Fixed APY</span>}
        </div>
      <p className="text-[12px] text-muted-foreground mb-5">
        {isConnected
          ? "Enter an amount, review your estimated yield, and confirm the deposit."
          : "Connect your wallet to deposit and start earning yield."
        }
      </p>

      <div className="w-full">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[12px] text-muted-foreground">Amount</span>
          <span className="text-[12px] text-muted-foreground">
            Balance: {isConnected ? `${userBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${pool.assetSymbol}` : `— ${pool.assetSymbol}`}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border-subtle bg-surface-sunken p-3 focus-within:border-brand/50">
          <input
            type="text"
            value={amount}
            onChange={(e) => { setAmount(e.target.value.replace(/[^0-9.]/g, "")); setDepositError(null); }}
            placeholder="0.00"
            className="min-w-0 flex-1 bg-transparent text-xl text-foreground outline-none sm:text-2xl"
          />
          <button className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">{pool.assetSymbol}</button>
          <button 
            onClick={handleMaxClick}
            className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded hover:text-foreground hover:border-border-strong"
          >
            Max
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">≈ ${parsedAmount.toLocaleString()}</p>
        <p className="text-[11px] text-muted-foreground mt-3">Min deposit {minDeposit.toLocaleString()} {pool.assetSymbol}</p>

        {/* Locked Pool Tier Selection */}
        {isLockedPool && tiers.length > 0 && (
          <div className="mt-4">
            <span className="text-[12px] text-muted-foreground block mb-2">Select lock period</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {tiers.map((tier: any) => (
                <button
                  key={tier.index}
                  onClick={() => setSelectedTier(tier.index)}
                  className={`p-3 rounded-lg border text-left ${
                    selectedTier === tier.index
                      ? "border-brand bg-brand-soft"
                      : "border-border-subtle hover:border-border-strong"
                  }`}
                >
                  <p className="text-[14px] font-medium text-foreground">{tier.lockDurationDays}d</p>
                  <p className="text-[12px] text-brand-ink">{tier.interestRatePercent}% APY</p>
                  <p className="text-[10px] text-muted-foreground">Min: {formatMinDeposit(tier.minDepositFormatted)} {pool.assetSymbol}</p>
                </button>
              ))}
            </div>

            {/* Interest Payment Option */}
            <div className="mt-3">
              <span className="text-[12px] text-muted-foreground block mb-2">Interest payment</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setInterestPayment("AT_MATURITY")}
                  className={`px-3 py-2 text-[11px] rounded-lg border ${
                    interestPayment === "AT_MATURITY"
                      ? "border-brand bg-brand-soft text-foreground"
                      : "border-border-subtle text-muted-foreground"
                  }`}
                >
                  At maturity
                </button>
                <button
                  onClick={() => setInterestPayment("UPFRONT")}
                  className={`px-3 py-2 text-[11px] rounded-lg border ${
                    interestPayment === "UPFRONT"
                      ? "border-brand bg-brand-soft text-foreground"
                      : "border-border-subtle text-muted-foreground"
                  }`}
                >
                  Upfront
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {isLockedPool ? (
            lockedPreview ? (
              <>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Lock duration</span>
                  <span className="text-foreground">{lockedPreview.lockDurationDays} days</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Interest rate</span>
                  <span className="text-brand-ink">{lockedPreview.interestRatePercent}%</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Expected interest</span>
                  <span className="text-foreground">{lockedPreview.expectedInterestFormatted}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Maturity date</span>
                  <span className="text-foreground">{lockedPreview.maturityDate}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Total at maturity</span>
                  <span className="text-foreground font-medium">{lockedPreview.totalAtMaturityFormatted}</span>
                </div>
              </>
            ) : tiers.find(t => t.index === selectedTier) ? (
              <>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Lock duration</span>
                  <span className="text-foreground">{tiers.find(t => t.index === selectedTier)?.lockDurationDays} days</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Interest rate</span>
                  <span className="text-brand-ink">{tiers.find(t => t.index === selectedTier)?.interestRatePercent}%</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Expected interest</span>
                  <span className="text-foreground">
                    {parsedAmount > 0
                      ? isPreviewFetching ? "calculating..." : isPreviewError ? "unavailable" : "—"
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Maturity date</span>
                  <span className="text-foreground">—</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Total at maturity</span>
                  <span className="text-foreground font-medium">—</span>
                </div>
              </>
            ) : null
          ) : (
            <>
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">Estimated 12-month yield</span>
                <span className="text-foreground">{parsedAmount > 0 ? `$${estimatedYield.toFixed(2)}` : "—"}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">Deposit fee ({feePercent}%)</span>
                <span className="text-foreground">{parsedAmount > 0 ? `$${feeAmount.toFixed(2)}` : "—"}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">You receive (shares)</span>
                <span className="text-foreground">{parsedAmount > 0 ? `~${shares.toFixed(2)}` : "—"}</span>
              </div>
            </>
          )}
        </div>

        {depositError && (
          <p className="text-[11px] text-negative mt-3">{depositError}</p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleAction}
            disabled={isButtonDisabled}
            className={`w-full flex-1 px-5 py-2.5 text-[12px] font-medium rounded-full ${
              isButtonDisabled
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-brand text-brand-foreground hover:bg-brand-strong"
            }`}
          >
            {getButtonText()}
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-[12px] text-muted-foreground border border-border-subtle rounded-full hover:text-foreground hover:border-border-strong sm:w-auto"
          >
            Cancel
          </button>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-subtle-foreground">
          {isLockedPool
            ? "Funds are locked until maturity. Early exit incurs a penalty."
            : "Minimum 7-day hold. Withdraw eligible positions anytime after the hold period."}
        </p>
      </div>
      </>
      )}
      </div>
    </div>
  );
}

function YourPositions({ pool }: { pool: Pool }) {
  const { address, isConnected } = useAccount();
  const { data: position, isLoading } = useUserPositionInPool(address, pool.poolAddress);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const exit = usePoolExit(pool);

  const handleWithdraw = async () => {
    setWithdrawError(null);
    try {
      if (pool.poolType === "SINGLE_ASSET" && (pool.status === "MATURED" || position?.pool.status === "MATURED")) {
        await exit.redeemShares(position?.totalShares || "0");
      } else {
        await exit.withdraw(withdrawAmount);
      }
    } catch (e: any) {
      setWithdrawError(e?.shortMessage ?? e?.message ?? "Withdrawal failed");
    }
  };

  // Close the panel once the on-chain withdrawal confirms.
  useEffect(() => {
    if (exit.isSuccess) {
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      exit.reset();
    }
  }, [exit.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Withdrawal preview and queue status — only relevant for stable yield pools
  const isStableYield = pool.poolType === "STABLE_YIELD";
  const { data: withdrawPreview } = useWithdrawalPreview(
    isStableYield ? pool.poolAddress : undefined,
    withdrawAmount,
    address
  );
  const { data: queueStatus } = useWithdrawalQueueStatus(
    isStableYield ? pool.poolAddress : undefined,
    address
  );

  if (!isConnected) {
    return (
      <div className="section-block">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-[13.5px] font-semibold tracking-tight text-foreground">Your positions</h3>
          <p className="text-[11px] text-muted-foreground">Connect a wallet to see deposits and exit eligibility.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="section-block">
        <h3 className="mb-4 text-[13.5px] font-semibold tracking-tight text-foreground">Your positions</h3>
        <div className="py-4 text-center text-muted-foreground">Loading positions...</div>
      </div>
    );
  }

  if (!position || parseFloat(position.totalShares || "0") === 0) {
    return (
      <div className="section-block">
        <h3 className="mb-4 text-[13.5px] font-semibold tracking-tight text-foreground">Your positions</h3>
        <div className="panel px-5 py-6 sm:px-6">
          <p className="text-[13px] font-medium text-foreground">No position here yet — how it works</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Your capital is put to work from day one. Get started in three steps.
          </p>
          <ol className="mt-5 space-y-3.5">
            {[
              ["Claim test tokens", "Use the banner at the top to get free test tokens."],
              ["Deposit any amount", "You receive NAV-priced shares in the pool."],
              ["Earn & withdraw", "Yield accrues into the share price — withdraw when you like."],
            ].map(([title, desc], i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-line bg-brand-soft text-[10px] font-medium text-brand-ink">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-foreground">{title}</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  const currentValue = parseFloat(position.currentValue || "0");
  const totalShares = parseFloat(position.totalShares || "0");
  const totalReturn = parseFloat(position.totalReturn || "0");
  const poolStatus = position.pool.status || pool.status;
  const isSingleAsset = pool.poolType === "SINGLE_ASSET";
  const isMaturedSingleAsset = isSingleAsset && poolStatus === "MATURED";
  const firstDepositTime = position.firstDepositTime || position.lastDepositTime || position.lastActivityDate;
  const daysHeld = position.daysHeld || 0;
  const canWithdraw = isSingleAsset ? isMaturedSingleAsset : daysHeld >= 7;
  const holdStatusLabel = isSingleAsset
    ? isMaturedSingleAsset
      ? "Matured"
      : poolStatus === "CANCELLED" || poolStatus === "EMERGENCY"
        ? "Refund available"
        : "Awaiting maturity"
    : canWithdraw
      ? "Unlocked"
      : `${Math.max(7 - daysHeld, 0)}d remaining`;
  const primaryActionLabel = isMaturedSingleAsset ? "Redeem" : "Withdraw";

  return (
    <div className="section-block">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[13.5px] font-semibold tracking-tight text-foreground">Your positions</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {totalShares.toLocaleString()} shares · ${currentValue.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(!showWithdrawModal)}
          disabled={!canWithdraw || exit.isConfirming}
          className={`px-3 py-1.5 text-[11px] rounded-lg ${
            canWithdraw
              ? "text-brand-ink border border-brand-line hover:bg-brand-soft"
              : "text-muted-foreground border border-border-subtle cursor-not-allowed"
          }`}
        >
          {primaryActionLabel}
        </button>
      </div>

      {/* Single-asset claim actions: coupons during the deal, refunds after a cancellation */}
      {pool.poolType === "SINGLE_ASSET" && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={async () => {
              setWithdrawError(null);
              try { await exit.claimCoupon(); } catch (e: any) { setWithdrawError(e?.shortMessage ?? e?.message ?? "Claim coupon failed"); }
            }}
            disabled={exit.isConfirming}
            className="px-3 py-1.5 text-[11px] rounded-lg text-brand-ink border border-brand-line hover:bg-brand-soft disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exit.isConfirming ? "Confirming..." : "Claim coupon"}
          </button>
          {(pool.status === "CANCELLED" || pool.status === "EMERGENCY") && (
            <button
              onClick={async () => {
                setWithdrawError(null);
                try { await exit.claimRefund(); } catch (e: any) { setWithdrawError(e?.shortMessage ?? e?.message ?? "Claim refund failed"); }
              }}
              disabled={exit.isConfirming}
              className="px-3 py-1.5 text-[11px] rounded-lg text-warning border border-warning/30 hover:bg-warning-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exit.isConfirming ? "Confirming..." : "Claim refund"}
            </button>
          )}
        </div>
      )}

      <div className="hidden grid-cols-4 gap-4 border-b border-border-subtle pb-3 text-[11px] text-muted-foreground md:grid">
        <span>First deposit</span>
        <span>Shares</span>
        <span>Current value</span>
        <span>Hold status</span>
      </div>

      <div className="grid grid-cols-1 gap-3 py-3 md:grid-cols-4 md:items-center md:gap-4">
        <div className="flex justify-between gap-3 md:block">
          <span className="text-[11px] text-muted-foreground md:hidden">First deposit</span>
          <span className="text-[12px] text-muted-foreground">
            {firstDepositTime ? formatDate(firstDepositTime) : "—"}
          </span>
        </div>
        <div className="flex justify-between gap-3 md:block">
          <span className="text-[11px] text-muted-foreground md:hidden">Shares</span>
          <span className="text-[12px] text-foreground">{totalShares.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between gap-3 md:block">
          <span className="text-[11px] text-muted-foreground md:hidden">Current value</span>
          <span className="text-[12px] text-foreground">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          {totalReturn !== 0 && (
            <span className={`text-[10px] ml-1 ${totalReturn >= 0 ? "text-positive" : "text-negative"}`}>
              ({totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)})
            </span>
          )}
        </div>
        <div className="flex justify-between gap-3 md:block">
          <span className="text-[11px] text-muted-foreground md:hidden">Hold status</span>
          <span className={`text-[11px] ${canWithdraw ? "text-brand-ink" : "text-muted-foreground"}`}>
            {holdStatusLabel}
          </span>
        </div>
      </div>

      {/* Withdrawal Panel */}
      {showWithdrawModal && canWithdraw && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <h4 className="mb-3 text-[12.5px] font-semibold tracking-tight text-foreground">
            {isMaturedSingleAsset ? "Redeem matured position" : "Withdraw from position"}
          </h4>

          {isMaturedSingleAsset ? (
            <div className="mb-4 rounded-lg border border-border-subtle bg-surface-sunken p-3">
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">Shares to redeem</span>
                <span className="text-foreground">{totalShares.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                The contract will redeem your shares against the matured pool balance.
              </p>
            </div>
          ) : (
            <div className="mb-3 flex min-w-0 items-center gap-2">
              <input
                type="text"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                className="min-w-0 flex-1 px-3 py-2 bg-surface-sunken border border-border-subtle rounded-lg text-foreground text-[14px] outline-none focus:border-brand/50"
              />
              <button
                onClick={() => setWithdrawAmount(String(currentValue))}
                className="px-3 py-2 text-[11px] text-muted-foreground border border-border-subtle rounded-lg hover:text-foreground"
              >
                Max
              </button>
            </div>
          )}

          {!isMaturedSingleAsset && withdrawPreview && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">Withdrawal fee</span>
                <span className="text-foreground">${withdrawPreview.fee || "0.00"}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">You receive</span>
                <span className="text-foreground">${withdrawPreview.netAmount || withdrawAmount}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">Method</span>
                <span className="text-foreground">{withdrawPreview.method || "Instant"}</span>
              </div>
            </div>
          )}

          {queueStatus?.inQueue && (
            <div className="mb-4 p-3 bg-warning-soft border border-warning/30 rounded-lg">
              <p className="text-[11px] text-warning">
                Note: Pool reserves are low. Your withdrawal may be queued.
                Position in queue: {queueStatus.position}
              </p>
            </div>
          )}

          {withdrawError && (
            <p className="mb-3 text-[11px] text-negative">{withdrawError}</p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleWithdraw}
              disabled={isMaturedSingleAsset ? exit.isConfirming : !withdrawAmount || parseFloat(withdrawAmount) <= 0 || exit.isConfirming}
              className="px-4 py-2 bg-brand text-brand-foreground text-[12px] font-medium rounded-lg hover:bg-brand-strong disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exit.isConfirming ? "Confirming..." : isMaturedSingleAsset ? "Confirm Redemption" : "Confirm Withdrawal"}
            </button>
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="px-4 py-2 text-[12px] text-muted-foreground border border-border-subtle rounded-lg hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LockedPositions({ pool }: { pool: Pool }) {
  const { address, isConnected } = useAccount();
  const { data: lockedPositionsData, isLoading } = useUserLockedPositions(address);
  const [selectedPosition, setSelectedPosition] = useState<LockedPosition | null>(null);
  const [showEarlyExitModal, setShowEarlyExitModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingPositionId, setPendingPositionId] = useState<number | string | null>(null);
  const exit = usePoolExit(pool);

  // Close the early-exit modal once the on-chain tx confirms.
  useEffect(() => {
    if (exit.isSuccess) {
      setShowEarlyExitModal(false);
      setSelectedPosition(null);
      setPendingPositionId(null);
      exit.reset();
    }
  }, [exit.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter to positions in this pool
  const poolPositions = lockedPositionsData?.positions?.filter(
    (p) => p.poolAddress?.toLowerCase() === pool.poolAddress?.toLowerCase()
  ) || [];

  // Early exit preview for selected position
  const { data: earlyExitPreview } = useEarlyExitPreview(
    showEarlyExitModal && selectedPosition?.globalPositionId !== undefined
      ? selectedPosition.globalPositionId
      : undefined
  );

  if (!isConnected) {
    return (
      <div className="section-block">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-[13.5px] font-semibold tracking-tight text-foreground">Your locked positions</h3>
          <p className="text-[11px] text-muted-foreground">Connect a wallet to see your locked deposits.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="section-block">
        <h3 className="mb-4 text-[13.5px] font-semibold tracking-tight text-foreground">Your locked positions</h3>
        <div className="py-4 text-center text-muted-foreground">Loading positions...</div>
      </div>
    );
  }

  if (poolPositions.length === 0) {
    return (
      <div className="section-block">
        <h3 className="mb-4 text-[13.5px] font-semibold tracking-tight text-foreground">Your locked positions</h3>
        <div className="panel px-5 py-6 sm:px-6">
          <p className="text-[13px] font-medium text-foreground">No lock here yet — how it works</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Lock for a fixed term, earn a fixed APY. Pick a tier on the right to begin.
          </p>
          <ol className="mt-5 space-y-3.5">
            {[
              ["Claim test tokens", "Use the banner at the top to get free test tokens."],
              ["Choose a lock tier", "30, 90 or 180 days — each with its own fixed APY."],
              ["Earn to maturity", "Interest accrues daily and pays out at term end. Early exit carries a penalty."],
            ].map(([title, desc], i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-line bg-brand-soft text-[10px] font-medium text-brand-ink">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-foreground">{title}</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  const totalPrincipal = poolPositions.reduce((sum, p) => sum + parseFloat(p.principal || "0"), 0);
  const totalExpectedInterest = poolPositions.reduce((sum, p) => sum + parseFloat(p.expectedInterest || "0"), 0);
  const activeCount = poolPositions.filter((p) => p.status === "ACTIVE").length;
  const maturedCount = poolPositions.filter((p) => p.status === "MATURED").length;

  const handleRedeemClick = async (position: LockedPosition) => {
    setActionError(null);
    setPendingPositionId(position.globalPositionId);
    try {
      await exit.redeemPosition(position.globalPositionId);
    } catch (e: any) {
      setActionError(e?.shortMessage ?? e?.message ?? "Redeem failed");
      setPendingPositionId(null);
    }
  };

  const handleEarlyExitClick = (position: LockedPosition) => {
    setSelectedPosition(position);
    setShowEarlyExitModal(true);
  };

  const confirmEarlyExit = async () => {
    if (selectedPosition?.globalPositionId === undefined) return;
    setActionError(null);
    setPendingPositionId(selectedPosition.globalPositionId);
    try {
      await exit.earlyExitPosition(selectedPosition.globalPositionId);
    } catch (e: any) {
      setActionError(e?.shortMessage ?? e?.message ?? "Early exit failed");
      setPendingPositionId(null);
    }
  };

  const handleToggleRollover = async (position: LockedPosition) => {
    setActionError(null);
    setPendingPositionId(position.globalPositionId);
    try {
      await exit.setAutoRollover(position.globalPositionId, !position.autoRollover);
    } catch (e: any) {
      setActionError(e?.shortMessage ?? e?.message ?? "Failed to update auto-rollover");
      setPendingPositionId(null);
    }
  };

  return (
    <div className="section-block">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[13.5px] font-semibold tracking-tight text-foreground">Your locked positions</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {poolPositions.length} position{poolPositions.length !== 1 ? "s" : ""} · 
            ${totalPrincipal.toLocaleString()} locked · 
            ${totalExpectedInterest.toLocaleString()} expected interest
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeCount > 0 && (
            <span className="px-2 py-1 text-[10px] text-brand-ink bg-brand-soft rounded-lg">
              {activeCount} active
            </span>
          )}
          {maturedCount > 0 && (
            <span className="px-2 py-1 text-[10px] text-warning bg-warning-soft rounded-lg">
              {maturedCount} matured
            </span>
          )}
        </div>
      </div>

      <div className="hidden grid-cols-6 gap-4 border-b border-border-subtle pb-3 text-[11px] text-muted-foreground md:grid">
        <span>Tier</span>
        <span>Principal</span>
        <span>Interest Rate</span>
        <span>Maturity</span>
        <span>Status</span>
        <span>Actions</span>
      </div>

      {poolPositions.map((position) => {
        const isMatured = position.status === "MATURED";
        const isActive = position.status === "ACTIVE";
        const principal = parseFloat(position.principal || "0");
        const daysRemaining = position.daysRemaining || 0;

        return (
          <div key={position.id} className="grid grid-cols-1 gap-3 border-b border-border-subtle py-4 last:border-0 md:grid-cols-6 md:items-center md:gap-4 md:py-3">
            <div className="flex justify-between gap-3 md:block">
              <span className="text-[11px] text-muted-foreground md:hidden">Tier</span>
              <span className="text-[12px] text-foreground">{position.tierName || `Tier ${position.tierIndex}`}</span>
            </div>
            <div className="flex justify-between gap-3 md:block">
              <span className="text-[11px] text-muted-foreground md:hidden">Principal</span>
              <span className="text-[12px] text-foreground">${principal.toLocaleString()}</span>
              {position.expectedInterestFormatted && (
                <span className="text-[10px] text-brand-ink ml-1">+{position.expectedInterestFormatted}</span>
              )}
            </div>
            <div className="flex justify-between gap-3 md:block">
              <span className="text-[11px] text-muted-foreground md:hidden">Interest Rate</span>
              <span className="text-[12px] text-brand-ink">{position.interestRatePercent}%</span>
            </div>
            <div className="flex justify-between gap-3 md:block">
              <span className="text-[11px] text-muted-foreground md:hidden">Maturity</span>
              <span className="text-[12px] text-foreground">
                {position.maturityDate || position.maturityTimeFormatted || "—"}
              </span>
              {isActive && daysRemaining > 0 && (
                <span className="text-[10px] text-muted-foreground ml-1">({daysRemaining}d left)</span>
              )}
            </div>
            <div className="flex justify-between gap-3 md:block">
              <span className="text-[11px] text-muted-foreground md:hidden">Status</span>
              <span className={`text-[11px] px-2 py-1 rounded w-fit ${
                isMatured
                  ? "text-warning bg-warning-soft"
                  : isActive
                  ? "text-brand-ink bg-brand-soft"
                  : position.status === "REDEEMED"
                  ? "text-muted-foreground bg-muted"
                  : "text-negative bg-negative-soft"
              }`}>
                {position.status}
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
              {isMatured && (
                <button
                  onClick={() => handleRedeemClick(position)}
                  disabled={exit.isConfirming && pendingPositionId === position.globalPositionId}
                  className="px-3 py-1.5 text-[11px] bg-brand text-brand-foreground rounded-lg hover:bg-brand-strong disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exit.isConfirming && pendingPositionId === position.globalPositionId ? "Redeeming..." : "Redeem"}
                </button>
              )}
              {isActive && position.canEarlyExit !== false && (
                <button
                  onClick={() => handleEarlyExitClick(position)}
                  className="px-3 py-1.5 text-[11px] text-muted-foreground border border-border-subtle rounded-lg hover:text-foreground hover:border-border-strong"
                >
                  Early Exit
                </button>
              )}
              {isActive && (
                <button
                  onClick={() => handleToggleRollover(position)}
                  disabled={exit.isConfirming && pendingPositionId === position.globalPositionId}
                  className={`px-3 py-1.5 text-[11px] rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed ${
                    position.autoRollover
                      ? "text-brand-ink border-brand-line hover:bg-brand-soft"
                      : "text-muted-foreground border-border-subtle hover:text-foreground hover:border-border-strong"
                  }`}
                  title="Roll this position into a new term at maturity"
                >
                  {exit.isConfirming && pendingPositionId === position.globalPositionId
                    ? "…"
                    : `Auto-rollover: ${position.autoRollover ? "On" : "Off"}`}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Early Exit Confirmation Modal */}
      {showEarlyExitModal && selectedPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-md">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-border-subtle bg-surface-sunken p-4 sm:p-6">
            <h3 className="mb-2 text-[16px] font-semibold tracking-tight text-foreground">Early Exit Confirmation</h3>
            <p className="text-[12px] text-muted-foreground mb-4">
              Exiting early will forfeit some of your earned interest and may incur a penalty.
            </p>

            {earlyExitPreview ? (
              <div className="space-y-3 mb-6 p-4 bg-surface-sunken rounded-lg border border-border-subtle">
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Principal</span>
                  <span className="text-foreground">${parseFloat(earlyExitPreview.principal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Accrued Interest</span>
                  <span className="text-brand-ink">+${parseFloat(earlyExitPreview.accruedInterest).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground">Days Completed</span>
                  <span className="text-foreground">{earlyExitPreview.timeElapsedDays} / {earlyExitPreview.timeElapsedDays + earlyExitPreview.timeRemainingDays}</span>
                </div>
                <div className="border-t border-border-subtle pt-3">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-negative">Early Exit Penalty ({earlyExitPreview.penaltyPercent}%)</span>
                    <span className="text-negative">-${parseFloat(earlyExitPreview.earlyExitPenalty).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[12px] mt-2">
                    <span className="text-muted-foreground">Forfeited Interest</span>
                    <span className="text-muted-foreground">-${parseFloat(earlyExitPreview.forfeitedInterest).toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-t border-border-subtle pt-3">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-foreground font-medium">You Receive</span>
                    <span className="text-foreground font-medium">${parseFloat(earlyExitPreview.netReceived).toLocaleString()}</span>
                  </div>
                </div>
                {earlyExitPreview.recommendation && (
                  <p className="text-[11px] text-warning mt-2">{earlyExitPreview.recommendation}</p>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Loading exit preview...</div>
            )}

            {actionError && (
              <p className="mb-3 text-[11px] text-negative">{actionError}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmEarlyExit}
                disabled={!earlyExitPreview || exit.isConfirming}
                className="flex-1 px-4 py-2.5 bg-destructive text-foreground text-[12px] font-medium rounded-lg hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exit.isConfirming ? "Confirming..." : "Confirm Early Exit"}
              </button>
              <button
                onClick={() => {
                  setShowEarlyExitModal(false);
                  setSelectedPosition(null);
                }}
                className="flex-1 px-4 py-2.5 text-[12px] text-muted-foreground border border-border-subtle rounded-lg hover:text-foreground hover:border-border-strong"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LockedAPYCard({ pool, tiers, lockedMetrics, availability, onDeposit }: { pool: Pool; tiers: any[]; lockedMetrics: any; availability: DepositAvailability; onDeposit: () => void }) {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { data: lockedPositionsData } = useUserLockedPositions(address);

  // Filter to positions in this pool
  const poolPositions = lockedPositionsData?.positions?.filter(
    (p) => p.poolAddress?.toLowerCase() === pool.poolAddress?.toLowerCase()
  ) || [];

  const hasPositions = poolPositions.length > 0;
  const totalPrincipal = poolPositions.reduce((sum, p) => sum + parseFloat(p.principal || "0"), 0);
  const totalExpectedInterest = poolPositions.reduce((sum, p) => sum + parseFloat(p.expectedInterest || "0"), 0);
  const maturedCount = poolPositions.filter((p) => p.status === "MATURED").length;

  // Calculate APY range from tiers
  const apyValues = tiers.map(t => parseFloat(t.interestRatePercent));
  const minAPY = apyValues.length > 0 ? Math.min(...apyValues) : 0;
  const maxAPY = apyValues.length > 0 ? Math.max(...apyValues) : 0;

  return (
    <div className="section-block">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[11px] text-muted-foreground">APY Range</span>
          <p className="text-[11px] text-muted-foreground mt-1">Fixed rates based on lock duration.</p>
        </div>
        <div className="sm:text-right">
          <p className="text-2xl font-semibold text-foreground sm:text-3xl">
            {minAPY === maxAPY ? `${minAPY}%` : `${minAPY}–${maxAPY}%`}
          </p>
          <p className="text-[11px] text-muted-foreground">Fixed APY</p>
        </div>
      </div>

      {/* Lock Tiers Summary */}
      {tiers.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-surface-sunken border border-border-subtle">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Lock Tiers</span>
          <div className="mt-2 space-y-1">
            {tiers.slice(0, 3).map((tier) => (
              <div key={tier.index} className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">{tier.lockDurationDays}d lock</span>
                <span className="text-brand-ink">{tier.interestRatePercent}% APY</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isConnected && hasPositions && (
        <div className="mb-4 p-3 rounded-lg bg-surface-sunken border border-border-subtle">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Your locked deposits</span>
          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-xl font-semibold text-foreground">${totalPrincipal.toLocaleString()}</span>
            <span className="text-[12px] text-brand-ink">
              +${totalExpectedInterest.toLocaleString()} expected
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {poolPositions.length} position{poolPositions.length !== 1 ? "s" : ""}
            {maturedCount > 0 && ` · ${maturedCount} ready to redeem`}
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">
          {tiers.length} lock tiers
        </span>
        <span className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">
          {lockedMetrics?.activePositions || 0} active positions
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {!isConnected ? (
          <button
            onClick={() => open()}
            className="flex-1 px-4 py-2.5 bg-brand text-brand-foreground text-[12px] font-medium rounded-full hover:bg-brand-strong"
          >
            Connect wallet
          </button>
        ) : availability.canDeposit ? (
          <>
            <button
              onClick={onDeposit}
              className="flex-1 px-4 py-2.5 bg-brand text-brand-foreground text-[12px] font-medium rounded-full hover:bg-brand-strong"
            >
              {hasPositions ? "Lock more" : "Lock deposit"}
            </button>
            {maturedCount > 0 && (
              <button className="flex-1 px-4 py-2.5 text-[12px] text-warning border border-warning/30 rounded-full hover:bg-warning-soft">
                Redeem matured
              </button>
            )}
          </>
        ) : (
          <>
            <button
              disabled
              className="flex-1 px-4 py-2.5 bg-muted text-muted-foreground text-[12px] font-medium rounded-full cursor-not-allowed"
            >
              {availability.label}
            </button>
            {maturedCount > 0 && (
              <button className="flex-1 px-4 py-2.5 text-[12px] text-warning border border-warning/30 rounded-full hover:bg-warning-soft">
                Redeem matured
              </button>
            )}
          </>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        {!isConnected
          ? "Connect a wallet to lock funds and earn fixed APY for the selected term."
          : availability.canDeposit
          ? "Interest is calculated daily and paid at maturity. Early exit incurs a penalty."
          : availability.reason}
      </p>
    </div>
  );
}

function APYCard({
  pool,
  availability,
  effectiveApy,
  onDeposit,
}: {
  pool: Pool;
  availability: DepositAvailability;
  effectiveApy: ReturnType<typeof getEffectiveApy>;
  onDeposit: () => void;
}) {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { data: position } = useUserPositionInPool(address, pool.poolAddress);

  const navPerShare = pool.analytics?.navPerShare;
  const isFixed = effectiveApy.isFixed;
  const canDeposit = availability.canDeposit;

  const hasPosition = position && parseFloat(position.totalShares || "0") > 0;
  const currentValue = hasPosition ? parseFloat(position.currentValue || "0") : 0;
  const totalReturn = hasPosition ? parseFloat(position.totalReturn || "0") : 0;
  const totalShares = hasPosition ? parseFloat(position.totalShares || "0") : 0;
  const returnPercent = hasPosition ? parseFloat(position.totalReturnPercentage || "0") : 0;

  const scrollToPositions = () =>
    document.getElementById("positions-section")?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="section-block">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[11px] text-muted-foreground">{isFixed ? "Fixed APY" : "Current APY"}</span>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isFixed ? "Fixed rate, set at issuance." : "Variable, based on underlying yield."}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-2xl font-semibold text-brand-ink sm:text-3xl">{effectiveApy.hasValue ? formatAPY(effectiveApy.apy) : "—"}</p>
          <p className="text-[11px] text-muted-foreground">Net of fees</p>
        </div>
      </div>

      {isConnected && hasPosition && (
        <div className="mb-4 p-3 rounded-lg bg-surface-sunken border border-border-subtle">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Your position</span>
          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-xl font-semibold text-foreground">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className={`text-[12px] ${totalReturn >= 0 ? "text-positive" : "text-negative"}`}>
              {totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)} ({returnPercent >= 0 ? "+" : ""}{returnPercent.toFixed(1)}%)
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{totalShares.toLocaleString(undefined, { maximumFractionDigits: 2 })} shares</p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">
          Share price {navPerShare ? parseFloat(navPerShare).toFixed(4) : "1.0000"}
        </span>
        <span className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">NAV refresh: daily</span>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {!isConnected ? (
          <button
            onClick={() => open()}
            className="flex-1 px-4 py-2.5 bg-brand text-brand-foreground text-[12px] font-medium rounded-full hover:bg-brand-strong"
          >
            Connect wallet
          </button>
        ) : canDeposit ? (
          <>
            <button
              onClick={onDeposit}
              className="flex-1 px-4 py-2.5 bg-brand text-brand-foreground text-[12px] font-medium rounded-full hover:bg-brand-strong"
            >
              {hasPosition ? "Deposit more" : "Deposit"}
            </button>
            {hasPosition && (
              <button
                onClick={scrollToPositions}
                className="flex-1 px-4 py-2.5 text-[12px] text-muted-foreground border border-border-subtle rounded-full hover:text-foreground hover:border-border-strong"
              >
                Withdraw
              </button>
            )}
          </>
        ) : (
          <>
            <button
              disabled
              className="flex-1 px-4 py-2.5 bg-muted text-muted-foreground text-[12px] font-medium rounded-full cursor-not-allowed"
            >
              {availability.label}
            </button>
            {hasPosition && (
              <button
                onClick={scrollToPositions}
                className="flex-1 px-4 py-2.5 text-[12px] text-muted-foreground border border-border-subtle rounded-full hover:text-foreground hover:border-border-strong"
              >
                Withdraw
              </button>
            )}
          </>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        {!isConnected
          ? "Connect a wallet to see your positions and start earning yield in this pool."
          : canDeposit
          ? "Yield accrues daily. Withdraw eligible positions anytime after the 7-day hold."
          : availability.reason}
      </p>
    </div>
  );
}

function PoolStatsCard({ pool, isLockedPool, lockedMetrics, tiers, effectiveApy }: { pool: Pool; isLockedPool?: boolean; lockedMetrics?: any; tiers?: any[]; effectiveApy?: ReturnType<typeof getEffectiveApy> }) {
  // Use pool stats endpoint for detailed analytics
  const { data: stats, isLoading } = usePoolStats(pool.poolAddress);

  const tvl = stats?.totalValueLocked || pool.analytics?.totalValueLocked;
  const utilization = stats?.utilizationRate || pool.analytics?.utilizationRate;
  const totalInvestors = stats?.totalInvestors || pool.analytics?.totalInvestors || pool.analytics?.uniqueInvestors;
  const navPerShare = pool.analytics?.navPerShare;
  const averageDeposit = stats?.averageDeposit;
  const volume24h = stats?.last24hVolume;

  const isSingleAsset = pool.poolType === "SINGLE_ASSET";
  const minDeposit = pool.minInvestment || pool.minDeposit;

  return (
    <div className="section-block">
      <h3 className="mb-0.5 text-[13.5px] font-semibold tracking-tight text-foreground">Pool stats</h3>
      <p className="text-[11px] text-muted-foreground mb-4">Key numbers for {pool.name}.</p>

      {isLoading || (isLockedPool && !lockedMetrics) ? (
        <div className="py-4 text-center text-muted-foreground text-[12px]">Loading stats...</div>
      ) : isLockedPool && lockedMetrics ? (
        <div className="space-y-2.5">
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Total Deposits</span>
            <span className="text-foreground">{parseFloat((lockedMetrics.totalDepositsFormatted || "0").replace(/,/g, "")).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Active Positions</span>
            <span className="text-foreground">{lockedMetrics.activePositions ?? "—"}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Total Positions</span>
            <span className="text-foreground">{lockedMetrics.totalPositionsCreated ?? "—"}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Available Liquidity</span>
            <span className="text-foreground">{parseFloat((lockedMetrics.availableLiquidityFormatted || "0").replace(/,/g, "")).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Lock Tiers</span>
            <span className="text-foreground">{tiers?.length ?? "—"}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {effectiveApy && (
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">{effectiveApy.isFixed ? "Fixed APY" : "Current APY"}</span>
              <span className="text-brand-ink">{effectiveApy.hasValue ? formatAPY(effectiveApy.apy) : "—"}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">TVL</span>
            <span className="text-foreground">{formatValue(tvl)}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Utilization</span>
            <span className="text-foreground">{utilization ? `${parseFloat(utilization).toFixed(0)}%` : "—"}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Investors</span>
            <span className="text-foreground">{totalInvestors || "—"}</span>
          </div>
          {minDeposit && (
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">Min deposit</span>
              <span className="text-foreground">{parseFloat(minDeposit).toLocaleString()} {pool.assetSymbol}</span>
            </div>
          )}
          {isSingleAsset && pool.targetRaise && (
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">Target raise</span>
              <span className="text-foreground">{parseFloat(pool.targetRaise).toLocaleString()} {pool.assetSymbol}</span>
            </div>
          )}
          {isSingleAsset && pool.maturityDate && (
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">Maturity</span>
              <span className="text-foreground">{formatDate(pool.maturityDate)}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">NAV per share</span>
            <span className="text-foreground">{navPerShare ? `${parseFloat(navPerShare).toFixed(4)} ${pool.assetSymbol}` : "—"}</span>
          </div>
          {averageDeposit && (
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">Avg deposit</span>
              <span className="text-foreground">{formatValue(averageDeposit)}</span>
            </div>
          )}
          {volume24h && (
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">24h volume</span>
              <span className="text-foreground">{formatValue(volume24h)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        <span className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">{poolTypeLabel(pool.poolType)}</span>
        {pool.status && (
          <span className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">{pool.status}</span>
        )}
      </div>
    </div>
  );
}

function AllocationCard({ pool }: { pool: Pool }) {
  const { data: instruments, isLoading } = usePoolInstruments(pool.poolAddress);

  const allocationData = instruments?.allocations || [
    { name: "On-chain treasuries", percentage: 48 },
    { name: "Money market funds", percentage: 32 },
    { name: "Cash buffer", percentage: 20 },
  ];

  return (
    <div className="section-block">
      <h3 className="mb-0.5 text-[13.5px] font-semibold tracking-tight text-foreground">Underlying allocation</h3>
      <p className="text-[11px] text-muted-foreground mb-4">Indicative split across instruments.</p>

      {isLoading ? (
        <div className="py-4 text-center text-muted-foreground text-[12px]">Loading...</div>
      ) : (
        <div className="space-y-2.5">
          {allocationData.map((item: any, index: number) => (
            <div key={index} className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">{item.name}</span>
              <span className="text-foreground">{item.percentage}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border-subtle mt-4 pt-4 space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Average duration</span>
          <span className="text-muted-foreground">&lt; 45 days</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Next NAV event</span>
          <span className="text-muted-foreground">In ~6 hours</span>
        </div>
      </div>
    </div>
  );
}

function HoldingExitsCard({ pool, isLockedPool, tiers: tiersProp }: { pool: Pool; isLockedPool?: boolean; tiers?: any[] }) {
  const { address } = useAccount();
  const { data: feeRates } = usePoolFeeRates(pool.poolAddress);
  // Withdrawal queue only exists on StableYield pools
  const isStableYield = pool.poolType === "STABLE_YIELD";
  const { data: withdrawalQueue } = usePoolWithdrawalRequests(
    isStableYield ? pool.poolAddress : undefined,
    address
  );

  const withdrawalFee = feeRates?.withdrawalFee
    ? `${(parseFloat(feeRates.withdrawalFee) * 100).toFixed(2)}%`
    : "0.15%";

  const queueLength = withdrawalQueue?.queue?.length || 0;
  const queueAmount = withdrawalQueue?.totalQueued
    ? formatValue(withdrawalQueue.totalQueued)
    : "$0";

  // Use tiers passed from parent
  const tiers = tiersProp || [];
  const minLockDays = tiers.length > 0 ? Math.min(...tiers.map(t => t.lockDurationDays)) : undefined;
  const maxLockDays = tiers.length > 0 ? Math.max(...tiers.map(t => t.lockDurationDays)) : undefined;

  // Early exit penalty from fee rates
  const earlyExitPenalty = feeRates?.earlyExitPenalty
    ? `${(parseFloat(feeRates.earlyExitPenalty) * 100).toFixed(1)}%`
    : "5–15%";

  if (isLockedPool) {
    return (
      <div className="section-block">
        <h3 className="mb-0.5 text-[13.5px] font-semibold tracking-tight text-foreground">Lock periods & exits</h3>
        <p className="text-[11px] text-muted-foreground mb-4">How deposits work in this locked pool.</p>

        <div className="space-y-2.5">
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Lock durations</span>
            <span className="text-foreground">
              {minLockDays && maxLockDays
                ? minLockDays === maxLockDays
                  ? `${minLockDays} days`
                  : `${minLockDays}–${maxLockDays} days`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Redemption</span>
            <span className="text-foreground">At maturity only</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Early exit</span>
            <span className="text-foreground">Allowed with penalty</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Early exit penalty</span>
            <span className="text-warning">{earlyExitPenalty}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Interest payment</span>
            <span className="text-foreground">Upfront or at maturity</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">Fixed APY</span>
          <span className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">Auto-rollover available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="section-block">
      <h3 className="mb-0.5 text-[13.5px] font-semibold tracking-tight text-foreground">Holding & exits</h3>
      <p className="text-[11px] text-muted-foreground mb-4">How capital moves in and out of the pool.</p>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Minimum holding period</span>
          <span className="text-foreground">7 days</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Withdrawal model</span>
          <span className="text-foreground">Instant if reserves, else queue</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Withdrawal fee</span>
          <span className="text-foreground">{withdrawalFee}</span>
        </div>
        {queueLength > 0 && (
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Current queue</span>
            <span className="text-warning">{queueLength} requests · {queueAmount}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">Queue visible in app</span>
        <span className="px-2 py-1 text-[10px] text-muted-foreground border border-border-subtle rounded">No lockup after 7 days</span>
      </div>
    </div>
  );
}

function RiskCard({ pool }: { pool: Pool }) {
  return (
    <div className="section-block">
      <h3 className="mb-0.5 text-[13.5px] font-semibold tracking-tight text-foreground">Risk & disclosures</h3>
      <p className="text-[11px] text-muted-foreground mb-4">Understand how this pool behaves under stress.</p>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Risk rating</span>
          <span className="text-foreground">{pool.riskRating || "—"}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Primary risks</span>
          <span className="text-foreground">Rate, Counterparty</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Region</span>
          <span className="text-foreground">{pool.region || pool.country || "Global"}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="px-3 py-1.5 text-[11px] text-muted-foreground border border-border-subtle rounded-full hover:text-foreground hover:border-border-strong">
          View full disclosures
        </button>
        <button className="px-3 py-1.5 text-[11px] text-muted-foreground border border-border-subtle rounded-full hover:text-foreground hover:border-border-strong">
          Tax & reporting
        </button>
      </div>
    </div>
  );
}

function AboutPoolCard({ pool }: { pool: Pool }) {
  return (
    <div className="section-block">
      <h3 className="mb-1 text-[15px] font-semibold tracking-tight text-foreground">About this Pool</h3>
      <p className="text-[13px] text-muted-foreground mb-5">
        {pool.description || "No description available."}
      </p>

      <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-8">
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Pool Type</span>
          <span className="text-foreground">{poolTypeLabel(pool.poolType)}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Security Type</span>
          <span className="text-foreground">{pool.securityType || "—"}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Risk Rating</span>
          <span className="text-foreground">{pool.riskRating || "—"}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Issuer</span>
          <span className="text-foreground">{pool.issuer || "Piron Finance"}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-muted-foreground">Region</span>
          <span className="text-foreground">{pool.region || pool.country || "Global"}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button className="px-3 py-1.5 text-[11px] text-muted-foreground border border-border-subtle rounded-lg hover:text-foreground hover:border-border-strong">
          Strategy docs
        </button>
        <button className="px-3 py-1.5 text-[11px] text-muted-foreground border border-border-subtle rounded-lg hover:text-foreground hover:border-border-strong">
          Smart contracts
        </button>
        <button className="px-3 py-1.5 text-[11px] text-muted-foreground border border-border-subtle rounded-lg hover:text-foreground hover:border-border-strong">
          Audit report
        </button>
      </div>
    </div>
  );
}

function PoolTransactionsTable({ poolAddress, assetSymbol, chainId }: { poolAddress: string; assetSymbol: string; chainId: number }) {
  const [filter, setFilter] = useState<"all" | "deposits" | "withdrawals">("all");
  const { data: txResponse, isLoading } = usePoolTransactions(poolAddress, { limit: 10 });

  const transactions = txResponse?.data || [];
  
  const isDepositType = (type: string) => type === "DEPOSIT" || type === "POSITION_CREATED";
  const isWithdrawalType = (type: string) => type === "WITHDRAWAL" || type === "POSITION_REDEEMED" || type === "EARLY_EXIT";

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "deposits") return isDepositType(tx.type);
    if (filter === "withdrawals") return isWithdrawalType(tx.type);
    return true;
  });

  const txTypeLabel = (type: string): string => {
    if (type === "POSITION_CREATED") return "DEPOSIT";
    if (type === "POSITION_REDEEMED") return "REDEEM";
    if (type === "INTEREST_PAYMENT") return "INTEREST";
    return type;
  };

  return (
    <div className="section-block">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-[13.5px] font-semibold tracking-tight text-foreground">Pool transactions</h3>
        <div className="inline-flex items-center gap-0.5 self-start rounded border border-border bg-surface-sunken p-0.5">
          {(["all", "deposits", "withdrawals"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`focus-ring rounded-sm px-2.5 py-1 text-[11.5px] font-medium capitalize ${
                filter === f
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Loading transactions...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No transactions found</div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="rounded-lg border border-border-subtle bg-surface-sunken p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                      isDepositType(tx.type)
                        ? "bg-positive-soft text-positive"
                        : isWithdrawalType(tx.type)
                        ? "bg-negative-soft text-negative"
                        : "bg-info-soft text-info"
                    }`}
                  >
                    {txTypeLabel(tx.type)}
                  </span>
                  <span className="text-right text-[11px] text-muted-foreground">{formatTime(tx.timestamp)}</span>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-right font-medium text-foreground">
                      {parseFloat(tx.amount).toLocaleString()} {assetSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">User</span>
                    <span className="font-mono text-muted-foreground">
                      {truncateAddress(tx.userWallet || tx.user?.walletAddress || tx.from || "")}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Hash</span>
                    <a
                      href={getTransactionUrl(tx.chainId ?? chainId, tx.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-muted-foreground hover:text-foreground"
                    >
                      {truncateAddress(tx.txHash)}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-[11px] text-muted-foreground border-b border-border-subtle">
                  <th className="text-left font-normal pb-3">Time</th>
                  <th className="text-left font-normal pb-3">Type</th>
                  <th className="text-left font-normal pb-3">User</th>
                  <th className="text-left font-normal pb-3">Amount</th>
                  <th className="text-left font-normal pb-3">Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border-subtle last:border-0">
                    <td className="py-3 text-[12px] text-muted-foreground">{formatTime(tx.timestamp)}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                          isDepositType(tx.type)
                            ? "bg-positive-soft text-positive"
                            : isWithdrawalType(tx.type)
                            ? "bg-negative-soft text-negative"
                            : "bg-info-soft text-info"
                        }`}
                      >
                        {txTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="py-3 text-[12px] text-muted-foreground font-mono">
                      {truncateAddress(tx.userWallet || tx.user?.walletAddress || tx.from || "")}
                    </td>
                    <td className="py-3 text-[12px] text-foreground font-medium">
                      {parseFloat(tx.amount).toLocaleString()} {assetSymbol}
                    </td>
                    <td className="py-3">
                      <a
                        href={getTransactionUrl(tx.chainId ?? chainId, tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-muted-foreground font-mono hover:text-foreground"
                      >
                        {truncateAddress(tx.txHash)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {filteredTransactions.length > 0 && (
        <div className="flex justify-center mt-4">
          <button className="focus-ring rounded-full px-4 py-2 text-[11.5px] font-medium text-muted-foreground hover:text-foreground">
            Load more transactions
          </button>
        </div>
      )}
    </div>
  );
}
