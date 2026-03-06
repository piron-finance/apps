"use client";

import { useState } from "react";
import { usePlatformMetrics } from "@/hooks/usePlatformData";
import { usePoolsData } from "@/hooks/usePoolsData";
import {
  StatCard,
  PoolCard,
  PoolSection,
  Sidebar,
} from "@/components/dashboard";

export default function DashboardPage() {
  const [activeTenor, setActiveTenor] = useState("All");
  const [activeDuration, setActiveDuration] = useState("All");

  const { data: metrics } = usePlatformMetrics();
  const { data: poolsData } = usePoolsData();

  return (
    <div className="min-h-screen bg-black p-4">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard label="TOTAL VALUE LOCKED" value="$45.2M" badge="+4.1%" />
        <StatCard
          label="LIVE POOLS"
          value="18"
          subtitle="6 Stable · 7 Locked · 5 Single"
        />
        <StatCard
          label="BLENDED APY"
          value="7.9%"
          subtitle="TVL-weighted, net of fees"
        />
        <StatCard
          label="24H FLOW"
          value="$2.4M"
          subtitle="$1.8M in · $0.6M out"
        />
      </div>

      <div className="flex gap-4">
        {/* Main Content */}
        <div className="w-[68%] space-y-4">
          {/* Stable Yield Pools */}
          <PoolSection
            label="STABLE YIELD"
            title="Withdraw anytime. Earn daily."
            subtitle="NAV-priced pools holding T-bills and money market paper. Your capital works from day one."
            filters={
              <div className="flex gap-2">
                {["USDC", "USDT", "DAI", "CNGN"].map((c) => (
                  <button
                    key={c}
                    className="px-3 py-1 text-[11px] text-[#666] border border-[#1a1a1a] rounded-lg hover:text-[#888] hover:border-[#333] transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-4 mt-5">
              <PoolCard
                type="Stable Yield"
                asset="USDC"
                name="Global T-Bill Basket"
                apyLabel="Live APY"
                apy="7.4%"
                info="$18.2M TVL · 92% at work"
                right="7d min hold"
                tags={["Daily NAV", "US + EU sovereigns"]}
                link="Enter pool →"
                minInvestment="$100"
                currency="USDC"
              />
              <PoolCard
                type="Stable Yield"
                asset="USDT"
                name="EM Cash Composite"
                apyLabel="Live APY"
                apy="8.3%"
                info="$9.6M TVL · 71% at work"
                right="10d min hold"
                tags={["Multi-FX", "Hedged exposure"]}
                link="Enter pool →"
                minInvestment="$50"
                currency="USDT"
              />
              <PoolCard
                type="Stable Yield"
                asset="DAI"
                name="DeFi Treasury Blend"
                apyLabel="Live APY"
                apy="6.1%"
                info="$5.3M TVL · 54% at work"
                right="7d min hold"
                tags={["DAO treasuries", "Sub-90d paper"]}
                link="Enter pool →"
                minInvestment="$100"
                currency="DAI"
              />
              <PoolCard
                type="Stable Yield"
                asset="CNGN"
                name="Nigeria Money Market"
                apyLabel="Live APY"
                apy="11.2%"
                info="₦1.8B TVL · 63% at work"
                right="14d min hold"
                tags={["NTBs + CP", "Naira-settled"]}
                link="Enter pool →"
                minInvestment="₦50,000"
                currency="CNGN"
              />
            </div>
          </PoolSection>

          {/* Locked Pools */}
          <PoolSection
            label="LOCKED"
            title="Lock your rate. Skip the volatility."
            subtitle="Fixed-term deposits with guaranteed APY. Choose when you receive interest. Early exit costs you."
            filters={
              <div className="flex gap-2">
                {["All", "90d", "180d", "365d"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDuration(d)}
                    className={`px-3 py-1 text-[11px] border border-[#1a1a1a] rounded-lg transition-colors ${
                      activeDuration === d
                        ? "text-white border-[#333]"
                        : "text-[#666] hover:text-[#888]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-4 mt-5">
              <PoolCard
                type="Locked"
                asset="USDC · 90d"
                name="Q1 Structured Note"
                apyLabel="Locked APY"
                apy="5.8%"
                info="$3.1M committed · 12d to close"
                right="Interest upfront or at end"
                tags={["10% early exit cost"]}
                link="Review terms →"
                minInvestment="$500"
                currency="USDC"
              />
              <PoolCard
                type="Locked"
                asset="USDT · 180d"
                name="H1 Fixed Income Strip"
                apyLabel="Locked APY"
                apy="7.1%"
                info="$6.4M committed · 4d to close"
                right="15% penalty if you break"
                tags={["Auto-roll on maturity"]}
                link="Review terms →"
                minInvestment="$500"
                currency="USDT"
              />
            </div>
          </PoolSection>

          {/* Single-Asset Pools */}
          <PoolSection
            label="SINGLE ASSET"
            title="One deal. Full visibility."
            subtitle="Finance a specific receivable or credit facility. SPV-wrapped with documents on-chain."
          >
            <div className="grid grid-cols-2 gap-4 mt-5">
              <PoolCard
                type="Single Asset"
                asset="DAI"
                name="Lagos Receivables I"
                apyLabel="Target APY"
                apy="11.4%"
                info="$2.1M of $4M filled"
                right="60d tenor"
                tags={["Invoice-backed", "Full SPV docs"]}
                link="View deal memo →"
                minInvestment="$1,000"
                currency="DAI"
              />
            </div>
          </PoolSection>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
