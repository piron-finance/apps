"use client";

import Link from "next/link";
import Image from "next/image";
import { CHAIN_INFO } from "@/lib/constants/chains";

interface PoolCardProps {
  type: string;
  asset: string;
  name: string;
  tvl: string;
  subtitle?: string;
  info: string;
  right: string;
  tags: string[];
  link: string;
  minInvestment?: string;
  currency?: string;
  poolId?: string;
  chainId?: number;
  tiers?: { duration: string; rate: string }[];
}

export function PoolCard({
  type,
  asset,
  name,
  tvl,
  subtitle,
  info,
  right,
  tags,
  link,
  minInvestment,
  currency,
  poolId = "demo",
  chainId,
  tiers,
}: PoolCardProps) {
  const chain = chainId ? CHAIN_INFO[chainId] : undefined;
  return (
    <Link
      href={`/pool/${poolId}`}
      className="group block rounded-2xl border border-[#26262a] bg-[#0d0d0f] p-4 transition-colors duration-200 hover:border-[#3a3a3e] hover:bg-[#121214]"
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
              {type}
            </span>
            {asset && (
              <span className="px-2 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
                {asset}
              </span>
            )}
            {chain && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1a1a1a] px-2 py-1 text-[11px] text-[#aaa]">
                {chain.logo && (
                  <Image
                    src={chain.logo}
                    alt={chain.shortName}
                    width={13}
                    height={13}
                    className="rounded-full"
                  />
                )}
                {chain.shortName}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 sm:ml-4 sm:text-right">
          <p className="break-words text-xl font-semibold tabular-nums text-white">{tvl}</p>
          <p className="text-[10px] uppercase tracking-wider text-[#555]">TVL</p>
        </div>
      </div>
      <h3 className="mb-1 text-[14px] font-medium text-white">{name}</h3>
      {subtitle && (
        <p className="text-[12px] text-[#888] mb-2">{subtitle}</p>
      )}
      {tiers && tiers.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
          <span className="text-[11px] text-[#555]">Lock tiers</span>
          {tiers.map((t, i) => (
            <span key={i} className="text-[11px] text-[#888]">
              {t.duration} <span className="text-[#00c853]">{t.rate}</span>
            </span>
          ))}
        </div>
      )}
      <div className="mb-2 flex flex-col gap-1 text-[11px] text-[#888] sm:flex-row sm:justify-between">
        <span>{info}</span>
        <span>{right}</span>
      </div>
      {(minInvestment || currency) && (
        <div className="mb-3 flex flex-col gap-1 text-[11px] text-[#666] sm:flex-row sm:justify-between">
          {minInvestment && <span>Min: {parseFloat(minInvestment).toLocaleString()}</span>}
          {currency && <span>Currency: {currency}</span>}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-[10px] text-[#555] border border-[#1a1a1a] rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-[11px] text-[#888] group-hover:text-[#00c853]">{link}</span>
      </div>
    </Link>
  );
}
