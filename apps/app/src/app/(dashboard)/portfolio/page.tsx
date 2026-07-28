"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ArrowRight, Clock, Loader2, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OverviewStrip } from "@/components/dashboard/stat-card";
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
  return "text-muted-foreground";
}

/** A full-width state card — used for disconnected, loading, error and empty. */
function PanelState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-sunken text-muted-foreground">
          {icon}
        </div>
      )}
      <div>
        <p className="text-[15px] font-semibold tracking-tight text-foreground">
          {title}
        </p>
        {description && (
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

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
        // Pass activeChainId so positions are scoped to the selected chain.
        // undefined = all chains (default "All Chains" view).
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
    // Re-fetch when wallet or selected chain changes
  }, [address, activeChainId]);

  const analytics = portfolio?.analytics;
  const totalReturn = analytics?.totalReturn || "0";

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <header className="max-w-2xl">
        <p className="eyebrow">Portfolio · {activeChain.label}</p>
        <h1 className="mt-3 font-display text-[38px] leading-[1.05] tracking-[-0.015em] text-foreground sm:text-[44px]">
          Your positions
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
          Every deposit, its current value and what it has returned — scoped to
          the network selected in the header.
        </p>
      </header>

      <div className="mt-8 space-y-4">
        {!address ? (
          <PanelState
            icon={<Wallet className="h-5 w-5" strokeWidth={1.75} />}
            title="Connect your wallet"
            description="Your positions are read straight from the chain. Connect to see them."
            action={
              <Button onClick={() => open()} className="mt-1">
                Connect wallet
              </Button>
            }
          />
        ) : loading ? (
          <PanelState
            icon={<Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.75} />}
            title="Loading your portfolio"
            description="Fetching positions and current valuations."
          />
        ) : error ? (
          <PanelState
            title="We couldn't load your portfolio"
            description={error}
            action={
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                className="mt-1"
              >
                Try again
              </Button>
            }
          />
        ) : (
          <>
            <OverviewStrip
              items={[
                {
                  label: "Portfolio value",
                  value:
                    analytics?.totalValueFormatted ||
                    formatCurrency(analytics?.totalValue || "0"),
                  subtitle: `${formatCurrency(analytics?.totalDeposited || "0")} deposited`,
                },
                {
                  label: "Total returns",
                  value: formatCurrency(totalReturn),
                  badge: analytics?.totalReturnPercentage
                    ? `${parseFloat(analytics.totalReturnPercentage) >= 0 ? "+" : ""}${parseFloat(analytics.totalReturnPercentage).toFixed(2)}%`
                    : undefined,
                  badgeTone:
                    parseFloat(String(totalReturn)) < 0
                      ? "negative"
                      : "positive",
                  subtitle: "Realised and unrealised, net of fees",
                },
                {
                  label: "Active positions",
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

            <section className="pt-6">
              <div className="flex items-end justify-between gap-4 border-b border-border pb-5">
                <div>
                  <span className="eyebrow">Holdings</span>
                  <h2 className="mt-2 font-display text-[26px] leading-none tracking-tight text-foreground">
                    Position detail
                  </h2>
                </div>
                {portfolio?.positions?.length ? (
                  <span className="text-[12.5px] text-muted-foreground">
                    {portfolio.positions.length} position
                    {portfolio.positions.length === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>

              {!portfolio?.positions?.length ? (
                <div className="mt-6">
                  <PanelState
                    title="No positions yet"
                    description="Once you deposit into a pool it will show up here with live valuation and returns."
                    action={
                      <Button asChild className="mt-1">
                        <Link href="/">
                          Explore pools
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {portfolio.positions.map((position) => (
                    <article
                      key={position.id}
                      className="surface-card p-5 transition-colors hover:border-border-strong sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-5">
                          {/* Identity */}
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                                {position.pool.name}
                              </h3>
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {[
                                  position.pool.assetSymbol,
                                  position.pool.country,
                                  position.pool.poolType
                                    ? poolTypeLabel(position.pool.poolType)
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .map((chip) => (
                                    <span
                                      key={chip as string}
                                      className="rounded-full bg-surface-sunken px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                                    >
                                      {chip}
                                    </span>
                                  ))}
                              </div>
                            </div>
                            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-ink">
                              {position.pool.status}
                            </span>
                          </div>

                          {/* Figures */}
                          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle sm:grid-cols-4">
                            <div className="bg-surface-sunken px-3.5 py-3">
                              <p className="text-[10px] uppercase tracking-[0.1em] text-subtle-foreground">
                                Current value
                              </p>
                              <p
                                data-numeric
                                className="mt-1.5 text-[15px] font-semibold text-foreground"
                              >
                                {formatCurrency(position.currentValue)}
                              </p>
                            </div>
                            <div className="bg-surface-sunken px-3.5 py-3">
                              <p className="text-[10px] uppercase tracking-[0.1em] text-subtle-foreground">
                                Deposited
                              </p>
                              <p
                                data-numeric
                                className="mt-1.5 text-[15px] font-semibold text-foreground"
                              >
                                {formatCurrency(position.totalDeposited)}
                              </p>
                            </div>
                            <div className="bg-surface-sunken px-3.5 py-3">
                              <p className="text-[10px] uppercase tracking-[0.1em] text-subtle-foreground">
                                Total return
                              </p>
                              <p
                                data-numeric
                                className={cn(
                                  "mt-1.5 text-[15px] font-semibold",
                                  returnTone(position.totalReturn),
                                )}
                              >
                                {formatCurrency(position.totalReturn)}
                                <span className="ml-1.5 text-[11.5px] font-medium">
                                  {position.totalReturnPercentage}%
                                </span>
                              </p>
                            </div>
                            <div className="bg-surface-sunken px-3.5 py-3">
                              <p className="text-[10px] uppercase tracking-[0.1em] text-subtle-foreground">
                                APY
                              </p>
                              <p
                                data-numeric
                                className="mt-1.5 text-[15px] font-semibold text-brand-ink"
                              >
                                {position.pool.apy || "0.00"}%
                              </p>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted-foreground">
                            {position.daysHeld !== undefined && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" strokeWidth={2} />
                                Held for {position.daysHeld} days
                              </span>
                            )}
                            {position.pool.maturityDate && (
                              <span>
                                Matures {formatDate(position.pool.maturityDate)}
                              </span>
                            )}
                            {position.lastActivityDate && (
                              <span>
                                Last {position.lastActivityType?.toLowerCase()}{" "}
                                {formatDate(position.lastActivityDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
                        >
                          <Link href={`/pool/${position.pool.poolAddress}`}>
                            View pool
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
