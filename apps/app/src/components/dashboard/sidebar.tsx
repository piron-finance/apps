"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowUpRight } from "lucide-react";
import { usePlatformMetrics } from "@/hooks/usePlatformData";
import { usePoolsData } from "@/hooks/usePoolsData";
import { useUserPositions } from "@/hooks/useUserData";
import { useUserLockedPositions } from "@/hooks/useLockedPools";
import { useChainContext } from "@/lib/context/ChainContext";
import { SidebarRowsSkeleton } from "./skeletons";
import { cn } from "@/lib/utils";

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
    <aside className="w-full space-y-4 xl:sticky xl:top-24 xl:w-[340px] xl:shrink-0 xl:self-start">
      {isConnected && <PortfolioSection walletAddress={address!} />}
      <LiquiditySection />
      <RecentPoolsSection />
      <ProtocolHealthSection />
    </aside>
  );
}

function SidebarCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[13.5px] font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SidebarRow({
  label,
  value,
  muted = false,
  tone,
  dot,
}: {
  label: string;
  value: string;
  muted?: boolean;
  tone?: "positive" | "negative" | "warning";
  dot?: string;
}) {
  return (
    <div className="flex min-w-0 items-baseline justify-between gap-3 text-[12.5px]">
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        {dot && (
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: dot }}
          />
        )}
        <span className="truncate">{label}</span>
      </span>
      <span
        data-numeric
        className={cn(
          "shrink-0 text-right font-medium",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
          tone === "warning" && "text-warning",
          !tone && (muted ? "text-muted-foreground" : "text-foreground"),
        )}
      >
        {value}
      </span>
    </div>
  );
}

function InsetPanel({ children }: { children: React.ReactNode }) {
  return <div className="surface-sunken mt-4 space-y-3 p-4">{children}</div>;
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
  const lockedCount =
    positions?.analytics?.activeLockedPositions ||
    lockedPositions?.summary?.activePositions ||
    0;
  const avgAPY = positions?.analytics?.averageAPY;

  const lockedValue = positions?.analytics?.lockedPrincipal
    ? parseFloat(positions.analytics.lockedPrincipal)
    : 0;
  const lockedPayout = positions?.analytics?.lockedExpectedPayout
    ? parseFloat(positions.analytics.lockedExpectedPayout)
    : 0;

  const isUp = totalReturn >= 0;

  return (
    <SidebarCard
      title="Your portfolio"
      action={
        <Link
          href="/portfolio"
          className="focus-ring inline-flex items-center gap-0.5 rounded-lg text-[12px] font-medium text-muted-foreground transition-colors hover:text-brand-ink"
        >
          Open
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      }
    >
      {isLoading ? (
        <SidebarRowsSkeleton />
      ) : totalValue === 0 && lockedCount === 0 ? (
        <p className="py-2 text-[12.5px] leading-relaxed text-muted-foreground">
          No positions yet. Deposit into a pool to start earning.
        </p>
      ) : (
        <>
          <div>
            <p
              data-numeric
              className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-foreground"
            >
              {formatValue(totalValue)}
            </p>
            <p
              data-numeric
              className={cn(
                "mt-2 text-[12.5px] font-medium",
                isUp ? "text-positive" : "text-negative",
              )}
            >
              {isUp ? "+" : ""}
              {formatValue(totalReturn)} ({returnPercent >= 0 ? "+" : ""}
              {returnPercent.toFixed(1)}%)
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <SidebarRow
              label="Pool positions"
              value={String(activePositions)}
            />
            <SidebarRow label="Locked positions" value={String(lockedCount)} />
            {avgAPY && parseFloat(avgAPY) > 0 && (
              <SidebarRow
                label="Weighted APY"
                value={`${parseFloat(avgAPY).toFixed(1)}%`}
              />
            )}
          </div>

          {(lockedValue > 0 || totalValue > 0) && (
            <InsetPanel>
              {totalValue - lockedValue > 0 && (
                <SidebarRow
                  label="Liquid (withdrawable)"
                  value={formatValue(totalValue - lockedValue)}
                  muted
                />
              )}
              {lockedValue > 0 && (
                <SidebarRow
                  label="Locked principal"
                  value={formatValue(lockedValue)}
                  muted
                />
              )}
              {lockedPayout > 0 && (
                <SidebarRow
                  label="Expected at maturity"
                  value={formatValue(lockedPayout)}
                  muted
                />
              )}
            </InsetPanel>
          )}
        </>
      )}
    </SidebarCard>
  );
}

