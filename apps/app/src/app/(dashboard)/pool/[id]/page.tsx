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
import { useFeeCalculation, usePoolFeeRates } from "@/hooks/useFees";
import { useWithdrawalPreview, useWithdrawalQueueStatus, usePoolWithdrawalRequests } from "@/hooks/useWithdrawals";
import { usePoolTiers, useLockedPoolMetrics, useLockedDepositPreview, useUserLockedPositions, useEarlyExitPreview } from "@/hooks/useLockedPools";
import type { Pool, Transaction, LockedPosition } from "@/lib/api/types";

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

  // Fetch locked pool metrics for locked pools
  const { data: lockedMetrics } = useLockedPoolMetrics(
    isLockedPool ? pool.chainId : undefined,
    isLockedPool ? pool.poolAddress : undefined
  );
  const { data: tiersData } = usePoolTiers(isLockedPool ? pool.poolAddress : undefined);

  // Use pool.lockTiers from the detail response as an immediate source; fall back to tiers API
  const tiers = (tiersData?.tiers?.length ? tiersData.tiers : pool.lockTiers) || [];
  const minLockDays = tiers.length > 0 ? Math.min(...tiers.map(t => t.lockDurationDays)) : undefined;
  const maxLockDays = tiers.length > 0 ? Math.max(...tiers.map(t => t.lockDurationDays)) : undefined;
  const minAPY = tiers.length > 0 ? Math.min(...tiers.map(t => parseFloat(t.interestRatePercent))) : undefined;
  const maxAPY = tiers.length > 0 ? Math.max(...tiers.map(t => parseFloat(t.interestRatePercent))) : undefined;

  return (
    <div className="min-h-screen bg-black p-4">
      {/* Top Analytics Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] text-[#666]">{isLockedPool ? "Total Deposits" : "TVL"}</span>
            <p className="text-white font-medium">
              {isLockedPool && lockedMetrics
                ? parseFloat((lockedMetrics.totalDepositsFormatted || "0").replace(/,/g, "")).toLocaleString("en-US", { maximumFractionDigits: 2 })
                : formatValue(tvl)}
            </p>
          </div>
          <div className="w-px h-8 bg-[#1a1a1a]" />
          {isLockedPool ? (
            <>
              <div>
                <span className="text-[11px] text-[#666]">Active Positions</span>
                <p className="text-white font-medium">{lockedMetrics?.activePositions ?? "—"}</p>
              </div>
              <div className="w-px h-8 bg-[#1a1a1a]" />
              <div>
                <span className="text-[11px] text-[#666]">Lock Periods</span>
                <p className="text-white font-medium">
                  {minLockDays && maxLockDays
                    ? minLockDays === maxLockDays
                      ? `${minLockDays}d`
                      : `${minLockDays}–${maxLockDays}d`
                    : "—"}
                </p>
              </div>
              <div className="w-px h-8 bg-[#1a1a1a]" />
              <div>
                <span className="text-[11px] text-[#666]">APY Range</span>
                <p className="text-[#00c853] font-medium">
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
              <div>
                <span className="text-[11px] text-[#666]">Utilization</span>
                <p className="text-white font-medium">{utilization ? `${parseFloat(utilization).toFixed(0)}%` : "—"}</p>
              </div>
              <div className="w-px h-8 bg-[#1a1a1a]" />
              <div>
                <span className="text-[11px] text-[#666]">Min hold</span>
                <p className="text-white font-medium">7 days</p>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2">
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

      <div className="flex gap-4">
        {/* Left Column - Main Content */}
        <div className="w-[65%] space-y-4">
          {!isLockedPool && <NAVYieldHistory pool={pool} />}
          <div id="deposit-section"><DepositFlow pool={pool} tiers={tiers} /></div>
          {isLockedPool ? (
            <LockedPositions pool={pool} />
          ) : (
            <YourPositions pool={pool} />
          )}
          <PoolTransactionsTable poolAddress={pool.poolAddress} assetSymbol={pool.assetSymbol} />
          <AboutPoolCard pool={pool} />
        </div>

        {/* Right Column - Info Cards */}
        <div className="w-[35%] space-y-4">
          {isLockedPool ? (
            <LockedAPYCard pool={pool} tiers={tiers} lockedMetrics={lockedMetrics} />
          ) : (
            <APYCard pool={pool} />
          )}
          <PoolStatsCard pool={pool} isLockedPool={isLockedPool} lockedMetrics={lockedMetrics} tiers={tiers} />
          {!isLockedPool && <AllocationCard pool={pool} />}
          <HoldingExitsCard pool={pool} isLockedPool={isLockedPool} tiers={tiers} />
          <RiskCard pool={pool} />
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

  const chartData = useMemo(() => {
    if (navHistory?.data && navHistory.data.length > 0) {
      return navHistory.data.map((point) => ({
        date: new Date(point.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: new Date(point.timestamp),
        nav: parseFloat(point.navPerShare),
      }));
    }

    // Fallback to generated data if no API data
    const points = activeTab === "30D" ? 30 : activeTab === "90D" ? 90 : 365;
    const data: { date: string; fullDate: Date; nav: number }[] = [];
    const baseNAV = pool.analytics?.navPerShare ? parseFloat(pool.analytics.navPerShare) : 1.0;
    const now = new Date();

    for (let i = 0; i < points; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (points - i));
      const variance = (Math.random() - 0.5) * 0.003;
      const growth = (i / points) * 0.05;
      const nav = baseNAV - growth + variance;
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: date,
        nav,
      });
    }
    return data;
  }, [navHistory, activeTab, pool.analytics?.navPerShare]);

  const { minNav, maxNav } = useMemo(() => {
    const navs = chartData.map((d) => d.nav);
    const min = Math.min(...navs);
    const max = Math.max(...navs);
    const padding = (max - min) * 0.1 || 0.001;
    return { minNav: min - padding, maxNav: max + padding };
  }, [chartData]);

  const currentNav = chartData[chartData.length - 1]?.nav ?? 1;
  const startNav = chartData[0]?.nav ?? 1;
  const navChange = ((currentNav - startNav) / startNav) * 100;

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
      <div className="bg-[#111] border border-[#222] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-[11px] text-[#888]">{data.date}</p>
        <p className="text-[13px] text-white font-medium">{data.nav.toFixed(4)} {pool.assetSymbol}</p>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-medium text-white">NAV & yield history</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl font-semibold text-white">
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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="navAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00c853" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00c853" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#444", fontSize: 10 }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              domain={[minNav, maxNav]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#444", fontSize: 10 }}
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
              strokeWidth={2}
              fill="url(#navAreaGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#00c853",
                stroke: "#060607",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
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

function DepositFlow({ pool, tiers: tiersProp }: { pool: Pool; tiers?: any[] }) {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [amount, setAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [interestPayment, setInterestPayment] = useState<"UPFRONT" | "AT_MATURITY">("AT_MATURITY");

  const isLockedPool = pool.poolType === "LOCKED";
  
  const {
    deposit,
    approve,
    needsApproval,
    hasInsufficientBalance,
    refetchAllowance,
    isApproving,
    isApprovalSuccess,
    isConfirming,
    isDepositing,
    balance,
  } = useDeposit(pool);

  // After approval succeeds, refetch allowance so button switches to "Deposit"
  useEffect(() => {
    if (isApprovalSuccess) {
      refetchAllowance();
    }
  }, [isApprovalSuccess, refetchAllowance]);

  const { data: feeRates } = usePoolFeeRates(pool.poolAddress);

  // Debounce amount for API queries so they don't fire on every keystroke
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout>();
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedAmount(amount), 500);
    return () => clearTimeout(debounceTimer.current);
  }, [amount]);

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
  const apy = pool.analytics?.apy ? parseFloat(pool.analytics.apy) : 6.0;
  const minDeposit = pool.minDeposit ? parseFloat(pool.minDeposit) : 50;

  const parsedAmount = parseFloat(amount) || 0;
  

  const feeAmount = feeCalc?.fee ? parseFloat(feeCalc.fee) : parsedAmount * depositFeeRate;
  const netAmount = feeCalc?.netAmount ? parseFloat(feeCalc.netAmount) : parsedAmount - feeAmount;
  const shares = parsedAmount > 0 ? netAmount / sharePrice : 0;
  const estimatedYield = parsedAmount > 0 ? (netAmount * apy) / 100 : 0;

  const userBalance = balance ? parseFloat(balance) : 0;
  const requiresApproval = isConnected && parsedAmount > 0 && needsApproval(amount);
  const insufficientBalance = isConnected && parsedAmount > 0 && hasInsufficientBalance(amount);

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

    try {
      if (requiresApproval) {
        await approve(amount);
      } else {
        await deposit(amount, isLockedPool ? selectedTier : undefined, isLockedPool ? interestPayment : undefined);
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const getButtonText = () => {
    if (!isConnected) return "Connect wallet to continue";
    if (isApproving) return "Approving...";
    if (isConfirming) return "Confirming deposit...";
    if (parsedAmount === 0) return "Enter amount";
    if (parsedAmount < minDeposit) return `Minimum ${minDeposit} ${pool.assetSymbol}`;
    if (insufficientBalance) return "Insufficient balance";
    if (requiresApproval) return `Approve ${pool.assetSymbol}`;
    return "Deposit";
  };

  const isButtonDisabled = isDepositing || (isConnected && (parsedAmount === 0 || parsedAmount < minDeposit || insufficientBalance));
  const feePercent = (depositFeeRate * 100).toFixed(2);

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-[10px] text-[#666] uppercase tracking-wider">Deposit</span>
          <h3 className="text-[16px] font-medium text-white">Fund the pool in a few clicks.</h3>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">{pool.assetSymbol} only</span>
          {!isLockedPool && <span className="px-3 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">7 day hold</span>}
          {isLockedPool && <span className="px-3 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">Fixed APY</span>}
        </div>
      </div>
      <p className="text-[12px] text-[#666] mb-5">
        {isConnected 
          ? "Enter an amount, review your estimated yield, and confirm the deposit."
          : "Connect your wallet to deposit and start earning yield."
        }
      </p>

      <div className="max-w-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-[#888]">Amount</span>
          <span className="text-[12px] text-[#666]">
            Balance: {isConnected ? `${userBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${pool.assetSymbol}` : `— ${pool.assetSymbol}`}
          </span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl border border-[#1a1a1a] bg-black focus-within:border-[#333] transition-colors">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="flex-1 bg-transparent text-2xl text-white outline-none"
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
        <p className="text-[11px] text-[#666] mt-3">Min deposit {minDeposit} {pool.assetSymbol}</p>

        {/* Locked Pool Tier Selection */}
        {isLockedPool && tiers.length > 0 && (
          <div className="mt-4">
            <span className="text-[12px] text-[#888] block mb-2">Select lock period</span>
            <div className="grid grid-cols-3 gap-2">
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
              <div className="flex gap-2">
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

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleAction}
            disabled={isButtonDisabled}
            className={`px-5 py-2.5 text-[12px] font-medium rounded-full transition-colors ${
              isButtonDisabled
                ? "bg-[#1a1a1a] text-[#666] cursor-not-allowed"
                : "bg-[#00c853] text-black hover:bg-[#00b84a]"
            }`}
          >
            {getButtonText()}
          </button>
          <button className="px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
            View withdrawal policy
          </button>
        </div>
      </div>
    </div>
  );
}

function YourPositions({ pool }: { pool: Pool }) {
  const { address, isConnected } = useAccount();
  const { data: position, isLoading } = useUserPositionInPool(address, pool.poolAddress);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

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
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-medium text-white">Your positions</h3>
          <p className="text-[11px] text-[#666]">Connect a wallet to see deposits and exit eligibility.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
        <h3 className="text-[13px] font-medium text-white mb-4">Your positions</h3>
        <div className="py-4 text-center text-[#666]">Loading positions...</div>
      </div>
    );
  }

  if (!position || parseFloat(position.totalShares || "0") === 0) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
        <h3 className="text-[13px] font-medium text-white mb-4">Your positions</h3>
        <div className="py-4 text-center text-[#666]">No positions in this pool. Deposit above to start earning yield.</div>
      </div>
    );
  }

  const currentValue = parseFloat(position.currentValue || "0");
  const totalShares = parseFloat(position.totalShares || "0");
  const totalReturn = parseFloat(position.totalReturn || "0");
  const daysHeld = position.daysHeld || 0;
  const canWithdraw = daysHeld >= 7;

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-medium text-white">Your positions</h3>
          <p className="text-[11px] text-[#666] mt-0.5">
            {totalShares.toLocaleString()} shares · ${currentValue.toLocaleString()}
          </p>
        </div>
        <button 
          onClick={() => setShowWithdrawModal(!showWithdrawModal)}
          disabled={!canWithdraw}
          className={`px-3 py-1.5 text-[11px] rounded-lg transition-colors ${
            canWithdraw 
              ? "text-[#00c853] border border-[#00c853]/30 hover:bg-[#00c853]/10"
              : "text-[#666] border border-[#1a1a1a] cursor-not-allowed"
          }`}
        >
          Withdraw
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 text-[11px] text-[#666] border-b border-[#1a1a1a] pb-3">
        <span>First deposit</span>
        <span>Shares</span>
        <span>Current value</span>
        <span>Hold status</span>
      </div>

      <div className="grid grid-cols-4 gap-4 py-3 items-center">
        <span className="text-[12px] text-[#999]">
          {position.firstDepositTime ? formatDate(position.firstDepositTime) : "—"}
        </span>
        <span className="text-[12px] text-white">{totalShares.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        <div>
          <span className="text-[12px] text-white">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          {totalReturn !== 0 && (
            <span className={`text-[10px] ml-1 ${totalReturn >= 0 ? "text-[#00c853]" : "text-red-400"}`}>
              ({totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)})
            </span>
          )}
        </div>
        <span className={`text-[11px] ${canWithdraw ? "text-[#00c853]" : "text-[#888]"}`}>
          {canWithdraw ? "Unlocked" : `${7 - daysHeld}d remaining`}
        </span>
      </div>

      {/* Withdrawal Panel */}
      {showWithdrawModal && canWithdraw && (
        <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
          <h4 className="text-[12px] font-medium text-white mb-3">Withdraw from position</h4>
          
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              className="flex-1 px-3 py-2 bg-black border border-[#1a1a1a] rounded-lg text-white text-[14px] outline-none focus:border-[#333]"
            />
            <button 
              onClick={() => setWithdrawAmount(String(currentValue))}
              className="px-3 py-2 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg hover:text-white"
            >
              Max
            </button>
          </div>

          {withdrawPreview && (
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

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#00c853] text-black text-[12px] font-medium rounded-lg hover:bg-[#00b84a]">
              Confirm Withdrawal
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
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-medium text-white">Your locked positions</h3>
          <p className="text-[11px] text-[#666]">Connect a wallet to see your locked deposits.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
        <h3 className="text-[13px] font-medium text-white mb-4">Your locked positions</h3>
        <div className="py-4 text-center text-[#666]">Loading positions...</div>
      </div>
    );
  }

  if (poolPositions.length === 0) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
        <h3 className="text-[13px] font-medium text-white mb-4">Your locked positions</h3>
        <div className="py-4 text-center text-[#666]">No locked positions in this pool. Select a lock tier above to start earning.</div>
      </div>
    );
  }

  const totalPrincipal = poolPositions.reduce((sum, p) => sum + parseFloat(p.principal || "0"), 0);
  const totalExpectedInterest = poolPositions.reduce((sum, p) => sum + parseFloat(p.expectedInterest || "0"), 0);
  const activeCount = poolPositions.filter((p) => p.status === "ACTIVE").length;
  const maturedCount = poolPositions.filter((p) => p.status === "MATURED").length;

  const handleRedeemClick = (position: LockedPosition) => {
    // TODO: Wire up redeem matured position
    console.log("Redeem position:", position.globalPositionId);
  };

  const handleEarlyExitClick = (position: LockedPosition) => {
    setSelectedPosition(position);
    setShowEarlyExitModal(true);
  };

  const confirmEarlyExit = () => {
    // TODO: Wire up early exit mutation
    console.log("Confirm early exit for:", selectedPosition?.globalPositionId);
    setShowEarlyExitModal(false);
    setSelectedPosition(null);
  };

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-medium text-white">Your locked positions</h3>
          <p className="text-[11px] text-[#666] mt-0.5">
            {poolPositions.length} position{poolPositions.length !== 1 ? "s" : ""} · 
            ${totalPrincipal.toLocaleString()} locked · 
            ${totalExpectedInterest.toLocaleString()} expected interest
          </p>
        </div>
        <div className="flex gap-2">
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

      <div className="grid grid-cols-6 gap-4 text-[11px] text-[#666] border-b border-[#1a1a1a] pb-3">
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
          <div key={position.id} className="grid grid-cols-6 gap-4 py-3 items-center border-b border-[#1a1a1a] last:border-0">
            <span className="text-[12px] text-white">{position.tierName || `Tier ${position.tierIndex}`}</span>
            <div>
              <span className="text-[12px] text-white">${principal.toLocaleString()}</span>
              {position.expectedInterestFormatted && (
                <span className="text-[10px] text-[#00c853] ml-1">+{position.expectedInterestFormatted}</span>
              )}
            </div>
            <span className="text-[12px] text-[#00c853]">{position.interestRatePercent}%</span>
            <div>
              <span className="text-[12px] text-white">
                {position.maturityDate || position.maturityTimeFormatted || "—"}
              </span>
              {isActive && daysRemaining > 0 && (
                <span className="text-[10px] text-[#666] ml-1">({daysRemaining}d left)</span>
              )}
            </div>
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
            <div className="flex gap-2">
              {isMatured && (
                <button
                  onClick={() => handleRedeemClick(position)}
                  className="px-3 py-1.5 text-[11px] bg-[#00c853] text-black rounded-lg hover:bg-[#00b84a]"
                >
                  Redeem
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
            </div>
          </div>
        );
      })}

      {/* Early Exit Confirmation Modal */}
      {showEarlyExitModal && selectedPosition && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 max-w-md w-full mx-4">
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

            <div className="flex gap-3">
              <button
                onClick={confirmEarlyExit}
                disabled={!earlyExitPreview}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white text-[12px] font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Early Exit
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

function LockedAPYCard({ pool, tiers, lockedMetrics }: { pool: Pool; tiers: any[]; lockedMetrics: any }) {
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[11px] text-[#666]">APY Range</span>
          <p className="text-[11px] text-[#666] mt-1">Fixed rates based on lock duration.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-[#00c853]">
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
          <div className="flex items-baseline justify-between mt-1">
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

      <div className="flex gap-2 mb-4">
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">
          {tiers.length} lock tiers
        </span>
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">
          {lockedMetrics?.activePositions || 0} active positions
        </span>
      </div>

      <div className="flex gap-3 mb-4">
        {isConnected ? (
          <>
            <button
              onClick={() => document.getElementById("deposit-section")?.scrollIntoView({ behavior: "smooth" })}
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
              onClick={() => open()}
              className="flex-1 px-4 py-2.5 bg-[#00c853] text-black text-[12px] font-medium rounded-full hover:bg-[#00b84a] transition-colors"
            >
              Connect wallet
            </button>
            <button className="flex-1 px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
              View tiers
            </button>
          </>
        )}
      </div>

      <p className="text-[11px] text-[#666]">
        {isConnected
          ? "Interest is calculated daily and paid at maturity. Early exit incurs a penalty."
          : "Connect a wallet to lock funds and earn fixed APY for the selected term."
        }
      </p>
    </div>
  );
}

function APYCard({ pool }: { pool: Pool }) {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { data: position } = useUserPositionInPool(address, pool.poolAddress);

  const apy = pool.analytics?.apy ? parseFloat(pool.analytics.apy) : 0;
  const navPerShare = pool.analytics?.navPerShare;
  
  const hasPosition = position && parseFloat(position.totalShares || "0") > 0;
  const currentValue = hasPosition ? parseFloat(position.currentValue || "0") : 0;
  const totalReturn = hasPosition ? parseFloat(position.totalReturn || "0") : 0;
  const totalShares = hasPosition ? parseFloat(position.totalShares || "0") : 0;
  const returnPercent = hasPosition ? parseFloat(position.totalReturnPercentage || "0") : 0;

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[11px] text-[#666]">Current APY</span>
          <p className="text-[11px] text-[#666] mt-1">Variable, based on underlying yield.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-[#00c853]">{formatAPY(apy)}</p>
          <p className="text-[11px] text-[#666]">Net of fees</p>
        </div>
      </div>

      {isConnected && hasPosition && (
        <div className="mb-4 p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a]">
          <span className="text-[10px] text-[#666] uppercase tracking-wider">Your position</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold text-white">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className={`text-[12px] ${totalReturn >= 0 ? "text-[#00c853]" : "text-red-400"}`}>
              {totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)} ({returnPercent >= 0 ? "+" : ""}{returnPercent.toFixed(1)}%)
            </span>
          </div>
          <p className="text-[11px] text-[#666] mt-1">{totalShares.toLocaleString(undefined, { maximumFractionDigits: 2 })} shares</p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">
          Share price {navPerShare ? parseFloat(navPerShare).toFixed(4) : "1.0000"}
        </span>
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">NAV refresh: daily</span>
      </div>

      <div className="flex gap-3 mb-4">
        {isConnected ? (
          <>
            <button className="flex-1 px-4 py-2.5 bg-[#00c853] text-black text-[12px] font-medium rounded-full hover:bg-[#00b84a] transition-colors">
              {hasPosition ? "Deposit more" : "Deposit"}
            </button>
            {hasPosition && (
              <button className="flex-1 px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
                Withdraw
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => open()}
              className="flex-1 px-4 py-2.5 bg-[#00c853] text-black text-[12px] font-medium rounded-full hover:bg-[#00b84a] transition-colors"
            >
              Connect wallet
            </button>
            <button className="flex-1 px-4 py-2.5 text-[12px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
              Simulate deposit
            </button>
          </>
        )}
      </div>

      <p className="text-[11px] text-[#666]">
        {isConnected
          ? "Yield accrues daily. Withdraw eligible positions anytime after the 7-day hold."
          : "Connect a wallet to see your positions and start earning yield in this pool."
        }
      </p>
    </div>
  );
}

function PoolStatsCard({ pool, isLockedPool, lockedMetrics, tiers }: { pool: Pool; isLockedPool?: boolean; lockedMetrics?: any; tiers?: any[] }) {
  // Use pool stats endpoint for detailed analytics
  const { data: stats, isLoading } = usePoolStats(pool.poolAddress);

  const tvl = stats?.totalValueLocked || pool.analytics?.totalValueLocked;
  const utilization = stats?.utilizationRate || pool.analytics?.utilizationRate;
  const totalInvestors = stats?.totalInvestors || pool.analytics?.totalInvestors || pool.analytics?.uniqueInvestors;
  const navPerShare = pool.analytics?.navPerShare;
  const averageDeposit = stats?.averageDeposit;
  const volume24h = stats?.last24hVolume;

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
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
  // Withdrawal queue only exists on StableYield pools — locked pools have no queue
  const { data: withdrawalQueue } = usePoolWithdrawalRequests(
    isLockedPool ? undefined : pool.poolAddress,
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
      <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
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

        <div className="flex gap-2 mt-4">
          <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">Fixed APY</span>
          <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">Auto-rollover available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
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

      <div className="flex gap-2 mt-4">
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">Queue visible in app</span>
        <span className="px-2 py-1 text-[10px] text-[#666] border border-[#1a1a1a] rounded">No lockup after 7 days</span>
      </div>
    </div>
  );
}

function RiskCard({ pool }: { pool: Pool }) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
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

      <div className="flex gap-2 mt-4">
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <h3 className="text-[15px] font-medium text-white mb-1">About this Pool</h3>
      <p className="text-[13px] text-[#999] mb-5">
        {pool.description || "No description available."}
      </p>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
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

      <div className="flex gap-2 mt-5">
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
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-medium text-white">Pool transactions</h3>
        <div className="flex gap-1">
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
        <table className="w-full">
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
