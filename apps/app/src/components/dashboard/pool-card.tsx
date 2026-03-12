"use client";

import Link from "next/link";

interface PoolCardProps {
  type: string;
  asset: string;
  name: string;
  apyLabel: string;
  apy: string;
  info: string;
  right: string;
  tags: string[];
  link: string;
  minInvestment?: string;
  currency?: string;
  poolId?: string;
}

export function PoolCard({
  type,
  asset,
  name,
  apyLabel,
  apy,
  info,
  right,
  tags,
  link,
  minInvestment,
  currency,
  poolId = "demo",
}: PoolCardProps) {
  return (
    <Link
      href={`/pool/${poolId}`}
      className="group block rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 transition-colors duration-200 hover:bg-[#0a0a0a] hover:border-[#00c853]/20"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2">
          <span className="px-2 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
            {type}
          </span>
          <span className="px-2 py-1 text-[11px] text-[#888] border border-[#1a1a1a] rounded-lg">
            {asset}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#666]">{apyLabel}</p>
          <p className="text-xl font-semibold text-[#00c853]">{apy}</p>
        </div>
      </div>
      <h3 className="text-[14px] font-medium text-white mb-2">{name}</h3>
      <div className="flex justify-between text-[11px] text-[#888] mb-2">
        <span>{info}</span>
        <span>{right}</span>
      </div>
      {(minInvestment || currency) && (
        <div className="flex justify-between text-[11px] text-[#666] mb-3">
          {minInvestment && <span>Min: {minInvestment}</span>}
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
