"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CHAIN_INFO, getChainName, isTestnet } from "@/lib/constants/chains";
import { getDepositAvailability } from "@/lib/pool-helpers";
import type { Pool, Product, ProductInstance } from "@/lib/api/types";
import type { ChainScope } from "./aggregate";
import { formatCompactUsd, formatNumber } from "./formatters";
import { AddressLine, SectionHeading } from "./ui";

const STATUS_TONE: Record<string, string> = {
  FUNDING: "bg-brand-soft text-brand-ink",
  FILLED: "bg-brand-soft text-brand-ink",
  PENDING_INVESTMENT: "bg-info-soft text-info",
  INVESTED: "bg-info-soft text-info",
  MATURED: "bg-muted text-muted-foreground",
  WITHDRAWN: "bg-muted text-muted-foreground",
  EMERGENCY: "bg-warning-soft text-warning",
  CANCELLED: "bg-muted text-muted-foreground",
};

/**
 * Where the fund is deployed. This is the one place chain is the subject —
 * a reference table, not the spine of the page.
 */
export function NetworksSection({
  product,
  scope,
  onScopeChange,
  pools,
}: {
  product: Product;
  scope: ChainScope;
  onScopeChange: (scope: ChainScope) => void;
  /** Loaded detail for the deployments in scope — supplies contract addresses. */
  pools: Pool[];
}) {
  return (
    <div className="space-y-10">
      <section>
        <SectionHeading
          title="Deployments"
          note="The same strategy runs independently on each network. Shares are issued and redeemed on the network you deposit into — they don't move between chains."
          action={
            scope !== "all" ? (
              <button
                onClick={() => onScopeChange("all")}
                className="focus-ring rounded border border-border px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground"
              >
                Show all networks
              </button>
            ) : undefined
          }
        />

        <div className="divide-y divide-border-subtle border-y border-border-subtle">
          {product.instances.map((instance) => (
            <NetworkRow
              key={instance.poolAddress}
              product={product}
              instance={instance}
              selected={scope === instance.chainId}
              onSelect={() => onScopeChange(instance.chainId)}
            />
          ))}
        </div>
      </section>

      {pools.length > 0 && (
        <section>
          <SectionHeading
            title="Contracts"
            note={
              pools.length > 1
                ? "On-chain addresses for each deployment."
                : `On-chain addresses for the ${getChainName(pools[0]!.chainId)} deployment.`
            }
          />
          <div className="space-y-4">
            {pools.map((pool) => (
              <div key={pool.poolAddress} className="rounded-lg border border-border">
                {pools.length > 1 && (
                  <p className="border-b border-border-subtle px-5 py-2.5 text-[12px] font-medium text-foreground">
                    {getChainName(pool.chainId)}
                  </p>
                )}
                <div className="px-5 py-2">
                  <AddressLine label="Pool" address={pool.poolAddress} chainId={pool.chainId} />
                  <AddressLine
                    label={`Asset (${pool.assetSymbol})`}
                    address={pool.assetAddress}
                    chainId={pool.chainId}
                  />
                  <AddressLine
                    label="Escrow"
                    address={pool.escrowAddress}
                    chainId={pool.chainId}
                  />
                  <AddressLine
                    label="Manager"
                    address={(pool as Pool & { managerAddress?: string }).managerAddress}
                    chainId={pool.chainId}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function NetworkRow({
  product,
  instance,
  selected,
  onSelect,
}: {
  product: Product;
  instance: ProductInstance;
  selected: boolean;
  onSelect: () => void;
}) {
  const chain = CHAIN_INFO[instance.chainId];
  const availability = getDepositAvailability({
    poolType: product.poolType,
    status: instance.status,
    epochEndTime: null,
  } as Pool);

  return (
    <div
      className={`flex flex-col gap-4 py-5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
        selected ? "" : "opacity-95"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {chain?.logo ? (
          <Image src={chain.logo} alt="" width={26} height={26} className="rounded-full" />
        ) : (
          <span
            className="h-6 w-6 shrink-0 rounded-full"
            style={{ background: chain?.color ?? "hsl(var(--muted))" }}
          />
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13.5px] font-medium text-foreground">
              {getChainName(instance.chainId)}
            </p>
            {selected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10.5px] font-medium text-brand-ink">
                <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                Only this
              </span>
            )}
            {isTestnet(instance.chainId) && (
              <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[10.5px] text-subtle-foreground">
                Testnet
              </span>
            )}
          </div>
          <span
            className={`mt-1 inline-block rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium ${
              STATUS_TONE[instance.status] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {instance.status.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 sm:flex-nowrap sm:justify-end sm:gap-8">
        <Figure label="TVL" value={formatCompactUsd(instance.tvl)} />
        <Figure
          label="NAV / share"
          value={instance.navPerShare ? formatNumber(instance.navPerShare, 4) : "—"}
        />
        <Figure
          label="Rate"
          value={instance.apy != null ? `${instance.apy.toFixed(2)}%` : "—"}
        />

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
          {!selected && (
            <button
              onClick={onSelect}
              className="focus-ring rounded border border-border px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground"
            >
              Focus
            </button>
          )}
          {availability.canDeposit ? (
            <Link
              href={`/pool/${instance.poolAddress}?invest=1`}
              className="focus-ring inline-flex items-center gap-1 rounded bg-brand px-3 py-1.5 text-[11.5px] font-medium text-brand-foreground hover:bg-brand-strong"
            >
              Invest
              <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          ) : (
            <span className="text-[11.5px] text-subtle-foreground">{availability.label}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p data-numeric className="text-[13px] font-medium text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-subtle-foreground">{label}</p>
    </div>
  );
}
