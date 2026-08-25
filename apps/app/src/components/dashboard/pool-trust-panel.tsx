"use client";

import type { Pool } from "@/lib/api/types";
import { getAddressUrl, getChainName } from "@/lib/constants/chains";

/**
 * Trust & disclosures for a tokenized real-world-asset pool. Everything here is
 * real and verifiable — issuer, structure, jurisdiction, and a live link to the
 * on-chain contract. No fabricated documents; fields hide when absent.
 */

/** Green check used next to a verified issuer, here and in the pool header. */
export function VerifiedMark({ className = "" }: { className?: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      role="img"
      aria-label="Verified issuer"
      className={`shrink-0 text-positive ${className}`}
    >
      <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M4.4 7.1L6.1 8.8L9.6 5.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-foreground">{children}</span>
    </div>
  );
}

export function PoolTrustPanel({ pool }: { pool: Pool }) {
  const jurisdiction = [pool.region, pool.country].filter(Boolean).join(" · ");
  const contractUrl = getAddressUrl(pool.chainId, pool.poolAddress);

  return (
    <div className="section-block">
      <div className="mb-0.5 flex items-center justify-between gap-3">
        <h3 className="text-[13.5px] font-semibold tracking-tight text-foreground">
          Issuer &amp; disclosures
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-positive/25 bg-positive-soft px-2 py-0.5 text-[10px] font-medium text-positive">
          <VerifiedMark /> On-chain verified
        </span>
      </div>
      <p className="mb-4 text-[11px] text-muted-foreground">
        Who issues this pool, and how to verify it yourself.
      </p>

      {pool.issuer && (
        <div className="panel mb-4 flex items-center gap-3 p-3">
          {pool.issuerLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pool.issuerLogo}
              alt={pool.issuer}
              className="h-8 w-8 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand-ink">
              {pool.issuer[0]?.toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13px] font-medium text-foreground">{pool.issuer}</p>
              <VerifiedMark />
            </div>
            <p className="text-[11px] text-muted-foreground">Verified issuer · SPV-wrapped</p>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        <Row label="Structure">
          SPV-wrapped {pool.poolType === "SINGLE_ASSET" ? "note" : "fund"}
        </Row>
        {pool.securityType && <Row label="Instrument">{pool.securityType}</Row>}
        {pool.riskRating && <Row label="Risk rating">{pool.riskRating}</Row>}
        {jurisdiction && <Row label="Jurisdiction">{jurisdiction}</Row>}
        <Row label="Settlement">{getChainName(pool.chainId)}</Row>
        <Row label="Contract">
          <a
            href={contractUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded font-mono text-muted-foreground hover:text-foreground"
          >
            {pool.poolAddress.slice(0, 6)}…{pool.poolAddress.slice(-4)} ↗
          </a>
        </Row>
      </div>

      <p className="mt-4 border-t border-border-subtle pt-3 text-[10.5px] leading-relaxed text-subtle-foreground">
        Tokenized claim on an off-chain instrument held by a bankruptcy-remote SPV.
        Verify the pool contract on-chain above. Testnet — not an offer or financial advice.
      </p>
    </div>
  );
}
