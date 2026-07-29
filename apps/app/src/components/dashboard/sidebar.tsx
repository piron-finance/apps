"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowUpRight } from "lucide-react";
import { usePlatformMetrics } from "@/hooks/usePlatformData";
import { usePoolsData } from "@/hooks/usePoolsData";
import { useUserPositions } from "@/hooks/useUserData";
import { useUserLockedPositions } from "@/hooks/useLockedPools";
import { useChainContext } from "@/lib/context/ChainContext";
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

/**
 * A rail, not a stack of cards. One vertical rule separates it from the
 * markets table; its blocks are separated from each other by hairlines, and it
 * starts on exactly the same baseline as the table beside it.
 */
export function Sidebar() {
  const { address, isConnected } = useAccount();

  return (
    // The aside stretches so its rule runs the full height of the markets
    // column; the sticky behaviour lives on the inner wrapper.
    <aside className="w-full shrink-0 xl:w-[290px] xl:border-l xl:border-border xl:pl-10">
      <div className="xl:sticky xl:top-[76px]">
        <div className="divide-y divide-border-subtle border-t border-border xl:border-t-0">
          {isConnected && <PortfolioBlock walletAddress={address!} />}
          <AllocationBlock />
          <MaturityBlock />
          <SystemBlock />
        </div>
      </div>
    </aside>
  );
}

function Block({
  title,
  action,
  children,
  first = false,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section className={cn("py-7", first && "xl:pt-0")}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[13px] font-semibold tracking-title text-foreground">
          {title}
        </h3>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  tone,
  dot,
  emphasis = false,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "warning";
  dot?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-baseline justify-between gap-3 py-[7px] text-[12.5px]">
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        {dot && (
          <span
            className="h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ background: dot }}
          />
        )}
        <span className="truncate">{label}</span>
      </span>
      <span
        data-numeric
        className={cn(
          "shrink-0 text-right",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
          tone === "warning" && "text-warning",
          !tone && (emphasis ? "font-medium text-foreground" : "text-foreground"),
        )}
      >
        {value}
      </span>
    </div>
  );
}

function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 py-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <span className="h-2.5 w-24 animate-pulse rounded-sm bg-muted" />
          <span className="h-2.5 w-12 animate-pulse rounded-sm bg-muted" />
        </div>
      ))}
    </div>
  );
}

function PortfolioBlock({ walletAddress }: { walletAddress: string }) {
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
  const lockedValue = positions?.analytics?.lockedPrincipal
    ? parseFloat(positions.analytics.lockedPrincipal)
    : 0;

  const isUp = totalReturn >= 0;

  return (
    <Block
      first
      title="Your portfolio"
      action={
        <Link
          href="/portfolio"
          className="focus-ring inline-flex items-center gap-0.5 rounded text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Open
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </Link>
      }
    >
      {isLoading ? (
        <LoadingRows />
      ) : totalValue === 0 && lockedCount === 0 ? (
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          No positions yet. Deposit into a pool to start earning.
        </p>
      ) : (
        <>
          <p
            data-numeric
            className="text-[26px] font-semibold leading-none tracking-display text-foreground"
          >
            {formatValue(totalValue)}
          </p>
          <p
            data-numeric
            className={cn(
              "mt-2 text-[12.5px]",
              isUp ? "text-positive" : "text-negative",
            )}
          >
            {isUp ? "+" : ""}
            {formatValue(totalReturn)} ({returnPercent >= 0 ? "+" : ""}
            {returnPercent.toFixed(1)}%)
          </p>

          <div className="mt-5">
            <Row label="Pool positions" value={String(activePositions)} />
            <Row label="Locked positions" value={String(lockedCount)} />
            {totalValue - lockedValue > 0 && (
              <Row
                label="Liquid"
                value={formatValue(totalValue - lockedValue)}
              />
            )}
            {lockedValue > 0 && (
              <Row label="Locked principal" value={formatValue(lockedValue)} />
            )}
          </div>
        </>
      )}
    </Block>
  );
}

