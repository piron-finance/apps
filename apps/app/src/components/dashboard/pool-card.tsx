"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CHAIN_INFO } from "@/lib/constants/chains";
import { cn } from "@/lib/utils";

export interface PoolCardData {
  id: string;
  poolId: string;
  chainId?: number;
  /** "Flexible yield" | "Fixed yield" | "Term deal" */
  kind: string;
  name: string;
  /** NAV, issuer — one line of identity beneath the name. */
  subtitle?: string;
  asset: string;
  /** The single number this card exists to communicate. */
  rate: string;
  rateLabel: string;
  /** Two supporting figures, no more. */
  footnotes: { label: string; value: string }[];
  /** 0–100. Term deals only. */
  progress?: number;
  progressLabel?: string;
}

function ChainMark({ chainId }: { chainId?: number }) {
  const chain = chainId ? CHAIN_INFO[chainId] : undefined;
  if (!chain) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
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

/**
 * Deliberately sparse: type, identity, one rate, two footnotes. Anything more
 * belongs on the pool's own page, not on a card you are scanning past.
 */
export function PoolCard({ pool }: { pool: PoolCardData }) {
  return (
    <Link
      href={`/pool/${pool.poolId}`}
      className={cn(
        "group flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors duration-200",
        "hover:border-border-strong hover:bg-surface-raised",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {/* Meta */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11.5px] text-subtle-foreground">
          {pool.kind}
        </span>
        <ChainMark chainId={pool.chainId} />
      </div>

      {/* Identity */}
      <h3 className="mt-3.5 text-[14.5px] font-medium leading-snug tracking-title text-foreground">
        {pool.name}
      </h3>
      <p className="mt-1 text-[12px] text-muted-foreground">
        {pool.asset}
        {pool.subtitle ? ` · ${pool.subtitle}` : ""}
      </p>

      {/* The number */}
      <div className="mb-5 mt-5">
        <p
          data-numeric
          className="text-[30px] font-semibold leading-none tracking-display text-foreground"
        >
          {pool.rate}
        </p>
        <p className="eyebrow mt-2">{pool.rateLabel}</p>
      </div>

      {/* Funding meter — term deals only */}
      {pool.progress !== undefined && (
        <div className="-mt-1 mb-5">
          <span className="block h-[3px] w-full overflow-hidden rounded-full bg-border">
            <span
              className="block h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
              style={{
                width: `${Math.min(Math.max(pool.progress, 0), 100)}%`,
              }}
            />
          </span>
          {pool.progressLabel && (
            <p className="mt-2 text-[11.5px] text-subtle-foreground">
              {pool.progressLabel}
            </p>
          )}
        </div>
      )}

      {/* Footnotes */}
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-border-subtle pt-4">
        <dl className="flex gap-6">
          {pool.footnotes.map((note) => (
            <div key={note.label}>
              <dt className="text-[11px] text-subtle-foreground">
                {note.label}
              </dt>
              <dd
                data-numeric
                className="mt-1 text-[13px] text-foreground"
              >
                {note.value}
              </dd>
            </div>
          ))}
        </dl>
        <ArrowRight
          className="mb-0.5 h-4 w-4 shrink-0 text-subtle-foreground/60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  );
}

export function PoolCardGrid({
  pools,
  loading = false,
  emptyMessage,
}: {
  pools: PoolCardData[];
  loading?: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border p-5">
            <div className="h-3 w-24 animate-pulse rounded-sm bg-muted" />
            <div className="mt-4 h-4 w-2/3 animate-pulse rounded-sm bg-muted" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded-sm bg-muted" />
            <div className="mt-5 h-8 w-28 animate-pulse rounded-sm bg-muted" />
            <div className="mt-6 h-3 w-40 animate-pulse rounded-sm bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-5 py-12">
        <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {pools.map((pool) => (
        <PoolCard key={pool.id} pool={pool} />
      ))}
    </div>
  );
}
