"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import { getEffectiveApy, getDepositAvailability, type DepositAvailability } from "@/lib/pool-helpers";

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

export default function PoolDetailPage({ params }: { params: { id: string } }) {
  const { data: pool, isLoading: poolLoading } = usePoolData(params.id);

  if (poolLoading) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="text-[#666]">Loading pool data...</div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="text-[#666]">Pool not found</div>
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

  return (
    <div className="min-h-screen bg-black p-3 sm:p-4 lg:p-6">
      <PoolHeader pool={pool} availability={availability} />

      {/* Top Analytics Bar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-6">
          <div className="rounded-lg border border-[#2b2b2b] bg-[#060607] p-3 sm:border-0 sm:bg-transparent sm:p-0">
            <span className="text-[11px] text-[#666]">{isLockedPool ? "Total Deposits" : "TVL"}</span>
            <p className="break-words text-white font-medium">
              {isLockedPool && lockedMetrics
                ? parseFloat((lockedMetrics.totalDepositsFormatted || "0").replace(/,/g, "")).toLocaleString("en-US", { maximumFractionDigits: 2 })
                : formatValue(tvl)}
            </p>
          </div>
          <div className="hidden h-8 w-px bg-[#1a1a1a] sm:block" />
          {isLockedPool ? (
            <>
              <div className="rounded-lg border border-[#1a1a1a] bg-[#060607] p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <span className="text-[11px] text-[#666]">Active Positions</span>
                <p className="break-words text-white font-medium">{lockedMetrics?.activePositions ?? "—"}</p>
              </div>
              <div className="hidden h-8 w-px bg-[#1a1a1a] sm:block" />
              <div className="rounded-lg border border-[#1a1a1a] bg-[#060607] p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <span className="text-[11px] text-[#666]">Lock Periods</span>
                <p className="break-words text-white font-medium">
                  {minLockDays && maxLockDays
                    ? minLockDays === maxLockDays
                      ? `${minLockDays}d`
                      : `${minLockDays}–${maxLockDays}d`
                    : "—"}
                </p>
              </div>
              <div className="hidden h-8 w-px bg-[#1a1a1a] sm:block" />
              <div className="rounded-lg border border-[#1a1a1a] bg-[#060607] p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <span className="text-[11px] text-[#666]">APY Range</span>
                <p className="break-words text-[#00c853] font-medium">
                  {minAPY !== undefined && maxAPY !== undefined
                    ? minAPY === maxAPY
                      ? `${minAPY}%`
                      : `${minAPY}–${maxAPY}%`
                    : "—"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-[#1a1a1a] bg-[#060607] p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <span className="text-[11px] text-[#666]">{effectiveApy.isFixed ? "Fixed APY" : "Current APY"}</span>
                <p className="break-words text-[#00c853] font-medium">{effectiveApy.hasValue ? formatAPY(effectiveApy.apy) : "—"}</p>
              </div>
              <div className="hidden h-8 w-px bg-[#1a1a1a] sm:block" />
              <div className="rounded-lg border border-[#1a1a1a] bg-[#060607] p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <span className="text-[11px] text-[#666]">Utilization</span>
                <p className="break-words text-white font-medium">{utilization ? `${parseFloat(utilization).toFixed(0)}%` : "—"}</p>
              </div>
              <div className="hidden h-8 w-px bg-[#1a1a1a] sm:block" />
              <div className="rounded-lg border border-[#1a1a1a] bg-[#060607] p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <span className="text-[11px] text-[#666]">Min hold</span>
                <p className="break-words text-white font-medium">7 days</p>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
            {pool.poolType?.replace("_", " ")}
          </span>
          {pool.tags?.map((tag) => (
            <span key={tag} className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row">
        {/* Left Column - Main Content */}
        <div className="w-full space-y-4 xl:w-[65%]">
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
          <PoolTransactionsTable poolAddress={pool.poolAddress} assetSymbol={pool.assetSymbol} />
          <AboutPoolCard pool={pool} />
        </div>

        {/* Right Column - Info Cards */}
        <div className="w-full space-y-4 xl:w-[35%]">
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
    open: "bg-[#00c853]/10 text-[#00c853] border-[#00c853]/20",
    filled: "bg-[#00c853]/10 text-[#00c853] border-[#00c853]/20",
    "funding-ended": "bg-[#1a1a1a] text-[#888] border-[#2b2b2b]",
    matured: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    closed: "bg-[#1a1a1a] text-[#888] border-[#2b2b2b]",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  const statusLabel =
    availability.state === "open" ? "Open" : availability.state === "filled" ? "Funded" : availability.label;

  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-[#1a1a1a] pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          {pool.issuerLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pool.issuerLogo} alt={pool.issuer || pool.name} className="h-7 w-7 rounded-full border border-[#1a1a1a] object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0a0a0a] text-[11px] font-medium text-[#00c853]">
              {pool.name?.[0]?.toUpperCase() || "P"}
            </div>
          )}
          <h1 className="truncate text-lg font-semibold text-white sm:text-xl">{pool.name}</h1>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusStyles[availability.state]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-[#00c853] animate-pulse" : "bg-current opacity-60"}`} />
            {statusLabel}
          </span>
        </div>
        {pool.description && (
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#999] line-clamp-2">{pool.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#666]">
          {pool.issuer && <span>Issued by <span className="text-[#888]">{pool.issuer}</span></span>}
          {pool.issuer && (pool.region || pool.country) && <span className="text-[#333]">·</span>}
          {(pool.region || pool.country) && <span>{pool.region || pool.country}</span>}
        </div>
      </div>
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
    return navHistory.data.map((point) => ({
      date: new Date(point.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: new Date(point.timestamp),
      nav: parseFloat(point.navPerShare),
    }));
  }, [navHistory]);

  const hasHistory = chartData.length >= 2;

  const { minNav, maxNav } = useMemo(() => {
    if (chartData.length === 0) return { minNav: 0, maxNav: 1 };
    const navs = chartData.map((d) => d.nav);
    const min = Math.min(...navs);
    const max = Math.max(...navs);
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 shadow-xl">
        <p className="mb-1 font-mono text-[10px] text-[#666]">{data.date}</p>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-[#00c853]" />
          <span className="text-[#888]">NAV / share</span>
          <span className="ml-auto font-mono font-semibold text-gray-200">
            {data.nav.toFixed(4)} {pool.assetSymbol}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[14px] font-medium text-white">NAV & yield history</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-xl font-semibold text-white sm:text-2xl">
              {displayNav.toFixed(4)} {pool.assetSymbol}
            </span>
            <span className={`text-[12px] ${navChange >= 0 ? "text-[#00c853]" : "text-red-400"}`}>
              {navChange >= 0 ? "+" : ""}{navChange.toFixed(2)}%
            </span>
          </div>
          {displayDate && (
            <span className="text-[11px] text-[#666]">{displayDate}</span>
          )}
        </div>
        <div className="flex gap-1">
          {(["30D", "90D", "1Y"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-[11px] rounded-lg transition-colors ${
                activeTab === tab ? "bg-[#00c853] text-black" : "text-[#666] hover:text-[#888]"
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
            <span className="text-[13px] text-[#888]">Building NAV history</span>
            <span className="max-w-[260px] text-[11px] text-[#555]">
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
                <stop offset="0%" stopColor="#00c853" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#00c853" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={{ stroke: "rgba(255,255,255,0.04)" }}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 10 }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              domain={[minNav, maxNav]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickFormatter={(value) => value.toFixed(4)}
              width={55}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#00c853",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="nav"
              stroke="#00c853"
              strokeWidth={1.75}
              fill="url(#navAreaGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#00c853",
                stroke: "#060607",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center gap-6 text-[11px] mt-4 pt-4 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[#00c853] rounded" />
          <span className="text-[#888]">NAV per share</span>
        </div>
        {performance && (
          <span className="text-[#555]">
            {performance.averageAPY?.toFixed(1)}% avg APY · {performance.volatility?.toFixed(2)}% volatility
          </span>
        )}
        {!performance && (
          <span className="text-[#555]">Past performance is not a guarantee of future returns.</span>
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[14px] font-medium text-white">Funding progress</h3>
          <p className="text-[11px] text-[#666] mt-0.5">
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
              ? "bg-[#00c853]/10 text-[#00c853]"
              : "bg-[#1a1a1a] text-[#666]"
          }`}>
            {fundingOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      {/* Big number */}
      <div className="mt-4 mb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-white">
            {raised.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          {target > 0 && (
            <span className="text-[13px] text-[#666]">
              / {target.toLocaleString(undefined, { maximumFractionDigits: 0 })} {pool.assetSymbol}
            </span>
          )}
        </div>
        {target > 0 && (
          <span className="text-[12px] text-[#00c853] font-medium">{percent.toFixed(1)}% funded</span>
        )}
      </div>

      {/* Progress bar */}
      {target > 0 && (
        <div className="mt-3 mb-2">
          <div className="relative h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${percent}%`,
                background: percent >= 100
                  ? "linear-gradient(90deg, #00c853, #00e676)"
                  : "linear-gradient(90deg, #00c853, #00c853cc)",
              }}
            />
            {/* Milestone markers */}
            {milestones.map((m) => (
              <div
                key={m}
                className="absolute top-0 bottom-0 w-px bg-[#333]"
                style={{ left: `${m}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {milestones.map((m) => (
              <span key={m} className={`text-[9px] ${percent >= m ? "text-[#00c853]" : "text-[#444]"}`}>
                {m}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#1a1a1a] pt-4 text-[11px] sm:flex sm:flex-wrap sm:items-center sm:gap-6">
        <div>
          <span className="text-[#666]">Investors</span>
          <p className="text-white font-medium">{investors}</p>
        </div>
        <div className="hidden h-6 w-px bg-[#1a1a1a] sm:block" />
        <div>
          <span className="text-[#666]">Min deposit</span>
          <p className="text-white font-medium">
            {pool.minInvestment
              ? `${parseFloat(pool.minInvestment).toLocaleString()} ${pool.assetSymbol}`
              : "—"}
          </p>
        </div>
        {epochEnd && (
          <>
            <div className="hidden h-6 w-px bg-[#1a1a1a] sm:block" />
            <div>
              <span className="text-[#666]">Epoch ends</span>
              <p className="text-white font-medium">
                {epochEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </>
        )}
        {target > 0 && (
          <>
            <div className="hidden h-6 w-px bg-[#1a1a1a] sm:block" />
            <div>
              <span className="text-[#666]">Remaining</span>
              <p className="text-white font-medium">
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
            className="w-full rounded-full bg-[#00c853] px-5 py-2.5 text-[12px] font-medium text-black transition-colors hover:bg-[#00b84a] sm:w-auto sm:px-8"
          >
            Deposit
          </button>
        ) : (
          <div className="rounded-lg border border-[#1a1a1a] bg-black/40 px-4 py-3 text-[12px] text-[#888]">
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[#2b2a2a] bg-[#0a0a0b] p-5 sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#676666] uppercase tracking-wider">Deposit</span>
            <h3 className="text-[17px] font-medium text-white">{isLockedPool ? "Lock funds" : `Deposit into ${pool.name}`}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

      {showSuccess ? (
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00c853]/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00c853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h4 className="text-[16px] font-medium text-white">Deposit confirmed</h4>
          <p className="mt-1 text-[12px] text-[#888]">
            {parsedAmount > 0 ? `${parsedAmount.toLocaleString()} ${pool.assetSymbol} deposited.` : "Your deposit was confirmed."}
            {!isLockedPool && parsedAmount > 0 ? ` You received ~${shares.toFixed(2)} shares.` : ""}
          </p>
          {transactionHash && (
            <a
              href={`https://etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[12px] text-[#00c853] hover:underline"
            >
              View transaction ↗
            </a>
          )}
          <button
            onClick={handleDone}
            className="mt-6 w-full rounded-full bg-[#00c853] px-5 py-2.5 text-[12px] font-medium text-black transition-colors hover:bg-[#00b84a]"
          >
            Done
          </button>
        </div>
      ) : (
      <>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">{pool.assetSymbol} only</span>
          {!isLockedPool && <span className="px-3 py-1 text-[11px] text-[#fff] border border-[#1a1a1a] rounded-lg">7 day hold</span>}
          {isLockedPool && <span className="px-3 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">Fixed APY</span>}
        </div>
      <p className="text-[12px] text-[#666] mb-5">
        {isConnected
          ? "Enter an amount, review your estimated yield, and confirm the deposit."
          : "Connect your wallet to deposit and start earning yield."
        }
      </p>

      <div className="w-full">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[12px] text-[#888]">Amount</span>
          <span className="text-[12px] text-[#666]">
            Balance: {isConnected ? `${userBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${pool.assetSymbol}` : `— ${pool.assetSymbol}`}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-[#1a1a1a] bg-black p-3 transition-colors focus-within:border-[#333]">
          <input
            type="text"
            value={amount}
            onChange={(e) => { setAmount(e.target.value.replace(/[^0-9.]/g, "")); setDepositError(null); }}
            placeholder="0.00"
            className="min-w-0 flex-1 bg-transparent text-xl text-white outline-none sm:text-2xl"
          />
          <button className="px-2 py-1 text-[10px] text-[#888] border border-[#1a1a1a] rounded">{pool.assetSymbol}</button>
          <button 
            onClick={handleMaxClick}
            className="px-2 py-1 text-[10px] text-[#888] border border-[#1a1a1a] rounded hover:text-white hover:border-[#333] transition-colors"
          >
            Max
          </button>
        </div>
        <p className="text-[11px] text-[#666] mt-1">≈ ${parsedAmount.toLocaleString()}</p>
        <p className="text-[11px] text-[#666] mt-3">Min deposit {minDeposit.toLocaleString()} {pool.assetSymbol}</p>

        {/* Locked Pool Tier Selection */}
        {isLockedPool && tiers.length > 0 && (
          <div className="mt-4">
            <span className="text-[12px] text-[#888] block mb-2">Select lock period</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {tiers.map((tier: any) => (
                <button
                  key={tier.index}
                  onClick={() => setSelectedTier(tier.index)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedTier === tier.index
                      ? "border-[#00c853] bg-[#00c853]/10"
                      : "border-[#1a1a1a] hover:border-[#333]"
                  }`}
                >
                  <p className="text-[14px] font-medium text-white">{tier.lockDurationDays}d</p>
                  <p className="text-[12px] text-[#00c853]">{tier.interestRatePercent}% APY</p>
                  <p className="text-[10px] text-[#666]">Min: {formatMinDeposit(tier.minDepositFormatted)} {pool.assetSymbol}</p>
                </button>
              ))}
            </div>

            {/* Interest Payment Option */}
            <div className="mt-3">
              <span className="text-[12px] text-[#888] block mb-2">Interest payment</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setInterestPayment("AT_MATURITY")}
                  className={`px-3 py-2 text-[11px] rounded-lg border transition-colors ${
                    interestPayment === "AT_MATURITY"
                      ? "border-[#00c853] bg-[#00c853]/10 text-white"
                      : "border-[#1a1a1a] text-[#888]"
                  }`}
                >
                  At maturity
                </button>
                <button
                  onClick={() => setInterestPayment("UPFRONT")}
                  className={`px-3 py-2 text-[11px] rounded-lg border transition-colors ${
                    interestPayment === "UPFRONT"
                      ? "border-[#00c853] bg-[#00c853]/10 text-white"
                      : "border-[#1a1a1a] text-[#888]"
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
                  <span className="text-[#888]">Lock duration</span>
                  <span className="text-white">{lockedPreview.lockDurationDays} days</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Interest rate</span>
                  <span className="text-[#00c853]">{lockedPreview.interestRatePercent}%</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Expected interest</span>
                  <span className="text-white">{lockedPreview.expectedInterestFormatted}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Maturity date</span>
                  <span className="text-white">{lockedPreview.maturityDate}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Total at maturity</span>
                  <span className="text-white font-medium">{lockedPreview.totalAtMaturityFormatted}</span>
                </div>
              </>
            ) : tiers.find(t => t.index === selectedTier) ? (
              <>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Lock duration</span>
                  <span className="text-white">{tiers.find(t => t.index === selectedTier)?.lockDurationDays} days</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Interest rate</span>
                  <span className="text-[#00c853]">{tiers.find(t => t.index === selectedTier)?.interestRatePercent}%</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Expected interest</span>
                  <span className="text-white">
                    {parsedAmount > 0
                      ? isPreviewFetching ? "calculating..." : isPreviewError ? "unavailable" : "—"
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Maturity date</span>
                  <span className="text-white">—</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Total at maturity</span>
                  <span className="text-white font-medium">—</span>
                </div>
              </>
            ) : null
          ) : (
            <>
              <div className="flex justify-between text-[12px]">
                <span className="text-[#888]">Estimated 12-month yield</span>
                <span className="text-white">{parsedAmount > 0 ? `$${estimatedYield.toFixed(2)}` : "—"}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-[#888]">Deposit fee ({feePercent}%)</span>
                <span className="text-white">{parsedAmount > 0 ? `$${feeAmount.toFixed(2)}` : "—"}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-[#888]">You receive (shares)</span>
                <span className="text-white">{parsedAmount > 0 ? `~${shares.toFixed(2)}` : "—"}</span>
              </div>
            </>
          )}
        </div>

        {depositError && (
          <p className="text-[11px] text-red-400 mt-3">{depositError}</p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleAction}
            disabled={isButtonDisabled}
            className={`w-full flex-1 px-5 py-2.5 text-[12px] font-medium rounded-full transition-colors ${
              isButtonDisabled
                ? "bg-[#1a1a1a] text-[#666] cursor-not-allowed"
                : "bg-[#00c853] text-black hover:bg-[#00b84a]"
            }`}
          >
            {getButtonText()}
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors sm:w-auto"
          >
            Cancel
          </button>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-[#555]">
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
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-[13px] font-medium text-white">Your positions</h3>
          <p className="text-[11px] text-[#666]">Connect a wallet to see deposits and exit eligibility.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
        <h3 className="text-[13px] font-medium text-white mb-4">Your positions</h3>
        <div className="py-4 text-center text-[#666]">Loading positions...</div>
      </div>
    );
  }

  if (!position || parseFloat(position.totalShares || "0") === 0) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
        <h3 className="text-[13px] font-medium text-white mb-4">Your positions</h3>
        <div className="py-4 text-center text-[#666]">No positions in this pool. Deposit above to start earning yield.</div>
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[13px] font-medium text-white">Your positions</h3>
          <p className="text-[11px] text-[#666] mt-0.5">
            {totalShares.toLocaleString()} shares · ${currentValue.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(!showWithdrawModal)}
          disabled={!canWithdraw || exit.isConfirming}
          className={`px-3 py-1.5 text-[11px] rounded-lg transition-colors ${
            canWithdraw
              ? "text-[#00c853] border border-[#00c853]/30 hover:bg-[#00c853]/10"
              : "text-[#666] border border-[#1a1a1a] cursor-not-allowed"
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
            className="px-3 py-1.5 text-[11px] rounded-lg text-[#00c853] border border-[#00c853]/30 hover:bg-[#00c853]/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="px-3 py-1.5 text-[11px] rounded-lg text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exit.isConfirming ? "Confirming..." : "Claim refund"}
            </button>
          )}
        </div>
      )}

      <div className="hidden grid-cols-4 gap-4 border-b border-[#1a1a1a] pb-3 text-[11px] text-[#666] md:grid">
        <span>First deposit</span>
        <span>Shares</span>
        <span>Current value</span>
        <span>Hold status</span>
      </div>

      <div className="grid grid-cols-1 gap-3 py-3 md:grid-cols-4 md:items-center md:gap-4">
        <div className="flex justify-between gap-3 md:block">
          <span className="text-[11px] text-[#666] md:hidden">First deposit</span>
          <span className="text-[12px] text-[#999]">
            {firstDepositTime ? formatDate(firstDepositTime) : "—"}
          </span>
        </div>
        <div className="flex justify-between gap-3 md:block">
          <span className="text-[11px] text-[#666] md:hidden">Shares</span>
          <span className="text-[12px] text-white">{totalShares.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between gap-3 md:block">
          <span className="text-[11px] text-[#666] md:hidden">Current value</span>
          <span className="text-[12px] text-white">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          {totalReturn !== 0 && (
            <span className={`text-[10px] ml-1 ${totalReturn >= 0 ? "text-[#00c853]" : "text-red-400"}`}>
              ({totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)})
            </span>
          )}
        </div>
        <div className="flex justify-between gap-3 md:block">
          <span className="text-[11px] text-[#666] md:hidden">Hold status</span>
          <span className={`text-[11px] ${canWithdraw ? "text-[#00c853]" : "text-[#888]"}`}>
            {holdStatusLabel}
          </span>
        </div>
      </div>

      {/* Withdrawal Panel */}
      {showWithdrawModal && canWithdraw && (
        <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
          <h4 className="text-[12px] font-medium text-white mb-3">
            {isMaturedSingleAsset ? "Redeem matured position" : "Withdraw from position"}
          </h4>

          {isMaturedSingleAsset ? (
            <div className="mb-4 rounded-lg border border-[#1a1a1a] bg-black/40 p-3">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#888]">Shares to redeem</span>
                <span className="text-white">{totalShares.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[#666]">
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
                className="min-w-0 flex-1 px-3 py-2 bg-black border border-[#1a1a1a] rounded-lg text-white text-[14px] outline-none focus:border-[#333]"
              />
              <button
                onClick={() => setWithdrawAmount(String(currentValue))}
                className="px-3 py-2 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white"
              >
                Max
              </button>
            </div>
          )}

          {!isMaturedSingleAsset && withdrawPreview && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#888]">Withdrawal fee</span>
                <span className="text-white">${withdrawPreview.fee || "0.00"}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-[#888]">You receive</span>
                <span className="text-white">${withdrawPreview.netAmount || withdrawAmount}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-[#888]">Method</span>
                <span className="text-white">{withdrawPreview.method || "Instant"}</span>
              </div>
            </div>
          )}

          {queueStatus?.inQueue && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-[11px] text-yellow-500">
                Note: Pool reserves are low. Your withdrawal may be queued.
                Position in queue: {queueStatus.position}
              </p>
            </div>
          )}

          {withdrawError && (
            <p className="mb-3 text-[11px] text-red-500">{withdrawError}</p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleWithdraw}
              disabled={isMaturedSingleAsset ? exit.isConfirming : !withdrawAmount || parseFloat(withdrawAmount) <= 0 || exit.isConfirming}
              className="px-4 py-2 bg-[#00c853] text-black text-[12px] font-medium rounded-lg hover:bg-[#00b84a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exit.isConfirming ? "Confirming..." : isMaturedSingleAsset ? "Confirm Redemption" : "Confirm Withdrawal"}
            </button>
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="px-4 py-2 text-[12px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white"
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
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-[13px] font-medium text-white">Your locked positions</h3>
          <p className="text-[11px] text-[#666]">Connect a wallet to see your locked deposits.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
        <h3 className="text-[13px] font-medium text-white mb-4">Your locked positions</h3>
        <div className="py-4 text-center text-[#666]">Loading positions...</div>
      </div>
    );
  }

  if (poolPositions.length === 0) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
        <h3 className="text-[13px] font-medium text-white mb-4">Your locked positions</h3>
        <div className="py-4 text-center text-[#666]">No locked positions in this pool. Select a lock tier above to start earning.</div>
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[13px] font-medium text-white">Your locked positions</h3>
          <p className="text-[11px] text-[#666] mt-0.5">
            {poolPositions.length} position{poolPositions.length !== 1 ? "s" : ""} · 
            ${totalPrincipal.toLocaleString()} locked · 
            ${totalExpectedInterest.toLocaleString()} expected interest
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeCount > 0 && (
            <span className="px-2 py-1 text-[10px] text-[#00c853] bg-[#00c853]/10 rounded-lg">
              {activeCount} active
            </span>
          )}
          {maturedCount > 0 && (
            <span className="px-2 py-1 text-[10px] text-yellow-400 bg-yellow-400/10 rounded-lg">
              {maturedCount} matured
            </span>
          )}
        </div>
      </div>

      <div className="hidden grid-cols-6 gap-4 border-b border-[#1a1a1a] pb-3 text-[11px] text-[#666] md:grid">
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
          <div key={position.id} className="grid grid-cols-1 gap-3 border-b border-[#1a1a1a] py-4 last:border-0 md:grid-cols-6 md:items-center md:gap-4 md:py-3">
            <div className="flex justify-between gap-3 md:block">
              <span className="text-[11px] text-[#666] md:hidden">Tier</span>
              <span className="text-[12px] text-white">{position.tierName || `Tier ${position.tierIndex}`}</span>
            </div>
            <div className="flex justify-between gap-3 md:block">
              <span className="text-[11px] text-[#666] md:hidden">Principal</span>
              <span className="text-[12px] text-white">${principal.toLocaleString()}</span>
              {position.expectedInterestFormatted && (
                <span className="text-[10px] text-[#00c853] ml-1">+{position.expectedInterestFormatted}</span>
              )}
            </div>
            <div className="flex justify-between gap-3 md:block">
              <span className="text-[11px] text-[#666] md:hidden">Interest Rate</span>
              <span className="text-[12px] text-[#00c853]">{position.interestRatePercent}%</span>
            </div>
            <div className="flex justify-between gap-3 md:block">
              <span className="text-[11px] text-[#666] md:hidden">Maturity</span>
              <span className="text-[12px] text-white">
                {position.maturityDate || position.maturityTimeFormatted || "—"}
              </span>
              {isActive && daysRemaining > 0 && (
                <span className="text-[10px] text-[#666] ml-1">({daysRemaining}d left)</span>
              )}
            </div>
            <div className="flex justify-between gap-3 md:block">
              <span className="text-[11px] text-[#666] md:hidden">Status</span>
              <span className={`text-[11px] px-2 py-1 rounded w-fit ${
                isMatured
                  ? "text-yellow-400 bg-yellow-400/10"
                  : isActive
                  ? "text-[#00c853] bg-[#00c853]/10"
                  : position.status === "REDEEMED"
                  ? "text-[#888] bg-[#1a1a1a]"
                  : "text-red-400 bg-red-400/10"
              }`}>
                {position.status}
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
              {isMatured && (
                <button
                  onClick={() => handleRedeemClick(position)}
                  disabled={exit.isConfirming && pendingPositionId === position.globalPositionId}
                  className="px-3 py-1.5 text-[11px] bg-[#00c853] text-black rounded-lg hover:bg-[#00b84a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exit.isConfirming && pendingPositionId === position.globalPositionId ? "Redeeming..." : "Redeem"}
                </button>
              )}
              {isActive && position.canEarlyExit !== false && (
                <button
                  onClick={() => handleEarlyExitClick(position)}
                  className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white hover:border-[#333]"
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
                      ? "text-[#00c853] border-[#00c853]/30 hover:bg-[#00c853]/10"
                      : "text-[#888] border-[#1a1a1a] hover:text-white hover:border-[#333]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-4 sm:p-6">
            <h3 className="text-[16px] font-medium text-white mb-2">Early Exit Confirmation</h3>
            <p className="text-[12px] text-[#888] mb-4">
              Exiting early will forfeit some of your earned interest and may incur a penalty.
            </p>

            {earlyExitPreview ? (
              <div className="space-y-3 mb-6 p-4 bg-black rounded-lg border border-[#1a1a1a]">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Principal</span>
                  <span className="text-white">${parseFloat(earlyExitPreview.principal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Accrued Interest</span>
                  <span className="text-[#00c853]">+${parseFloat(earlyExitPreview.accruedInterest).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#888]">Days Completed</span>
                  <span className="text-white">{earlyExitPreview.timeElapsedDays} / {earlyExitPreview.timeElapsedDays + earlyExitPreview.timeRemainingDays}</span>
                </div>
                <div className="border-t border-[#1a1a1a] pt-3">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-red-400">Early Exit Penalty ({earlyExitPreview.penaltyPercent}%)</span>
                    <span className="text-red-400">-${parseFloat(earlyExitPreview.earlyExitPenalty).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[12px] mt-2">
                    <span className="text-[#888]">Forfeited Interest</span>
                    <span className="text-[#888]">-${parseFloat(earlyExitPreview.forfeitedInterest).toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-t border-[#1a1a1a] pt-3">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-white font-medium">You Receive</span>
                    <span className="text-white font-medium">${parseFloat(earlyExitPreview.netReceived).toLocaleString()}</span>
                  </div>
                </div>
                {earlyExitPreview.recommendation && (
                  <p className="text-[11px] text-yellow-400 mt-2">{earlyExitPreview.recommendation}</p>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-[#666]">Loading exit preview...</div>
            )}

            {actionError && (
              <p className="mb-3 text-[11px] text-red-500">{actionError}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmEarlyExit}
                disabled={!earlyExitPreview || exit.isConfirming}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white text-[12px] font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exit.isConfirming ? "Confirming..." : "Confirm Early Exit"}
              </button>
              <button
                onClick={() => {
                  setShowEarlyExitModal(false);
                  setSelectedPosition(null);
                }}
                className="flex-1 px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white hover:border-[#333]"
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[11px] text-[#666]">APY Range</span>
          <p className="text-[11px] text-[#666] mt-1">Fixed rates based on lock duration.</p>
        </div>
        <div className="sm:text-right">
          <p className="text-2xl font-semibold text-[#00c853] sm:text-3xl">
            {minAPY === maxAPY ? `${minAPY}%` : `${minAPY}–${maxAPY}%`}
          </p>
          <p className="text-[11px] text-[#666]">Fixed APY</p>
        </div>
      </div>

      {/* Lock Tiers Summary */}
      {tiers.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a]">
          <span className="text-[10px] text-[#666] uppercase tracking-wider">Lock Tiers</span>
          <div className="mt-2 space-y-1">
            {tiers.slice(0, 3).map((tier) => (
              <div key={tier.index} className="flex justify-between text-[11px]">
                <span className="text-[#888]">{tier.lockDurationDays}d lock</span>
                <span className="text-[#00c853]">{tier.interestRatePercent}% APY</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isConnected && hasPositions && (
        <div className="mb-4 p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a]">
          <span className="text-[10px] text-[#666] uppercase tracking-wider">Your locked deposits</span>
          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-xl font-semibold text-white">${totalPrincipal.toLocaleString()}</span>
            <span className="text-[12px] text-[#00c853]">
              +${totalExpectedInterest.toLocaleString()} expected
            </span>
          </div>
          <p className="text-[11px] text-[#666] mt-1">
            {poolPositions.length} position{poolPositions.length !== 1 ? "s" : ""}
            {maturedCount > 0 && ` · ${maturedCount} ready to redeem`}
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">
          {tiers.length} lock tiers
        </span>
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">
          {lockedMetrics?.activePositions || 0} active positions
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {!isConnected ? (
          <button
            onClick={() => open()}
            className="flex-1 px-4 py-2.5 bg-[#00c853] text-black text-[12px] font-medium rounded-full hover:bg-[#00b84a] transition-colors"
          >
            Connect wallet
          </button>
        ) : availability.canDeposit ? (
          <>
            <button
              onClick={onDeposit}
              className="flex-1 px-4 py-2.5 bg-[#00c853] text-black text-[12px] font-medium rounded-full hover:bg-[#00b84a] transition-colors"
            >
              {hasPositions ? "Lock more" : "Lock deposit"}
            </button>
            {maturedCount > 0 && (
              <button className="flex-1 px-4 py-2.5 text-[12px] text-yellow-400 border border-yellow-400/30 rounded-full hover:bg-yellow-400/10 transition-colors">
                Redeem matured
              </button>
            )}
          </>
        ) : (
          <>
            <button
              disabled
              className="flex-1 px-4 py-2.5 bg-[#1a1a1a] text-[#666] text-[12px] font-medium rounded-full cursor-not-allowed"
            >
              {availability.label}
            </button>
            {maturedCount > 0 && (
              <button className="flex-1 px-4 py-2.5 text-[12px] text-yellow-400 border border-yellow-400/30 rounded-full hover:bg-yellow-400/10 transition-colors">
                Redeem matured
              </button>
            )}
          </>
        )}
      </div>

      <p className="text-[11px] text-[#666]">
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[11px] text-[#666]">{isFixed ? "Fixed APY" : "Current APY"}</span>
          <p className="text-[11px] text-[#666] mt-1">
            {isFixed ? "Fixed rate, set at issuance." : "Variable, based on underlying yield."}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-2xl font-semibold text-[#00c853] sm:text-3xl">{effectiveApy.hasValue ? formatAPY(effectiveApy.apy) : "—"}</p>
          <p className="text-[11px] text-[#666]">Net of fees</p>
        </div>
      </div>

      {isConnected && hasPosition && (
        <div className="mb-4 p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a]">
          <span className="text-[10px] text-[#666] uppercase tracking-wider">Your position</span>
          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-xl font-semibold text-white">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className={`text-[12px] ${totalReturn >= 0 ? "text-[#00c853]" : "text-red-400"}`}>
              {totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)} ({returnPercent >= 0 ? "+" : ""}{returnPercent.toFixed(1)}%)
            </span>
          </div>
          <p className="text-[11px] text-[#666] mt-1">{totalShares.toLocaleString(undefined, { maximumFractionDigits: 2 })} shares</p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">
          Share price {navPerShare ? parseFloat(navPerShare).toFixed(4) : "1.0000"}
        </span>
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">NAV refresh: daily</span>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {!isConnected ? (
          <button
            onClick={() => open()}
            className="flex-1 px-4 py-2.5 bg-[#00c853] text-black text-[12px] font-medium rounded-full hover:bg-[#00b84a] transition-colors"
          >
            Connect wallet
          </button>
        ) : canDeposit ? (
          <>
            <button
              onClick={onDeposit}
              className="flex-1 px-4 py-2.5 bg-[#00c853] text-black text-[12px] font-medium rounded-full hover:bg-[#00b84a] transition-colors"
            >
              {hasPosition ? "Deposit more" : "Deposit"}
            </button>
            {hasPosition && (
              <button
                onClick={scrollToPositions}
                className="flex-1 px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors"
              >
                Withdraw
              </button>
            )}
          </>
        ) : (
          <>
            <button
              disabled
              className="flex-1 px-4 py-2.5 bg-[#1a1a1a] text-[#666] text-[12px] font-medium rounded-full cursor-not-allowed"
            >
              {availability.label}
            </button>
            {hasPosition && (
              <button
                onClick={scrollToPositions}
                className="flex-1 px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors"
              >
                Withdraw
              </button>
            )}
          </>
        )}
      </div>

      <p className="text-[11px] text-[#666]">
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <h3 className="text-[13px] font-medium text-white mb-0.5">Pool stats</h3>
      <p className="text-[11px] text-[#666] mb-4">Key numbers for {pool.name}.</p>

      {isLoading || (isLockedPool && !lockedMetrics) ? (
        <div className="py-4 text-center text-[#666] text-[12px]">Loading stats...</div>
      ) : isLockedPool && lockedMetrics ? (
        <div className="space-y-2.5">
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Total Deposits</span>
            <span className="text-white">{parseFloat((lockedMetrics.totalDepositsFormatted || "0").replace(/,/g, "")).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Active Positions</span>
            <span className="text-white">{lockedMetrics.activePositions ?? "—"}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Total Positions</span>
            <span className="text-white">{lockedMetrics.totalPositionsCreated ?? "—"}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Available Liquidity</span>
            <span className="text-white">{parseFloat((lockedMetrics.availableLiquidityFormatted || "0").replace(/,/g, "")).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Lock Tiers</span>
            <span className="text-white">{tiers?.length ?? "—"}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {effectiveApy && (
            <div className="flex justify-between text-[12px]">
              <span className="text-[#888]">{effectiveApy.isFixed ? "Fixed APY" : "Current APY"}</span>
              <span className="text-[#00c853]">{effectiveApy.hasValue ? formatAPY(effectiveApy.apy) : "—"}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">TVL</span>
            <span className="text-white">{formatValue(tvl)}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Utilization</span>
            <span className="text-white">{utilization ? `${parseFloat(utilization).toFixed(0)}%` : "—"}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Investors</span>
            <span className="text-white">{totalInvestors || "—"}</span>
          </div>
          {minDeposit && (
            <div className="flex justify-between text-[12px]">
              <span className="text-[#888]">Min deposit</span>
              <span className="text-white">{parseFloat(minDeposit).toLocaleString()} {pool.assetSymbol}</span>
            </div>
          )}
          {isSingleAsset && pool.targetRaise && (
            <div className="flex justify-between text-[12px]">
              <span className="text-[#888]">Target raise</span>
              <span className="text-white">{parseFloat(pool.targetRaise).toLocaleString()} {pool.assetSymbol}</span>
            </div>
          )}
          {isSingleAsset && pool.maturityDate && (
            <div className="flex justify-between text-[12px]">
              <span className="text-[#888]">Maturity</span>
              <span className="text-white">{formatDate(pool.maturityDate)}</span>
            </div>
          )}
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">NAV per share</span>
            <span className="text-white">{navPerShare ? `${parseFloat(navPerShare).toFixed(4)} ${pool.assetSymbol}` : "—"}</span>
          </div>
          {averageDeposit && (
            <div className="flex justify-between text-[12px]">
              <span className="text-[#888]">Avg deposit</span>
              <span className="text-white">{formatValue(averageDeposit)}</span>
            </div>
          )}
          {volume24h && (
            <div className="flex justify-between text-[12px]">
              <span className="text-[#888]">24h volume</span>
              <span className="text-white">{formatValue(volume24h)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">{pool.poolType?.replace("_", " ")}</span>
        {pool.status && (
          <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">{pool.status}</span>
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <h3 className="text-[13px] font-medium text-white mb-0.5">Underlying allocation</h3>
      <p className="text-[11px] text-[#666] mb-4">Indicative split across instruments.</p>

      {isLoading ? (
        <div className="py-4 text-center text-[#666] text-[12px]">Loading...</div>
      ) : (
        <div className="space-y-2.5">
          {allocationData.map((item: any, index: number) => (
            <div key={index} className="flex justify-between text-[12px]">
              <span className="text-[#888]">{item.name}</span>
              <span className="text-white">{item.percentage}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-[#1a1a1a] mt-4 pt-4 space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Average duration</span>
          <span className="text-[#888]">&lt; 45 days</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Next NAV event</span>
          <span className="text-[#888]">In ~6 hours</span>
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
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
        <h3 className="text-[13px] font-medium text-white mb-0.5">Lock periods & exits</h3>
        <p className="text-[11px] text-[#666] mb-4">How deposits work in this locked pool.</p>

        <div className="space-y-2.5">
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Lock durations</span>
            <span className="text-white">
              {minLockDays && maxLockDays
                ? minLockDays === maxLockDays
                  ? `${minLockDays} days`
                  : `${minLockDays}–${maxLockDays} days`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Redemption</span>
            <span className="text-white">At maturity only</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Early exit</span>
            <span className="text-white">Allowed with penalty</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Early exit penalty</span>
            <span className="text-yellow-500">{earlyExitPenalty}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Interest payment</span>
            <span className="text-white">Upfront or at maturity</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">Fixed APY</span>
          <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">Auto-rollover available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <h3 className="text-[13px] font-medium text-white mb-0.5">Holding & exits</h3>
      <p className="text-[11px] text-[#666] mb-4">How capital moves in and out of the pool.</p>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Minimum holding period</span>
          <span className="text-white">7 days</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Withdrawal model</span>
          <span className="text-white">Instant if reserves, else queue</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Withdrawal fee</span>
          <span className="text-white">{withdrawalFee}</span>
        </div>
        {queueLength > 0 && (
          <div className="flex justify-between text-[12px]">
            <span className="text-[#888]">Current queue</span>
            <span className="text-yellow-500">{queueLength} requests · {queueAmount}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">Queue visible in app</span>
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">No lockup after 7 days</span>
      </div>
    </div>
  );
}

function RiskCard({ pool }: { pool: Pool }) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <h3 className="text-[13px] font-medium text-white mb-0.5">Risk & disclosures</h3>
      <p className="text-[11px] text-[#666] mb-4">Understand how this pool behaves under stress.</p>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Risk rating</span>
          <span className="text-white">{pool.riskRating || "—"}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Primary risks</span>
          <span className="text-white">Rate, Counterparty</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#888]">Region</span>
          <span className="text-white">{pool.region || pool.country || "Global"}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
          View full disclosures
        </button>
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
          Tax & reporting
        </button>
      </div>
    </div>
  );
}

function AboutPoolCard({ pool }: { pool: Pool }) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <h3 className="text-[15px] font-medium text-white mb-1">About this Pool</h3>
      <p className="text-[13px] text-[#999] mb-5">
        {pool.description || "No description available."}
      </p>

      <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-8">
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Pool Type</span>
          <span className="text-white">{pool.poolType?.replace("_", " ") || "—"}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Security Type</span>
          <span className="text-white">{pool.securityType || "—"}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Risk Rating</span>
          <span className="text-white">{pool.riskRating || "—"}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Issuer</span>
          <span className="text-white">{pool.issuer || "Piron Finance"}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[#666]">Region</span>
          <span className="text-white">{pool.region || pool.country || "Global"}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white hover:border-[#333] transition-colors">
          Strategy docs
        </button>
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white hover:border-[#333] transition-colors">
          Smart contracts
        </button>
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white hover:border-[#333] transition-colors">
          Audit report
        </button>
      </div>
    </div>
  );
}

function PoolTransactionsTable({ poolAddress, assetSymbol }: { poolAddress: string; assetSymbol: string }) {
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-[13px] font-medium text-white">Pool transactions</h3>
        <div className="flex w-full gap-1 overflow-x-auto sm:w-auto">
          {(["all", "deposits", "withdrawals"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[11px] rounded-lg transition-colors capitalize ${
                filter === f ? "bg-[#1a1a1a] text-white" : "text-[#666] hover:text-[#888]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-[#666]">Loading transactions...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="py-8 text-center text-[#666]">No transactions found</div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="rounded-lg border border-[#1a1a1a] bg-black/40 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span
                    className={`px-2 py-1 text-[10px] font-medium rounded ${
                      isDepositType(tx.type)
                        ? "bg-[#1a1a1a] text-white"
                        : isWithdrawalType(tx.type)
                        ? "bg-red-500/10 text-red-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {txTypeLabel(tx.type)}
                  </span>
                  <span className="text-right text-[11px] text-[#666]">{formatTime(tx.timestamp)}</span>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#666]">Amount</span>
                    <span className="text-right font-medium text-white">
                      {parseFloat(tx.amount).toLocaleString()} {assetSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#666]">User</span>
                    <span className="font-mono text-[#999]">
                      {truncateAddress(tx.userWallet || tx.user?.walletAddress || tx.from || "")}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#666]">Hash</span>
                    <a
                      href={`https://etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#00c853] hover:underline"
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
                <tr className="text-[11px] text-[#666] border-b border-[#1a1a1a]">
                  <th className="text-left font-normal pb-3">Time</th>
                  <th className="text-left font-normal pb-3">Type</th>
                  <th className="text-left font-normal pb-3">User</th>
                  <th className="text-left font-normal pb-3">Amount</th>
                  <th className="text-left font-normal pb-3">Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-[#1a1a1a] last:border-0">
                    <td className="py-3 text-[12px] text-[#999]">{formatTime(tx.timestamp)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 text-[10px] font-medium rounded ${
                          isDepositType(tx.type)
                            ? "bg-[#1a1a1a] text-white"
                            : isWithdrawalType(tx.type)
                            ? "bg-red-500/10 text-red-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {txTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="py-3 text-[12px] text-[#999] font-mono">
                      {truncateAddress(tx.userWallet || tx.user?.walletAddress || tx.from || "")}
                    </td>
                    <td className="py-3 text-[12px] text-white font-medium">
                      {parseFloat(tx.amount).toLocaleString()} {assetSymbol}
                    </td>
                    <td className="py-3">
                      <a
                        href={`https://etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-[#00c853] font-mono hover:underline"
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
          <button className="px-4 py-2 text-[11px] text-[#666] hover:text-[#888] transition-colors">
            Load more transactions
          </button>
        </div>
      )}
    </div>
  );
}
