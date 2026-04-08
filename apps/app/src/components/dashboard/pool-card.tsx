"use client";

import Link from "next/link";

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
  tiers,
}: PoolCardProps) {
  return (
    <Link
      href={`/pool/${poolId}`}
      className="group block rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 transition-colors duration-200 hover:bg-[#0a0a0a] hover:border-[#00c853]/20"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex gap-2 mb-2">
            <span className="px-2 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
              {type}
            </span>
            {asset && (
              <span className="px-2 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
                {asset}
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="text-xl font-semibold text-[#00c853]">{tvl}</p>
        </div>
      </div>
      <h3 className="text-[14px] font-medium text-white mb-1">{name}</h3>
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
      <div className="flex justify-between text-[11px] text-[#888] mb-2">
        <span>{info}</span>
        <span>{right}</span>
      </div>
      {(minInvestment || currency) && (
        <div className="flex justify-between text-[11px] text-[#666] mb-3">
          {minInvestment && <span>Min: {parseFloat(minInvestment).toLocaleString()}</span>}
          {currency && <span>Currency: {currency}</span>}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
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
