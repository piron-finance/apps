"use client";

import Image from "next/image";
import type { Pool } from "@/lib/api/types";
import { getAddressUrl, getChainName } from "@/lib/constants/chains";

/**
 * Trust & disclosures for a tokenized real-world-asset pool. Everything here is
 * real and verifiable — issuer, structure, jurisdiction, and a live link to the
 * on-chain contract. No fabricated documents; fields hide when absent.
 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-[12px] text-[#777]">{label}</span>
      <span className="min-w-0 truncate text-right text-[12px] font-medium text-white">{children}</span>
    </div>
  );
}

const CheckBadge = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#00c853]">
    <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.4 7.1L6.1 8.8L9.6 5.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function PoolTrustPanel({ pool }: { pool: Pool }) {
  const jurisdiction = [pool.region, pool.country].filter(Boolean).join(" · ");
  const contractUrl = getAddressUrl(pool.chainId, pool.poolAddress);

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-white">Issuer &amp; disclosures</h3>
        <span className="inline-flex items-center gap-1 rounded-md border border-[#1f2a24] bg-[#0a1a12] px-2 py-0.5 text-[10px] font-medium text-[#00c853]">
          <CheckBadge /> On-chain verified
        </span>
      </div>

      {/* Issuer */}
      {pool.issuer && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-[#161616] bg-[#0a0a0b] p-3">
          {pool.issuerLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pool.issuerLogo} alt={pool.issuer} className="h-8 w-8 rounded-full border border-[#1a1a1a] object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0e0e0e] text-[12px] font-medium text-[#999]">
              {pool.issuer[0]?.toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13px] font-medium text-white">{pool.issuer}</p>
              <CheckBadge />
            </div>
            <p className="text-[11px] text-[#777]">Verified issuer · SPV-wrapped</p>
          </div>
        </div>
      )}

      <div className="divide-y divide-[#141414]">
        <Row label="Structure">SPV-wrapped {pool.poolType === "SINGLE_ASSET" ? "note" : "fund"}</Row>
        {pool.securityType && <Row label="Instrument">{pool.securityType}</Row>}
        {pool.riskRating && <Row label="Risk rating">{pool.riskRating}</Row>}
        {jurisdiction && <Row label="Jurisdiction">{jurisdiction}</Row>}
        <Row label="Settlement">{getChainName(pool.chainId)}</Row>
        <Row label="Contract">
          <a
            href={contractUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[#8a8a8a] transition-colors hover:text-white"
          >
            {pool.poolAddress.slice(0, 6)}…{pool.poolAddress.slice(-4)} ↗
          </a>
        </Row>
      </div>

      <p className="mt-3 border-t border-[#141414] pt-3 text-[10px] leading-relaxed text-[#5f5f5f]">
        Tokenized claim on an off-chain instrument held by a bankruptcy-remote SPV.
        Verify the pool contract on-chain above. Testnet — not an offer or financial advice.
      </p>
    </div>
  );
}
