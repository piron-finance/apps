"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useInvestorWallets } from "@/hooks/useInvestorWallets";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MetricRow } from "@/components/dashboard/stat-card";
import { usersApi } from "@/lib/api/endpoints";
import type { PortfolioAnalytics, PortfolioSummary } from "@/lib/api/types";
import { poolTypeLabel } from "@/lib/pool-helpers";
import { cn } from "@/lib/utils";

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Gains read green, losses red, flat stays neutral ink. */
function returnTone(value: string | number | undefined) {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (num > 0) return "text-positive";
  if (num < 0) return "text-negative";
  return "text-foreground";
}

/** Disconnected / loading / error / empty all read the same way. */
function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 border-y border-border py-14">
      <div>
        <p className="text-[14px] font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

const GRID =
  "grid grid-cols-[minmax(0,1fr)_120px_120px_130px_80px_20px] items-center gap-4";

export default function PortfolioPage() {
  const { open } = useWeb3Modal();
  // Every connected wallet, not just the EVM one. Positions are keyed on the address
  // that holds them, and an investor may hold them through more than one wallet —
  // reading only wagmi's address is why a Stellar holder saw "connect a wallet" while
  // connected, with their position sitting in the backend the whole time.
  const wallets = useInvestorWallets();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Joined so the effect re-runs when the set of connections changes, not on every
  // render of a new array with the same contents.
  const walletKey = wallets.map((w) => w.address).join(",");

  useEffect(() => {
    if (wallets.length === 0) {
      setPortfolio(null);
      return;
    }

    let cancelled = false;
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        // Portfolio spans every chain: a product's positions are held per network
        // and non-fungible across them, so show the user's full holdings regardless
        // of the header's browse chain. Each position carries its own chain badge.
        //
        // One request per wallet, merged. The endpoint keys on a single address, and a
        // wallet that fails should cost only its own positions rather than the view.
        const results = await Promise.allSettled(
          wallets.map((wallet) => usersApi.getPositions(wallet.address)),
        );
        if (cancelled) return;

        const loaded = results
          .filter((r): r is PromiseFulfilledResult<PortfolioSummary> => r.status === "fulfilled")
          .map((r) => r.value);
        if (loaded.length === 0) {
          const reason = results.find((r) => r.status === "rejected") as
            | PromiseRejectedResult
            | undefined;
          throw reason?.reason ?? new Error("Failed to load portfolio");
        }

        setPortfolio(mergePortfolios(loaded));
      } catch (err: any) {
        if (cancelled) return;
        console.error("Error fetching portfolio:", err);
        setError(err?.response?.data?.message || "Failed to load portfolio");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPortfolio();
    return () => {
      cancelled = true;
    };
    // walletKey stands in for `wallets`, which is a new array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletKey]);

  const analytics = portfolio?.analytics;
  const positions = portfolio?.positions ?? [];

  return (
    <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pb-6 pt-8">
        <div className="max-w-2xl">
          <h1 className="text-[27px] font-semibold leading-none tracking-display text-foreground">
            Portfolio
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            Every deposit, its current value and what it has returned.
          </p>
        </div>
        <p className="text-[12.5px] text-subtle-foreground">
          Showing <span className="font-medium text-foreground">all networks</span>
        </p>
      </header>

      {wallets.length === 0 ? (
        <EmptyState
          title="Connect a wallet"
          description="Your positions are read straight from the chain. Connect to see them."
          action={
            <Button onClick={() => open()} size="sm">
              Connect wallet
            </Button>
          }
        />
      ) : loading ? (
        <EmptyState title="Loading your portfolio" description="Fetching positions and current valuations." />
      ) : error ? (
        <EmptyState
          title="We couldn't load your portfolio"
          description={error}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <MetricRow
            items={[
              {
                label: "Portfolio value",
                value:
                  analytics?.totalValueFormatted ||
                  formatCurrency(analytics?.totalValue || "0"),
                subtitle: `${formatCurrency(analytics?.totalDeposited || "0")} deposited`,
              },
              {
                label: "Total return",
                value: formatCurrency(analytics?.totalReturn || "0"),
                badge: analytics?.totalReturnPercentage
                  ? `${parseFloat(analytics.totalReturnPercentage) >= 0 ? "+" : ""}${parseFloat(analytics.totalReturnPercentage).toFixed(2)}%`
                  : undefined,
                badgeTone:
                  parseFloat(String(analytics?.totalReturn ?? 0)) < 0
                    ? "negative"
                    : "positive",
                subtitle: "Realised and unrealised, net of fees",
              },
              {
                label: "Open positions",
                value: String(analytics?.activePositions || 0),
                subtitle: "Across pools on every network",
              },
              {
                label: "Weighted APY",
                value: `${analytics?.averageAPY || "0.00"}%`,
                subtitle: "Weighted by position size",
              },
            ]}
          />

          <section className="pb-4 pt-10">
            <div className="flex items-baseline justify-between gap-4 pb-4">
              <h2 className="text-[17px] font-semibold tracking-title text-foreground">
                Positions
              </h2>
              {positions.length > 0 && (
                <span data-numeric className="text-[12.5px] text-subtle-foreground">
                  {positions.length}{" "}
                  {positions.length === 1 ? "position" : "positions"}
                </span>
              )}
            </div>

            {positions.length === 0 ? (
              <EmptyState
                title="No positions yet"
                description="Once you deposit into a pool it will appear here with live valuation and returns."
                action={
                  <Button asChild size="sm">
                    <Link href="/">Browse markets</Link>
                  </Button>
                }
              />
            ) : (
              <div>
                {/* Column headings — desktop only. */}
                <div className={cn(GRID, "hidden border-y border-border px-1 py-2 sm:grid")}>
                  <span className="eyebrow">Pool</span>
                  <span className="eyebrow text-right">Value</span>
                  <span className="eyebrow text-right">Deposited</span>
                  <span className="eyebrow text-right">Return</span>
                  <span className="eyebrow text-right">APY</span>
                  <span />
                </div>

                <div className="border-b border-border sm:border-b-0">
                  {positions.map((position) => {
                    const tone = returnTone(position.totalReturn);
                    const meta = [
                      position.pool.assetSymbol,
                      position.pool.poolType
                        ? poolTypeLabel(position.pool.poolType)
                        : null,
                      position.daysHeld !== undefined
                        ? `Held ${position.daysHeld}d`
                        : null,
                      position.pool.maturityDate
                        ? `Matures ${formatDate(position.pool.maturityDate)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ");

                    return (
                      <Link
                        key={position.id}
                        href={`/pool/${position.pool.poolAddress}`}
                        className="ledger-row focus-ring group block px-1 py-3.5 hover:bg-surface-sunken/70"
                      >
                        {/* Desktop */}
                        <div className={cn(GRID, "hidden sm:grid")}>
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="truncate text-[13.5px] font-medium text-foreground">
                                {position.pool.name}
                              </span>
                              <span className="shrink-0 text-[11px] text-subtle-foreground">
                                {position.pool.status}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                              {meta}
                            </p>
                          </div>
                          <span data-numeric className="text-right text-[13.5px] font-medium text-foreground">
                            {formatCurrency(position.currentValue)}
                          </span>
                          <span data-numeric className="text-right text-[13.5px] text-muted-foreground">
                            {formatCurrency(position.totalDeposited)}
                          </span>
                          <div className="text-right">
                            <span data-numeric className={cn("block text-[13.5px]", tone)}>
                              {formatCurrency(position.totalReturn)}
                            </span>
                            <span data-numeric className={cn("mt-0.5 block text-[11.5px]", tone)}>
                              {position.totalReturnPercentage}%
                            </span>
                          </div>
                          <span data-numeric className="text-right text-[13.5px] text-foreground">
                            {position.pool.apy || "0.00"}%
                          </span>
                          <ChevronRight
                            className="h-4 w-4 text-subtle-foreground/50 group-hover:text-foreground"
                            strokeWidth={1.75}
                          />
                        </div>

                        {/* Mobile */}
                        <div className="sm:hidden">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[13.5px] font-medium text-foreground">
                                {position.pool.name}
                              </p>
                              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                                {meta}
                              </p>
                            </div>
                            <span data-numeric className="shrink-0 text-[15px] font-medium text-foreground">
                              {formatCurrency(position.currentValue)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-[11.5px]">
                            <span data-numeric className={tone}>
                              {formatCurrency(position.totalReturn)} (
                              {position.totalReturnPercentage}%)
                            </span>
                            <span data-numeric className="text-subtle-foreground">
                              APY {position.pool.apy || "0.00"}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

/**
 * One portfolio from several wallets' worth.
 *
 * Positions concatenate and the additive figures are summed, because each response is
 * only that wallet's share. The money fields are strings on the wire, so they are summed
 * as numbers and written back as strings rather than silently changing the type the UI
 * reads.
 *
 * `averageAPY` is deliberately taken from the first response rather than combined: a mean
 * of means is not the mean, and weighting it properly needs per-position principal the
 * analytics block does not carry. With one wallet connected — which is the normal case —
 * this function returns that response untouched.
 */
function mergePortfolios(parts: PortfolioSummary[]): PortfolioSummary {
  if (parts.length === 1) return parts[0];
  const base = parts[0];
  const sum = (pick: (a: PortfolioAnalytics) => string | number | undefined) =>
    parts.reduce((total, part) => total + (Number(pick(part.analytics)) || 0), 0);

  const totalValue = sum((a) => a.totalValue);
  const totalDeposited = sum((a) => a.totalDeposited);
  const totalReturn = sum((a) => a.totalReturn);

  return {
    positions: parts.flatMap((p) => p.positions ?? []),
    analytics: {
      ...base.analytics,
      totalValue: String(totalValue),
      totalValueFormatted: totalValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      totalDeposited: String(totalDeposited),
      totalReturn: String(totalReturn),
      totalReturnPercentage:
        totalDeposited > 0 ? ((totalReturn / totalDeposited) * 100).toFixed(2) : "0.00",
      unrealizedReturn: String(sum((a) => a.unrealizedReturn)),
      realizedReturn: String(sum((a) => a.realizedReturn)),
      lockedPrincipal: String(sum((a) => a.lockedPrincipal)),
      lockedExpectedPayout: String(sum((a) => a.lockedExpectedPayout)),
      activePositions: sum((a) => a.activePositions),
      activeLockedPositions: sum((a) => a.activeLockedPositions),
    },
  };
}
