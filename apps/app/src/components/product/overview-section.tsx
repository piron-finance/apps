"use client";

import { ExternalLink, FileText } from "lucide-react";
import { poolTypeLabel } from "@/lib/pool-helpers";
import type { Pool, Product, ProductInstance } from "@/lib/api/types";
import { minimumInvestment, totalInvestors } from "./aggregate";
import { formatDate, formatNumber } from "./formatters";
import { Fact, FactGrid, SectionHeading } from "./ui";

/** Fields the detail endpoint returns but the shared `Pool` type doesn't declare. */
type PoolExtras = {
  cusip?: string | null;
  isin?: string | null;
  prospectusUrl?: string | null;
  createdOnChain?: string | null;
};

/** Earliest on-chain creation across the deployments — when the fund opened. */
function inceptionOf(pools: Pool[]): string | Date | null {
  const dates = pools
    .map((p) => (p as Pool & PoolExtras).createdOnChain ?? p.createdAt)
    .filter(Boolean)
    .map((d) => new Date(d as string | Date))
    .filter((d) => !Number.isNaN(d.getTime()));
  if (!dates.length) return null;
  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

export function OverviewSection({
  product,
  scopedInstances,
  scopedPools,
  allPools,
}: {
  product: Product;
  /** Deployments in the current scope — drives per-network facts. */
  scopedInstances: ProductInstance[];
  scopedPools: Pool[];
  /** Every deployment, regardless of scope — investors are always a grand total. */
  allPools: Pool[];
}) {
  // Identifiers are registered per pool but describe the same security, so the
  // first deployment that carries them speaks for the fund.
  const extras = (scopedPools.find(
    (p) => (p as Pool & PoolExtras).cusip || (p as Pool & PoolExtras).isin || (p as Pool & PoolExtras).prospectusUrl,
  ) ?? scopedPools[0] ?? {}) as PoolExtras;

  const hasIdentifiers = Boolean(extras.cusip || extras.isin || extras.prospectusUrl);
  const minimum = minimumInvestment(scopedInstances);
  const investors = totalInvestors(allPools);
  const inception = inceptionOf(scopedPools);

  return (
    <div className="space-y-10">
      <section>
        <SectionHeading title="About this fund" />
        <p className="max-w-3xl text-[13.5px] leading-relaxed text-muted-foreground">
          {product.description ||
            "No strategy description has been published for this fund yet."}
        </p>
      </section>

      <section>
        <SectionHeading title="Key facts" />
        <FactGrid>
          <Fact label="Structure" value={poolTypeLabel(product.poolType)} />
          <Fact label="Security type" value={product.securityType || "—"} />
          <Fact label="Issuer" value={product.issuer || "—"} />
          <Fact
            label="Domicile"
            value={product.country || product.region || "—"}
            hint={product.country && product.region ? product.region : undefined}
          />
          <Fact
            label="Denominated in"
            value={scopedInstances[0]?.assetSymbol ?? "—"}
          />
          <Fact
            label="Minimum investment"
            value={
              minimum
                ? minimum.min === minimum.max
                  ? `${formatNumber(minimum.min, 0)} ${minimum.symbol}`
                  : `${formatNumber(minimum.min, 0)}–${formatNumber(minimum.max, 0)} ${minimum.symbol}`
                : "—"
            }
            hint={minimum && minimum.min !== minimum.max ? "varies by network" : undefined}
          />
          <Fact label="Risk rating" value={product.riskRating || "Unrated"} />
          <Fact
            label="Investors"
            value={investors != null ? String(investors) : "—"}
            hint={
              product.aggregates.instanceCount > 1 ? "all networks" : undefined
            }
          />
          <Fact
            label="Inception"
            value={formatDate(inception)}
            hint={product.aggregates.instanceCount > 1 ? "first deployment" : undefined}
          />
          <Fact
            label="Networks"
            value={String(product.aggregates.instanceCount)}
            hint={
              product.aggregates.instanceCount > 1 ? "independent deployments" : undefined
            }
          />
          <Fact
            label="Redemption"
            value={
              product.poolType === "STABLE_YIELD"
                ? "Any time"
                : product.poolType === "LOCKED"
                  ? "At end of term"
                  : "At maturity"
            }
          />
        </FactGrid>
      </section>

      {product.tags.length > 0 && (
        <section>
          <SectionHeading title="Classification" />
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border-subtle px-3 py-1.5 text-[11.5px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {hasIdentifiers && (
        <section>
          <SectionHeading title="Identifiers & documents" />
          <FactGrid>
            {extras.cusip && <Fact label="CUSIP" value={extras.cusip} />}
            {extras.isin && <Fact label="ISIN" value={extras.isin} />}
          </FactGrid>
          {extras.prospectusUrl && (
            <a
              href={extras.prospectusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring mt-5 inline-flex items-center gap-2 rounded border border-border px-3.5 py-2 text-[12.5px] font-medium text-foreground hover:border-border-strong"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
              Prospectus
              <ExternalLink className="h-3 w-3 text-subtle-foreground" strokeWidth={1.75} />
            </a>
          )}
        </section>
      )}
    </div>
  );
}
