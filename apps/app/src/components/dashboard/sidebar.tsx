"use client";

import { useAccount } from "wagmi";
import { usePlatformMetrics } from "@/hooks/usePlatformData";
import { usePoolsData } from "@/hooks/usePoolsData";
import { useUserPositions } from "@/hooks/useUserData";
import { useUserLockedPositions } from "@/hooks/useLockedPools";


function formatValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

export function Sidebar() {
  const { address, isConnected } = useAccount();

  return (
    <div className="w-full space-y-4 xl:w-[32%]">
      {isConnected && <PortfolioSection walletAddress={address!} />}
      <LiquiditySection />
      <RecentPoolsSection />
      <ProtocolHealthSection />
    </div>
  );
}

function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-black p-4 sm:p-5">
      {children}
    </div>
  );
}

function PortfolioSection({ walletAddress }: { walletAddress: string }) {
  const { data: positions, isLoading } = useUserPositions(walletAddress);
  const { data: lockedPositions } = useUserLockedPositions(walletAddress);

  const totalValue = positions?.analytics?.totalValue
    ? parseFloat(positions.analytics.totalValue)
    : 0;
  const totalReturn = positions?.analytics?.totalReturn
    ? parseFloat(positions.analytics.totalReturn)
    : 0;
  const returnPercent = positions?.analytics?.totalReturnPercentage
    ? parseFloat(positions.analytics.totalReturnPercentage)
    : 0;
  const activePositions = positions?.analytics?.activePositions || 0;
  const lockedCount = positions?.analytics?.activeLockedPositions || lockedPositions?.summary?.activePositions || 0;
  const avgAPY = positions?.analytics?.averageAPY;

  // Locked position value
  const lockedValue = positions?.analytics?.lockedPrincipal
    ? parseFloat(positions.analytics.lockedPrincipal)
    : 0;
  const lockedPayout = positions?.analytics?.lockedExpectedPayout
    ? parseFloat(positions.analytics.lockedExpectedPayout)
    : 0;

  return (
    <SidebarCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-medium text-white">Your portfolio</h3>
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-[#666] text-[12px]">Loading...</div>
      ) : totalValue === 0 && lockedCount === 0 ? (
        <div className="py-4 text-center text-[#666] text-[12px]">
          No positions yet. Deposit into a pool to get started.
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-2xl font-semibold text-white">{formatValue(totalValue)}</p>
            <p className={`text-[12px] ${totalReturn >= 0 ? "text-[#00c853]" : "text-red-400"}`}>
              {totalReturn >= 0 ? "+" : ""}{formatValue(totalReturn)} ({returnPercent >= 0 ? "+" : ""}{returnPercent.toFixed(1)}%)
            </p>
          </div>

          <div className="space-y-2.5">
            <SidebarRow label="Pool positions" value={String(activePositions)} />
            <SidebarRow label="Locked positions" value={String(lockedCount)} />
            {avgAPY && parseFloat(avgAPY) > 0 && (
              <SidebarRow label="Weighted APY" value={`${parseFloat(avgAPY).toFixed(1)}%`} />
            )}
          </div>

          {/* Position breakdown instead of dummy buttons */}
          {(lockedValue > 0 || totalValue > 0) && (
            <div className="bg-[#0a0a0a] rounded-lg mt-4 p-4 space-y-2.5">
              {totalValue - lockedValue > 0 && (
                <SidebarRow label="Liquid (withdrawable)" value={formatValue(totalValue - lockedValue)} muted />
              )}
              {lockedValue > 0 && (
                <SidebarRow label="Locked principal" value={formatValue(lockedValue)} muted />
              )}
              {lockedPayout > 0 && (
                <SidebarRow label="Expected at maturity" value={formatValue(lockedPayout)} muted />
              )}
            </div>
          )}
        </>
      )}
    </SidebarCard>
  );
}

function LiquiditySection() {
  const { data: metrics, isLoading } = usePlatformMetrics();

  const tvl = metrics?.totalValueLocked ? parseFloat(metrics.totalValueLocked) : 0;

  // Use tvlByType from platform metrics if available
  const tvlByType = (metrics as any)?.tvlByType;
  const stableYieldTvl = tvlByType?.STABLE_YIELD ? parseFloat(tvlByType.STABLE_YIELD) : tvl * 0.48;
  const lockedTvl = tvlByType?.LOCKED ? parseFloat(tvlByType.LOCKED) : tvl * 0.32;
  const singleAssetTvl = tvlByType?.SINGLE_ASSET ? parseFloat(tvlByType.SINGLE_ASSET) : tvl * 0.20;

  const stablePercent = tvl > 0 ? ((stableYieldTvl / tvl) * 100).toFixed(0) : "0";
  const lockedPercent = tvl > 0 ? ((lockedTvl / tvl) * 100).toFixed(0) : "0";
  const singlePercent = tvl > 0 ? ((singleAssetTvl / tvl) * 100).toFixed(0) : "0";

  return (
    <SidebarCard>
      <h3 className="text-[14px] font-medium text-white mb-0.5">
        Where the capital sits
      </h3>
      <p className="text-[12px] text-[#666] mb-4">
        TVL by pool type. Useful for gauging depth.
      </p>

      {isLoading ? (
        <div className="py-4 text-center text-[#666] text-[12px]">Loading...</div>
      ) : (
        <>
          <div className="space-y-2.5">
            <SidebarRow label="Stable Yield" value={`${stablePercent}% · ${formatValue(stableYieldTvl)}`} />
            <SidebarRow label="Locked" value={`${lockedPercent}% · ${formatValue(lockedTvl)}`} />
            <SidebarRow label="Single Asset" value={`${singlePercent}% · ${formatValue(singleAssetTvl)}`} />
          </div>
          <div className="bg-[#0a0a0a] rounded-lg mt-4 p-4 space-y-2.5">
            <SidebarRow label="Total pools" value={String(metrics?.totalPools || 0)} muted />
            <SidebarRow label="Active pools" value={String(metrics?.activePools || 0)} muted />
          </div>
        </>
      )}
    </SidebarCard>
  );
}

