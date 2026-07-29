"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CHAIN_INFO } from "@/lib/constants/chains";
import { cn } from "@/lib/utils";

/** Each pool type owns a colour, shared with the allocation bar in the rail. */
export type PoolAccent = "brand" | "info" | "warning";

export interface PoolCardData {
  id: string;
  poolId: string;
  chainId?: number;
  /** When set, the card is a product (links to /product/[key]) and shows all its
   *  networks. Falls back to a single-pool card + chainId when absent. */
  productKey?: string;
  chains?: number[];
  /** "Flexible yield" | "Fixed yield" | "Term deal" */
  kind: string;
  accent: PoolAccent;
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

const ACCENT = {
  brand: {
    chip: "bg-brand-soft text-brand-ink",
    bar: "bg-brand",
    hover: "hover:border-brand/35",
    wash: "from-brand/[0.05]",
    meter: "bg-brand",
  },
  info: {
    chip: "bg-info-soft text-info",
    bar: "bg-info",
    hover: "hover:border-info/35",
    wash: "from-info/[0.05]",
    meter: "bg-info",
  },
  warning: {
    chip: "bg-warning-soft text-warning",
    bar: "bg-warning",
    hover: "hover:border-warning/35",
    wash: "from-warning/[0.06]",
    meter: "bg-warning",
  },
} as const;

function ChainDot({ chainId, ring }: { chainId: number; ring?: boolean }) {
  const chain = CHAIN_INFO[chainId];
  if (!chain) return null;
  return chain.logo ? (
    <Image
      src={chain.logo}
      alt={chain.shortName}
      width={14}
      height={14}
      className={cn("shrink-0 rounded-full", ring && "ring-2 ring-surface")}
    />
  ) : (
    <span
      className={cn("h-[9px] w-[9px] shrink-0 rounded-full", ring && "ring-2 ring-surface")}
      style={{ background: chain.color }}
    />
  );
}

/** One chain → logo + name. Many → overlapping logos + "N networks" (the
 *  "available networks" badge; shares are not fungible across them). */
function ChainMarks({ chains }: { chains: number[] }) {
  if (chains.length === 0) return null;
  if (chains.length === 1) {
    const chain = CHAIN_INFO[chains[0]];
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <ChainDot chainId={chains[0]} />
        {chain?.shortName}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
      <span className="flex -space-x-1.5">
        {chains.slice(0, 4).map((c) => (
          <ChainDot key={c} chainId={c} ring />
        ))}
      </span>
      {chains.length} networks
    </span>
  );
}

/**
 * Landscape, not portrait: identity on the left, the rate on the right, two
 * footnotes under a rule. The colour is carried by the pool type, so it means
 * something rather than decorating.
 */
export function PoolCard({ pool }: { pool: PoolCardData }) {
  const accent = ACCENT[pool.accent];

  const href = pool.productKey ? `/product/${pool.productKey}` : `/pool/${pool.poolId}`;
  const chains = pool.chains ?? (pool.chainId != null ? [pool.chainId] : []);

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface p-6",
        "",
        accent.hover,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {/* A wash in the type colour so the surface has some depth without a shadow. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-70",
          accent.wash,
        )}
      />
      {/* Index tab — short at rest, extends on hover. */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 h-[2px] w-8",
          accent.bar,
        )}
      />

      <div className="relative flex items-center justify-between gap-3">
        <span
          className={cn(
            "rounded-sm px-2 py-1 text-[11.5px] font-medium",
            accent.chip,
          )}
        >
          {pool.kind}
        </span>
        <ChainMarks chains={chains} />
      </div>

      {/* Identity + rate share a baseline row so the card reads landscape. */}
      <div className="relative mt-7 flex items-end justify-between gap-6">
        <div className="min-w-0">
          <h3 className="text-[15px] font-medium leading-snug tracking-title text-foreground">
            {pool.name}
          </h3>
          <p className="mt-1.5 truncate text-[12.5px] text-muted-foreground">
            {pool.asset}
            {pool.subtitle ? ` · ${pool.subtitle}` : ""}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p
            data-numeric
            className="text-[27px] font-semibold leading-none tracking-display text-foreground"
          >
            {pool.rate}
          </p>
          <p className="mt-2 text-[11.5px] text-muted-foreground">{pool.rateLabel}</p>
        </div>
      </div>

      {/* Funding meter — term deals only */}
      {pool.progress !== undefined && (
        <div className="relative mt-6">
          <span className="block h-[3px] w-full overflow-hidden rounded-full bg-border">
            <span
              className={cn(
                "block h-full rounded-full",
                accent.meter,
              )}
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

      <div className="relative mt-8 flex items-center justify-between gap-4 border-t border-border-subtle pt-4">
        <dl className="flex gap-6">
          {pool.footnotes.map((note) => (
            <div key={note.label} className="flex items-baseline gap-1.5">
              <dt className="text-[11.5px] text-subtle-foreground">
                {note.label}
              </dt>
              <dd data-numeric className="text-[12.5px] text-foreground">
                {note.value}
              </dd>
            </div>
          ))}
        </dl>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-subtle-foreground/60 group-hover:text-foreground"
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
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border border-border p-6">
            <div className="h-4 w-28 animate-pulse rounded-sm bg-muted" />
            <div className="mt-5 flex items-end justify-between">
              <div className="flex-1">
                <div className="h-4 w-2/3 animate-pulse rounded-sm bg-muted" />
                <div className="mt-2 h-3 w-1/3 animate-pulse rounded-sm bg-muted" />
              </div>
              <div className="h-7 w-20 animate-pulse rounded-sm bg-muted" />
            </div>
            <div className="mt-6 h-3 w-44 animate-pulse rounded-sm bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-14">
        <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {pools.map((pool) => (
        <PoolCard key={pool.id} pool={pool} />
      ))}
    </div>
  );
}
