"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CHAIN_INFO } from "@/lib/constants/chains";
import { cn } from "@/lib/utils";

export interface PoolCardProps {
  poolId?: string;
  chainId?: number;
  /** "Flexible Yield" | "Fixed Yield" | "Term Deal" */
  type: string;
  asset: string;
  name: string;
  /** The number an investor actually shops on. */
  rate?: string;
  rateLabel?: string;
  tvl: string;
  tvlLabel?: string;
  subtitle?: string;
  minInvestment?: string;
  /** Free-form third metric — utilisation, amount raised, tenor. */
  meta?: { label: string; value: string };
  /** 0–100. Renders a funding bar when present. */
  progress?: number;
  progressLabel?: string;
  tiers?: { duration: string; rate: string }[];
  tags: string[];
  link: string;
  featured?: boolean;
}

function ChainChip({ chainId }: { chainId?: number }) {
  const chain = chainId ? CHAIN_INFO[chainId] : undefined;
  if (!chain) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      {chain.logo ? (
        <Image src={chain.logo} alt="" width={14} height={14} className="rounded-full" />
      ) : (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: chain.color }}
        />
      )}
      {chain.shortName}
    </span>
  );
}

export function PoolCard({
  poolId = "demo",
  chainId,
  type,
  asset,
  name,
  rate,
  rateLabel = "APY",
  tvl,
  tvlLabel = "TVL",
  subtitle,
  minInvestment,
  meta,
  progress,
  progressLabel,
  tiers,
  tags,
  link,
  featured = false,
}: PoolCardProps) {
  const metrics = [
    rate ? { label: rateLabel, value: rate, accent: true } : null,
    { label: tvlLabel, value: tvl, accent: false },
    meta
      ? { label: meta.label, value: meta.value, accent: false }
      : minInvestment
        ? {
            label: "Min",
            value: `${parseFloat(minInvestment).toLocaleString()} ${asset}`,
            accent: false,
          }
        : null,
  ].filter(Boolean) as { label: string; value: string; accent: boolean }[];

  return (
    <Link
      href={`/pool/${poolId}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-surface p-5 shadow-card transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        featured
          ? "border-brand-line/70 hover:border-brand/50"
          : "border-border hover:border-border-strong",
      )}
    >
      {featured && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand/70 via-brand to-brand/20"
        />
      )}

      {/* Meta row */}
      <div className="flex items-center gap-2.5">
        <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {type}
        </span>
        {asset && (
          <span className="text-[11px] font-medium text-subtle-foreground">
            {asset}
          </span>
        )}
        <span className="ml-auto">
          <ChainChip chainId={chainId} />
        </span>
      </div>

      {/* Identity */}
      <h3 className="mt-4 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
        {name}
      </h3>
      {subtitle && (
        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
          {subtitle}
        </p>
      )}

      {/* Funding progress — term deals only */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
          {progressLabel && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              {progressLabel}
            </p>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-surface-sunken px-3 py-2.5">
            <p
              data-numeric
              className={cn(
                "text-[15px] font-semibold leading-none",
                metric.accent ? "text-brand-ink" : "text-foreground",
              )}
            >
              {metric.value}
            </p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.1em] text-subtle-foreground">
              {metric.label}
            </p>
          </div>
        ))}
      </div>

      {/* Lock tiers */}
      {tiers && tiers.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {tiers.slice(0, 4).map((tier) => (
            <span
              key={tier.duration}
              className="rounded-full border border-border-subtle px-2 py-1 text-[10.5px] text-muted-foreground"
            >
              {tier.duration}
              <span className="ml-1 font-semibold text-brand-ink">
                {tier.rate}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border-subtle px-2 py-0.5 text-[10.5px] text-subtle-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors group-hover:text-brand-ink">
          {link}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </span>
      </div>
    </Link>
  );
}