function AllocationBlock() {
  const { activeChainId } = useChainContext();
  const { data: metrics, isLoading } = usePlatformMetrics(activeChainId);
  const { isConnected } = useAccount();

  const tvl = metrics?.totalValueLocked
    ? parseFloat(metrics.totalValueLocked)
    : 0;

  const tvlByType = (metrics as any)?.tvlByType;
  const segments = [
    {
      label: "Flexible yield",
      value: tvlByType?.STABLE_YIELD
        ? parseFloat(tvlByType.STABLE_YIELD)
        : tvl * 0.48,
      color: "hsl(var(--chart-1))",
    },
    {
      label: "Fixed yield",
      value: tvlByType?.LOCKED ? parseFloat(tvlByType.LOCKED) : tvl * 0.32,
      color: "hsl(var(--chart-2))",
    },
    {
      label: "Term deals",
      value: tvlByType?.SINGLE_ASSET
        ? parseFloat(tvlByType.SINGLE_ASSET)
        : tvl * 0.2,
      color: "hsl(var(--chart-3))",
    },
  ];

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <Block first={!isConnected} title="Capital allocation">
      {isLoading ? (
        <LoadingRows />
      ) : (
        <>
          <div
            className="flex h-1.5 w-full gap-px overflow-hidden rounded-full bg-border"
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
                <span
                  key={segment.label}
                  className="h-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${(segment.value / total) * 100}%`,
                    background: segment.color,
                  }}
                />
              ))}
          </div>

          <div className="mt-4">
            {segments.map((segment) => (
              <Row
                key={segment.label}
                label={segment.label}
                dot={segment.color}
                value={`${total > 0 ? ((segment.value / total) * 100).toFixed(0) : "0"}% · ${formatValue(segment.value)}`}
              />
            ))}
          </div>
        </>
      )}
    </Block>
  );
}

function MaturityBlock() {
  const { activeChainId } = useChainContext();
  const { data: poolsResponse, isLoading } = usePoolsData(
    activeChainId !== undefined ? { chainId: activeChainId } : undefined,
  );
  const pools = poolsResponse?.data || [];

  const upcoming = pools
    .filter((p) => p.maturityDate)
    .sort(
      (a, b) =>
        new Date(a.maturityDate!).getTime() -
        new Date(b.maturityDate!).getTime(),
    )
    .slice(0, 4);

  const active = pools
    .filter((p) => p.status === "FUNDING" || p.status === "INVESTED")
    .slice(0, 4);

  const display = upcoming.length > 0 ? upcoming : active;

  return (
    <Block title={upcoming.length > 0 ? "Upcoming maturities" : "Active pools"}>
      {isLoading ? (
        <LoadingRows />
      ) : display.length === 0 ? (
        <p className="text-[12.5px] text-muted-foreground">No active pools.</p>
      ) : (
        display.map((pool) => {
          const maturity = pool.maturityDate
            ? new Date(pool.maturityDate)
            : null;
          const days = maturity
            ? Math.ceil((maturity.getTime() - Date.now()) / 86_400_000)
            : null;
          const overdue = days !== null && days <= 0;
          const soon = days !== null && days > 0 && days <= 7;

          return (
            <Row
              key={pool.id}
              label={pool.name}
              tone={overdue ? "negative" : soon ? "warning" : undefined}
              value={
                days !== null
                  ? overdue
                    ? "Matured"
                    : `${days}d`
                  : pool.status || ""
              }
            />
          );
        })
      )}
    </Block>
  );
}

function SystemBlock() {
  const { activeChainId } = useChainContext();
  const { data: metrics, isLoading } = usePlatformMetrics(activeChainId);

  const last24h = (metrics as any)?.last24h;

  return (
    <Block
      title="Protocol"
      action={
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-positive" />
          Nominal
        </span>
      }
    >
      {isLoading ? (
        <LoadingRows />
      ) : (
        <>
          <Row
            label="Total investors"
            value={String(metrics?.totalUsers || 0)}
          />
          <Row
            label="Total transactions"
            value={
              metrics?.totalTransactions
                ? String(metrics.totalTransactions)
                : "—"
            }
          />
          <Row
            label="24h deposits"
            value={last24h?.deposits ? formatValue(last24h.deposits) : "—"}
          />
          <Row
            label="24h withdrawals"
            value={last24h?.withdrawals ? formatValue(last24h.withdrawals) : "—"}
          />
        </>
      )}
    </Block>
  );
}
