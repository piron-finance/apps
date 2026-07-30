"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useProduct } from "@/hooks/useProductsData";
import { CHAIN_INFO } from "@/lib/constants/chains";
import { getChainName } from "@/lib/constants/chains";
import type { ProductInstance } from "@/lib/api/types";

function formatTVL(value: string | undefined): string {
  if (!value) return "$0";
  const num = parseFloat(value);
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

const KIND: Record<string, string> = {
  STABLE_YIELD: "Flexible yield",
  LOCKED: "Fixed yield",
  SINGLE_ASSET: "Term deal",
};

const STATUS_TONE: Record<string, string> = {
  FUNDING: "text-brand-ink bg-brand-soft",
  PENDING_INVESTMENT: "text-info bg-info-soft",
  INVESTED: "text-info bg-info-soft",
  MATURED: "text-muted-foreground bg-muted",
  EMERGENCY: "text-warning bg-warning-soft",
  WITHDRAWN: "text-muted-foreground bg-muted",
};

function ChainRow({ instance }: { instance: ProductInstance }) {
  const chain = CHAIN_INFO[instance.chainId];
  return (
    <Link
      href={`/pool/${instance.poolAddress}`}
      className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-5 py-4 transition-colors hover:border-brand/35"
    >
      <div className="flex items-center gap-3">
        {chain?.logo ? (
          <Image src={chain.logo} alt="" width={22} height={22} className="rounded-full" />
        ) : (
          <span
            className="h-5 w-5 rounded-full"
            style={{ background: chain?.color ?? "#888" }}
          />
        )}
        <div>
          <p className="text-[13.5px] font-medium text-foreground">
            {getChainName(instance.chainId)}
          </p>
          <span
            className={`mt-0.5 inline-block rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium ${
              STATUS_TONE[instance.status] ?? "text-muted-foreground bg-muted"
            }`}
          >
            {instance.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-right">
        <div>
          <p data-numeric className="text-[13.5px] font-medium text-foreground">
            {formatTVL(instance.tvl)}
          </p>
          <p className="text-[11px] text-subtle-foreground">TVL</p>
        </div>
        <div>
          <p data-numeric className="text-[13.5px] font-medium text-foreground">
            {instance.apy != null ? `${instance.apy.toFixed(2)}%` : "—"}
          </p>
          <p className="text-[11px] text-subtle-foreground">Rate</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-ink">
          Invest
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productKey: string }>;
}) {
  const { productKey } = use(params);
  const { data: product, isLoading, error } = useProduct(productKey);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1000px] px-5 py-20 sm:px-8">
        <div className="h-8 w-64 animate-pulse rounded-sm bg-muted" />
        <div className="mt-8 h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-[1000px] px-5 py-20 sm:px-8">
        <p className="text-[14px] text-muted-foreground">Product not found.</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-brand-ink">
          <ArrowLeft className="h-4 w-4" /> Back to markets
        </Link>
      </div>
    );
  }

  const a = product.aggregates;
  const multi = a.instanceCount > 1;

  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-20 pt-10 sm:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Markets
      </Link>

      {/* Header */}
      <header className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-[12px] font-medium uppercase tracking-wide text-subtle-foreground">
            {KIND[product.poolType] ?? product.poolType}
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-display text-foreground">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>
        <div className="text-right">
          <p data-numeric className="text-[32px] font-semibold leading-none tracking-display text-foreground">
            {a.blendedApy != null ? `${a.blendedApy.toFixed(2)}%` : "—"}
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            {product.poolType === "LOCKED" ? "Fixed rate" : product.poolType === "SINGLE_ASSET" ? "Target APY" : "Blended APY"}
          </p>
        </div>
      </header>

      {/* Facts */}
      <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-border-subtle py-6 sm:grid-cols-4">
        {[
          { label: multi ? "TVL (all networks)" : "TVL", value: formatTVL(a.totalTvl) },
          { label: "Networks", value: String(a.instanceCount) },
          product.issuer ? { label: "Issuer", value: product.issuer } : null,
          product.securityType ? { label: "Type", value: product.securityType } : null,
          product.riskRating ? { label: "Rating", value: product.riskRating } : null,
        ]
          .filter((x): x is { label: string; value: string } => !!x)
          .map((f) => (
            <div key={f.label}>
              <dt className="text-[11.5px] text-subtle-foreground">{f.label}</dt>
              <dd data-numeric className="mt-1.5 text-[15px] font-medium text-foreground">
                {f.value}
              </dd>
            </div>
          ))}
      </dl>

      {/* Per-chain instances */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-medium tracking-title text-foreground">
            Available networks
          </h2>
          <p className="text-[11.5px] text-subtle-foreground">
            Choose where to invest
          </p>
        </div>
        {multi && (
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-subtle-foreground">
            This product is deployed independently on each network. Positions are
            held per network — a deposit on one chain is redeemed on that same chain.
          </p>
        )}
        <div className="mt-4 space-y-3">
          {product.instances.map((inst) => (
            <ChainRow key={`${inst.chainId}-${inst.poolAddress}`} instance={inst} />
          ))}
        </div>
      </section>
    </div>
  );
}