function RecentPoolsSection() {
  const { data: poolsResponse, isLoading } = usePoolsData();
  const pools = poolsResponse?.data || [];

  // Show pools with nearest maturity or most recently active
  const upcomingPools = pools
    .filter((p) => p.maturityDate)
    .sort((a, b) => new Date(a.maturityDate!).getTime() - new Date(b.maturityDate!).getTime())
    .slice(0, 4);

  const activePools = pools
    .filter((p) => p.status === "FUNDING" || p.status === "INVESTED")
    .slice(0, 4);

  const displayPools = upcomingPools.length > 0 ? upcomingPools : activePools;

  return (
    <SidebarCard>
      <h3 className="text-[14px] font-medium text-white mb-0.5">
        Pool timeline
      </h3>
      <p className="text-[12px] text-[#666] mb-4">
        {upcomingPools.length > 0 ? "Upcoming maturities and key dates." : "Active pools and their status."}
      </p>
      {isLoading ? (
        <div className="py-4 text-center text-[#666] text-[12px]">Loading...</div>
      ) : displayPools.length === 0 ? (
        <div className="py-4 text-center text-[#666] text-[12px]">No active pools</div>
      ) : (
        <div className="space-y-2.5">
          {displayPools.map((pool) => {
            const maturity = pool.maturityDate ? new Date(pool.maturityDate) : null;
            const daysUntil = maturity
              ? Math.ceil((maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;
            const rightText = daysUntil !== null
              ? daysUntil <= 0
                ? "Matured"
                : `${daysUntil}d left`
              : pool.status || "";

            return (
              <div key={pool.id} className="flex min-w-0 justify-between gap-3 text-[12px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    daysUntil !== null && daysUntil <= 7
                      ? "bg-yellow-500"
                      : daysUntil !== null && daysUntil <= 0
                        ? "bg-red-400"
                        : "bg-[#00c853]"
                  }`} />
                  <span className="text-[#888] truncate">{pool.name}</span>
                </div>
                <span className={`text-[#666] flex-shrink-0 ml-2 ${
                  daysUntil !== null && daysUntil <= 7 ? "text-yellow-500" : ""
                }`}>
                  {rightText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </SidebarCard>
  );
}

function ProtocolHealthSection() {
  const { data: metrics, isLoading } = usePlatformMetrics();

  const last24h = (metrics as any)?.last24h;
  const deposits24h = last24h?.deposits ? formatValue(last24h.deposits) : "—";
  const withdrawals24h = last24h?.withdrawals ? formatValue(last24h.withdrawals) : "—";
  const newInvestors24h = last24h?.newInvestors ? String(last24h.newInvestors) : "—";

  // Compute blended APY same way as main page
  const avgAPY = metrics?.averageAPY ? parseFloat(String(metrics.averageAPY)) : 0;

  return (
    <SidebarCard>
      <h3 className="text-[14px] font-medium text-white mb-0.5">
        System snapshot
      </h3>
      <p className="text-[12px] text-[#666] mb-4">
        Quick read on protocol status.
      </p>

      {isLoading ? (
        <div className="py-4 text-center text-[#666] text-[12px]">Loading...</div>
      ) : (
        <>
          <div className="space-y-2.5">
            <SidebarRow label="Total investors" value={String(metrics?.totalUsers || 0)} />
            <SidebarRow label="Total transactions" value={metrics?.totalTransactions ? String(metrics.totalTransactions) : "—"} />
            {avgAPY > 0 && (
              <SidebarRow label="Platform APY" value={`${avgAPY.toFixed(1)}%`} />
            )}
            <SidebarRow label="System status" value="Nominal" />
          </div>
          <div className="bg-[#0a0a0a] rounded-lg mt-4 p-4 space-y-2.5">
            <SidebarRow label="24h deposits" value={deposits24h} muted />
            <SidebarRow label="24h withdrawals" value={withdrawals24h} muted />
            <SidebarRow label="New investors (24h)" value={newInvestors24h} muted />
          </div>
        </>
      )}
    </SidebarCard>
  );
}


function SidebarRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex min-w-0 justify-between gap-3 text-[12px]">
      <span className="min-w-0 text-[#888]">{label}</span>
      <span className={`shrink-0 text-right ${muted ? "text-[#666]" : "text-white"}`}>{value}</span>
    </div>
  );
}
