"use client";

import Link from "next/link";
import Image from "next/image";
import { useAccount } from "wagmi";
import { ArrowRight } from "lucide-react";
import { CHAIN_INFO, getChainName } from "@/lib/constants/chains";
import { getDepositAvailability } from "@/lib/pool-helpers";
import type { Pool, Product, ProductInstance } from "@/lib/api/types";
import {
  minimumInvestment,
  sumTvl,
  weightedApy,
  weightedNav,
  type ChainScope,
} from "./aggregate";
import { formatCompactUsd, formatNumber } from "./formatters";
import { useDeploymentPositions } from "./use-deployments";

/**
 * The invest rail. It opens on "All networks" — the fund as a whole — and a
 * network is only ever named when you're about to deposit into one, because a
 * deposit is the one thing that genuinely happens on a single chain.
 */
export function InvestPanel({
  product,
  scope,
  instances,
  onScopeChange,
}: {
  product: Product;
  scope: ChainScope;
  /** The deployments in scope: all of them, or the single selected one. */
  instances: ProductInstance[];
  onScopeChange: (scope: ChainScope) => void;
}) {
  const { address, isConnected } = useAccount();
  const { positions } = useDeploymentPositions(instances, address);

  const multi = product.instances.length > 1;
  // A single-deployment fund has nothing to aggregate: "all networks" and "that
  // one network" are the same thing, so it gets the plain single-network rail.
  const isAll = multi && scope === "all";
  const single = isAll ? null : (instances[0] ?? product.instances[0]!);
  const chain = single ? CHAIN_INFO[single.chainId] : null;

  const nav = weightedNav(instances);
  const apy = weightedApy(instances);
  const minimum = minimumInvestment(instances);
  const symbol = instances[0]?.assetSymbol ?? "";

  const openInstances = product.instances.filter(
    (i) => availabilityOf(product, i).canDeposit,
  );
  const availability = single ? availabilityOf(product, single) : null;

  // Positions are per pool; in the aggregate view we total what the wallet
  // holds in this product across every network.
  const held = positions.filter((p) => parseFloat(p.currentValue || "0") > 0);
  const heldValue = held.reduce((s, p) => s + parseFloat(p.currentValue || "0"), 0);
  const heldReturn = held.reduce((s, p) => s + parseFloat(p.totalReturn || "0"), 0);

  return (
    <aside className="lg:sticky lg:top-6">
      <div className="rounded-lg border border-border bg-surface">
        <div className="border-b border-border-subtle px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
            Invest
          </h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
            {!multi
              ? `Deposit ${symbol} to receive fund shares.`
              : isAll
                ? "Figures below cover every network this fund runs on."
                : `Figures below are for ${getChainName(single!.chainId)} only.`}
          </p>
        </div>

        <div className="px-5 py-4">
          {multi ? (
            <>
              <label
                htmlFor="invest-scope"
                className="text-[11px] uppercase tracking-wide text-subtle-foreground"
              >
                Showing
              </label>
              <div className="relative mt-2">
                {chain?.logo && (
                  <Image
                    src={chain.logo}
                    alt=""
                    width={16}
                    height={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full"
                  />
                )}
                <select
                  id="invest-scope"
                  value={isAll ? "all" : String(single!.chainId)}
                  onChange={(e) =>
                    onScopeChange(e.target.value === "all" ? "all" : Number(e.target.value))
                  }
                  className={`focus-ring h-10 w-full appearance-none rounded border border-border bg-surface pr-8 text-[13px] font-medium text-foreground hover:border-border-strong ${
                    chain?.logo ? "pl-9" : "pl-3"
                  }`}
                >
                  <option value="all">
                    All networks ({product.aggregates.instanceCount})
                  </option>
                  {product.instances.map((i) => (
                    <option key={i.chainId} value={i.chainId}>
                      {getChainName(i.chainId)}
                    </option>
                  ))}
                </select>
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle-foreground"
                >
                  <path
                    d="M4 6l4 4 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </>
          ) : (
            <div className="flex h-10 items-center gap-2 rounded border border-border-subtle bg-surface-sunken px-3">
              {chain?.logo && (
                <Image src={chain.logo} alt="" width={16} height={16} className="rounded-full" />
              )}
              <span className="text-[13px] font-medium text-foreground">
                {getChainName(single!.chainId)}
              </span>
            </div>
          )}

          <dl className="mt-4 space-y-2.5">
            <Row
              label="NAV / share"
              value={nav != null ? `${formatNumber(nav, 4)} ${symbol}` : "—"}
              hint={isAll ? "weighted avg" : undefined}
            />
            <Row
              label="Minimum"
              value={
                minimum
                  ? minimum.min === minimum.max
                    ? `${formatNumber(minimum.min, 0)} ${minimum.symbol}`
                    : `${formatNumber(minimum.min, 0)}–${formatNumber(minimum.max, 0)} ${minimum.symbol}`
                  : "—"
              }
            />
            <Row
              label={isAll ? "Total liquidity" : "Liquidity here"}
              value={formatCompactUsd(sumTvl(instances))}
            />
            <Row
              label="Rate"
              value={apy != null ? `${apy.toFixed(2)}%` : "—"}
              hint={isAll ? "blended" : undefined}
            />
          </dl>

          {isAll ? (
            openInstances.length > 0 ? (
              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-wide text-subtle-foreground">
                  Deposit on
                </p>
                <div className="mt-2 space-y-2">
                  {openInstances.map((i) => (
                    <NetworkCta key={i.poolAddress} instance={i} />
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-subtle-foreground">
                  A deposit settles on one network. What you put in on a network is
                  redeemed on that same network.
                </p>
              </div>
            ) : (
              <ClosedNote
                label="Deposits closed"
                reason="No network is currently accepting deposits."
              />
            )
          ) : availability?.canDeposit ? (
            <Link
              href={`/pool/${single!.poolAddress}?invest=1`}
              className="focus-ring mt-5 flex h-11 w-full items-center justify-center gap-2 rounded bg-brand text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand-strong"
            >
              Invest on {getChainName(single!.chainId)}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          ) : (
            <ClosedNote
              label={availability?.label ?? "Deposits closed"}
              reason={`${availability?.reason ?? ""}${
                openInstances.length > 0 ? " Another network is open — switch above." : ""
              }`}
            />
          )}
        </div>

        {isConnected && heldValue > 0 && (
          <div className="border-t border-border-subtle bg-surface-sunken px-5 py-4">
            <p className="text-[11px] uppercase tracking-wide text-subtle-foreground">
              {isAll ? "Your position" : "Your position here"}
            </p>
            <p
              data-numeric
              className="mt-1.5 text-[19px] font-semibold tracking-display text-foreground"
            >
              {formatNumber(heldValue)} {symbol}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 text-[11.5px]">
              <span className={heldReturn >= 0 ? "text-positive" : "text-negative"}>
                {heldReturn >= 0 ? "+" : ""}
                {formatNumber(heldReturn)}
              </span>
              {isAll && held.length > 1 && (
                <span className="text-subtle-foreground">
                  across {held.length} networks
                </span>
              )}
            </div>
            <Link
              href="/portfolio"
              className="focus-ring mt-3 inline-flex items-center gap-1 rounded text-[12px] font-medium text-brand-ink hover:underline"
            >
              Manage in portfolio
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

/** Deposit gating from off-chain state — works before the detail request lands. */
function availabilityOf(product: Product, instance: ProductInstance) {
  return getDepositAvailability({
    poolType: product.poolType,
    status: instance.status,
    epochEndTime: null,
  } as Pool);
}

function NetworkCta({ instance }: { instance: ProductInstance }) {
  const chain = CHAIN_INFO[instance.chainId];
  return (
    <Link
      href={`/pool/${instance.poolAddress}?invest=1`}
      className="focus-ring group flex h-10 w-full items-center gap-2.5 rounded border border-border px-3 text-[12.5px] font-medium text-foreground transition-colors hover:border-brand/45 hover:bg-brand-soft/40"
    >
      {chain?.logo ? (
        <Image src={chain.logo} alt="" width={16} height={16} className="rounded-full" />
      ) : (
        <span
          className="h-4 w-4 rounded-full"
          style={{ background: chain?.color ?? "hsl(var(--muted))" }}
        />
      )}
      {getChainName(instance.chainId)}
      <ArrowRight
        className="ml-auto h-3.5 w-3.5 text-subtle-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-ink"
        strokeWidth={2}
      />
    </Link>
  );
}

function ClosedNote({ label, reason }: { label: string; reason: string }) {
  return (
    <div className="mt-5">
      <div className="flex h-11 w-full items-center justify-center rounded border border-border bg-muted text-[13px] font-medium text-muted-foreground">
        {label}
      </div>
      <p className="mt-2 text-[11.5px] leading-relaxed text-subtle-foreground">{reason}</p>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[12px] text-muted-foreground">
        {label}
        {hint && <span className="ml-1 text-[10.5px] text-subtle-foreground">{hint}</span>}
      </dt>
      <dd data-numeric className="text-[12.5px] font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}
