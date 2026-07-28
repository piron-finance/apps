"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { CHAIN_INFO } from "@/lib/constants/chains";
import { cn } from "@/lib/utils";

export interface PoolRow {
  id: string;
  poolId: string;
  chainId?: number;
  name: string;
  /** NAV, issuer — whatever identifies this pool beneath its name. */
  subtitle?: string;
  asset: string;
  /** The number an investor shops on. */
  rate: string;
  /** Third column — tenor, utilisation, minimum. */
  detail?: string;
  tvl: string;
  minInvestment?: string;
  /** 0–100. Draws a funding meter under the name. */
  progress?: number;
  progressLabel?: string;
}

export interface PoolTableProps {
  rows: PoolRow[];
  /** Column heading for the rate column — differs by pool type. */
  rateLabel: string;
  detailLabel?: string;
  tvlLabel?: string;
  emptyMessage: string;
  loading?: boolean;
}

/* Header and rows share one grid template, so every figure lines up down the
   page regardless of how long a pool's name is. */
const GRID =
  "grid grid-cols-[minmax(0,1fr)_84px_92px_104px_20px] items-center gap-4";

function ChainCell({ chainId }: { chainId?: number }) {
  const chain = chainId ? CHAIN_INFO[chainId] : undefined;
  if (!chain) return <span className="text-subtle-foreground">—</span>;

  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
      {chain.logo ? (
        <Image
          src={chain.logo}
          alt=""
          width={13}
          height={13}
          className="shrink-0 rounded-full"
        />
      ) : (
        <span
          className="h-[7px] w-[7px] shrink-0 rounded-full"
          style={{ background: chain.color }}
        />
      )}
      {chain.shortName}
    </span>
  );
}

export function PoolTable({
  rows,
  rateLabel,
  detailLabel = "Term",
  tvlLabel = "TVL",
  emptyMessage,
  loading = false,
}: PoolTableProps) {
  if (loading) {
    return (
      <div className="border-t border-border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="ledger-row px-1 py-4">
            <div className={GRID}>
              <div className="space-y-2">
                <div className="h-3.5 w-56 max-w-full animate-pulse rounded-sm bg-muted" />
                <div className="h-2.5 w-32 animate-pulse rounded-sm bg-muted" />
              </div>
              <div className="h-3 w-14 animate-pulse rounded-sm bg-muted" />
              <div className="ml-auto h-3.5 w-12 animate-pulse rounded-sm bg-muted" />
              <div className="ml-auto h-3.5 w-16 animate-pulse rounded-sm bg-muted" />
              <div />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="border-y border-border px-1 py-10">
        <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Column headings — desktop only; the stacked layout labels inline. */}
      <div
        className={cn(
          GRID,
          "hidden border-y border-border px-1 py-2 sm:grid",
        )}
      >
        <span className="eyebrow">Pool</span>
        <span className="eyebrow">Network</span>
        <span className="eyebrow text-right">{rateLabel}</span>
        <span className="eyebrow text-right">{tvlLabel}</span>
        <span />
      </div>

      <div className="border-b border-border sm:border-b-0">
        {rows.map((row) => (
          <Link
            key={row.id}
            href={`/pool/${row.poolId}`}
            className="ledger-row focus-ring group block px-1 py-3.5 hover:bg-surface-sunken/70 sm:py-3"
          >
            {/* ── Desktop: one aligned row ── */}
            <div className={cn(GRID, "hidden sm:grid")}>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-[13.5px] font-medium text-foreground">
                    {row.name}
                  </span>
                  <span className="shrink-0 text-[11.5px] text-subtle-foreground">
                    {row.asset}
                  </span>
                </div>
                {row.subtitle && (
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {row.subtitle}
                  </p>
                )}
                {row.progress !== undefined && (
                  <div className="mt-2 flex items-center gap-2.5">
                    <span className="h-[3px] w-32 overflow-hidden rounded-full bg-border">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{
                          width: `${Math.min(Math.max(row.progress, 0), 100)}%`,
                        }}
                      />
                    </span>
                    <span className="text-[11.5px] text-subtle-foreground">
                      {row.progressLabel}
                    </span>
                  </div>
                )}
              </div>

              <ChainCell chainId={row.chainId} />

              <span
                data-numeric
                className="text-right text-[14px] font-medium text-foreground"
              >
                {row.rate}
              </span>

              <div className="text-right">
                <span
                  data-numeric
                  className="block text-[13.5px] text-foreground"
                >
                  {row.tvl}
                </span>
                {row.detail && (
                  <span className="mt-0.5 block text-[11.5px] text-subtle-foreground">
                    {detailLabel} {row.detail}
                  </span>
                )}
              </div>

              <ChevronRight
                className="h-4 w-4 text-subtle-foreground/50 transition-colors group-hover:text-foreground"
                strokeWidth={1.75}
              />
            </div>

            {/* ── Mobile: stacked, still hairline-separated ── */}
            <div className="sm:hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-foreground">
                    {row.name}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {row.asset}
                    {row.subtitle ? ` · ${row.subtitle}` : ""}
                  </p>
                </div>
                <span
                  data-numeric
                  className="shrink-0 text-[15px] font-medium text-foreground"
                >
                  {row.rate}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-[11.5px] text-subtle-foreground">
                <ChainCell chainId={row.chainId} />
                <span data-numeric>
                  {tvlLabel} {row.tvl}
                </span>
                {row.detail && (
                  <span data-numeric>
                    {detailLabel} {row.detail}
                  </span>
                )}
              </div>
              {row.progress !== undefined && (
                <div className="mt-2.5 flex items-center gap-2.5">
                  <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-border">
                    <span
                      className="block h-full rounded-full bg-brand"
                      style={{
                        width: `${Math.min(Math.max(row.progress, 0), 100)}%`,
                      }}
                    />
                  </span>
                  <span className="shrink-0 text-[11px] text-subtle-foreground">
                    {row.progressLabel}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