function LiquiditySection() {
  const { activeChainId } = useChainContext();
  const { data: metrics, isLoading } = usePlatformMetrics(activeChainId);

  const tvl = metrics?.totalValueLocked
    ? parseFloat(metrics.totalValueLocked)
    : 0;

  const tvlByType = (metrics as any)?.tvlByType;
  const segments = [
    {
      label: "Flexible Yield",
      value: tvlByType?.STABLE_YIELD
        ? parseFloat(tvlByType.STABLE_YIELD)
        : tvl * 0.48,
      color: "hsl(var(--chart-1))",
    },
    {
      label: "Fixed Yield",
      value: tvlByType?.LOCKED ? parseFloat(tvlByType.LOCKED) : tvl * 0.32,
      color: "hsl(var(--chart-2))",
    },
    {
      label: "Term Deals",
      value: tvlByType?.SINGLE_ASSET
        ? parseFloat(tvlByType.SINGLE_ASSET)
        : tvl * 0.2,
      color: "hsl(var(--chart-3))",
    },
  ];

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <SidebarCard
      title="Where the capital sits"
      description="TVL by pool type — a read on depth."
    >
      {isLoading ? (
        <SidebarRowsSkeleton />
      ) : (
        <>
          {/* Stacked allocation bar */}
          <div
            className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-surface-sunken"
            role="img"
            aria-label={segments
              .map(
                (s) =>
                  `${s.label} ${total > 0 ? Math.round((s.value / total) * 100) : 0}%`,
              )
              .join(", ")}
          >
            {total > 0 &&
              segments.map((segment) => (
                <div
                  key={segment.label}
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: `${(segment.value / total) * 100}%`,
                    background: segment.color,
                  }}
                />
              ))}
          </div>

          <div className="mt-4 space-y-3">
            {segments.map((segment) => (
              <SidebarRow
                key={segment.label}
                label={segment.label}
                dot={segment.color}
                value={`${total > 0 ? ((segment.value / total) * 100).toFixed(0) : "0"}% · ${formatValue(segment.value)}`}
              />
            ))}
          </div>

          <InsetPanel>
            <SidebarRow
              label="Total pools"
              value={String(metrics?.totalPools || 0)}
              muted
            />
            <SidebarRow
              label="Active pools"
              value={String(metrics?.activePools || 0)}
              muted
            />
          </InsetPanel>
        </>
      )}
    </SidebarCard>
  );
}

function RecentPoolsSection() {
  const { activeChainId } = useChainContext();
  const { data: poolsResponse, isLoading } = usePoolsData(
    activeChainId !== undefined ? { chainId: activeChainId } : undefined,
  );
  const pools = poolsResponse?.data || [];

  const upcomingPools = pools
    .filter((p) => p.maturityDate)
    .sort(
      (a, b) =>
        new Date(a.maturityDate!).getTime() -
        new Date(b.maturityDate!).getTime(),
    )
    .slice(0, 4);

  const activePools = pools
    .filter((p) => p.status === "FUNDING" || p.status === "INVESTED")
    .slice(0, 4);

  const displayPools = upcomingPools.length > 0 ? upcomingPools : activePools;

  return (
    <SidebarCard
      title="Pool timeline"
      description={
        upcomingPools.length > 0
          ? "Upcoming maturities and key dates."
          : "Active pools and their status."
      }
    >
      {isLoading ? (
        <SidebarRowsSkeleton />
      ) : displayPools.length === 0 ? (
        <p className="py-2 text-[12.5px] text-muted-foreground">
          No active pools.
        </p>
      ) : (
        <div className="space-y-3">
          {displayPools.map((pool) => {
            const maturity = pool.maturityDate
              ? new Date(pool.maturityDate)
              : null;
            const daysUntil = maturity
              ? Math.ceil(
                  (maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                )
              : null;

            const overdue = daysUntil !== null && daysUntil <= 0;
            const soon = daysUntil !== null && daysUntil > 0 && daysUntil <= 7;

            return (
              <SidebarRow
                key={pool.id}
                label={pool.name}
                dot={
                  overdue
                    ? "hsl(var(--negative))"
                    : soon
                      ? "hsl(var(--warning))"
                      : "hsl(var(--positive))"
                }
                tone={overdue ? "negative" : soon ? "warning" : undefined}
                muted={!overdue && !soon}
                value={
                  daysUntil !== null
                    ? overdue
                      ? "Matured"
                      : `${daysUntil}d left`
                    : pool.status || ""
                }
              />
            );
          })}
        </div>
      )}
    </SidebarCard>
  );
}

function ProtocolHealthSection() {
  const { activeChainId } = useChainContext();
  const { data: metrics, isLoading } = usePlatformMetrics(activeChainId);

  const last24h = (metrics as any)?.last24h;
  const deposits24h = last24h?.deposits ? formatValue(last24h.deposits) : "—";
  const withdrawals24h = last24h?.withdrawals
    ? formatValue(last24h.withdrawals)
    : "—";
  const newInvestors24h = last24h?.newInvestors
    ? String(last24h.newInvestors)
    : "—";

  const avgAPY = metrics?.averageAPY ? parseFloat(String(metrics.averageAPY)) : 0;

  return (
    <SidebarCard
      title="System snapshot"
      description="Quick read on protocol status."
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-positive-soft px-2 py-1 text-[10.5px] font-semibold text-positive">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-positive" />
          Nominal
        </span>
      }
    >
      {isLoading ? (
        <SidebarRowsSkeleton />
      ) : (
        <>
          <div className="space-y-3">
            <SidebarRow
              label="Total investors"
              value={String(metrics?.totalUsers || 0)}
            />
            <SidebarRow
              label="Total transactions"
              value={
                metrics?.totalTransactions
                  ? String(metrics.totalTransactions)
                  : "—"
              }
            />
            {avgAPY > 0 && (
              <SidebarRow
                label="Platform APY"
                value={`${avgAPY.toFixed(1)}%`}
              />
            )}
          </div>

          <InsetPanel>
            <SidebarRow label="24h deposits" value={deposits24h} muted />
            <SidebarRow label="24h withdrawals" value={withdrawals24h} muted />
            <SidebarRow
              label="New investors (24h)"
              value={newInvestors24h}
              muted
            />
          </InsetPanel>
        </>
      )}
    </SidebarCard>
  );
}
