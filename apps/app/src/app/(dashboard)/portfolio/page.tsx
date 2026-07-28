"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MetricRow } from "@/components/dashboard/stat-card";
import { usersApi } from "@/lib/api/endpoints";
import type { PortfolioSummary } from "@/lib/api/types";
import { useChainContext } from "@/lib/context/ChainContext";
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
  const { address } = useAccount();
  const { open } = useWeb3Modal();
  const { activeChainId, activeChain } = useChainContext();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setPortfolio(null);
      return;
    }

    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        // Scope positions to the chain selected in the header.
        // undefined = all chains.
        const data = await usersApi.getPositions(address, activeChainId);
        setPortfolio(data);
      } catch (err: any) {
        console.error("Error fetching portfolio:", err);
        setError(err?.response?.data?.message || "Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [address, activeChainId]);

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
          Showing{" "}
          <span className="font-medium text-foreground">
            {activeChain.label}
          </span>
        </p>
      </header>

      {!address ? (
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
                subtitle: "Across pools on this network",
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
                            className="h-4 w-4 text-subtle-foreground/50 transition-colors group-hover:text-foreground"
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
