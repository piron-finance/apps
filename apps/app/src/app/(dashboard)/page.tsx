"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

const PROTOCOL_STATS = [
  {
    label: "Total Value Locked (TVL)",
    value: "$174.6M",
    subtitle: "Across all pools",
  },
  {
    label: "24h Net Flows",
    value: "+$2.4M",
    subtitle: "Deposits - Withdrawals",
  },
  {
    label: "Average APY",
    value: "5.2%",
    subtitle: "Weighted by TVL",
  },
  {
    label: "Active Pools",
    value: "7",
    subtitle: "Open to deposit",
  },
];

const STABLE_YIELD_POOLS = [
  {
    id: "1",
    name: "Piron Africa Markets Teasuries - CNGN",
    subtitle: "Onchain tokenized fund of treasuries across Africa",
    status: "Open",
    currentAPY: "5.2%",
    tvl: "$48.3M",
    assetType: "Treasury Bills",
    minimumInvestment: "$100",
    investorType: "Retail",
    tags: ["USDC", "SPV-managed", "Attestations"],
  },
  {
    id: "2",
    name: "Flexible Stable Yield - Ethereum",
    subtitle: "USDT/USDC diversified",
    status: "Open",
    currentAPY: "4.9%",
    tvl: "$63.7M",
    assetType: "Money Market",
    minimumInvestment: "$500",
    investorType: "Retail",
    tags: ["USDC", "USDT", "Multi-asset"],
  },
  {
    id: "3",
    name: "Stable Yield - Polygon",
    subtitle: "USDC with fast exits",
    status: "Open",
    currentAPY: "4.7%",
    tvl: "$18.9M",
    assetType: "Commercial Paper",
    minimumInvestment: "$250",
    investorType: "Retail",
    tags: ["USDC", "Polygon", "Fast"],
  },
];

const LOCKED_POOLS = [
  {
    id: "4",
    name: "Single-Asset T-Bill - Ethereum",
    subtitle: "USTs via SPV • 30-90d",
    status: "Open",
    projectedAPY: "5.6%",
    tvl: "$22.1M",
    assetType: "Treasury Bills",
    minimumInvestment: "$5,000",
    investorType: "Retail",
    lockDuration: "30-90d",
    tags: ["Ethereum", "KYC route", "Audited"],
  },
  {
    id: "5",
    name: "Treasury Repo Pool",
    subtitle: "Overnight repos • T+1",
    status: "Restricted",
    projectedAPY: "5.1%",
    tvl: "$88.0M",
    assetType: "Repo",
    minimumInvestment: "$50,000",
    investorType: "Institutional",
    lockDuration: "Overnight",
    tags: ["Repo", "T+1", "Institutional"],
  },
  {
    id: "6",
    name: "Short-Dated Credit Pool",
    subtitle: "IG CP and CDs • T+2",
    status: "Restricted",
    projectedAPY: "6.0%",
    tvl: "$41.5M",
    assetType: "Commercial Paper",
    minimumInvestment: "$100,000",
    investorType: "Institutional",
    lockDuration: "60-180d",
    tags: ["Credit", "IG", "T+2"],
  },
];

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("All networks");

  return (
    <div className="min-h-screen bg-black px-8 py-6 space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Piron Pools</h1>
          <p className="text-gray-400 mt-1">
            Discover tokenized assets across global money markets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["All networks", "Retail", "Institutional"].map((filter) => (
            <Button
              key={filter}
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={
                activeFilter === filter
                  ? "bg-[#1a3a2e] border-[#00c48c]/30 text-white hover:bg-[#1a3a2e]"
                  : "bg-[#0a0a0a] border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
              }
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PROTOCOL_STATS.map((stat) => (
          <Card
            key={stat.label}
            className="bg-[#070707] border-[#172020] rounded-3xl"
          >
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">{stat.subtitle}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* 
      <div className="relative max-w-md mb-16">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <Input
          placeholder="Search pools"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-600 h-11"
        />
      </div> */}

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Stable Yield Pools</h2>
            <p className="text-sm text-gray-500 mt-1">
              Flexible liquidity pools with daily accrual and T+0/T+1 exits.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#00c48c] hover:text-[#00d49a] hover:bg-white/5"
          >
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {STABLE_YIELD_POOLS.map((pool) => (
            <Link key={pool.id} href={`/pools/${pool.id}`}>
              <Card className="bg-[#050505] hover:bg-[#080808] border-[#172020] hover:border-[#00c48c]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00c48c]/10 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#052317] flex-shrink-0">
                        {" "}
                        <Image
                          src="/pironLogo.png"
                          alt="Piron"
                          width={48}
                          height={48}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white leading-tight">
                          {pool.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {pool.subtitle}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-[#00c48c]/20 text-[#00c48c] border-0 text-xs">
                      {pool.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Current APY
                      </div>
                      <div className="text-xl font-bold text-white">
                        {pool.currentAPY}
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">TVL</div>
                      <div className="text-xl font-bold text-white">
                        {pool.tvl}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Asset Type
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {pool.assetType}
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Minimum</div>
                      <div className="text-sm font-semibold text-white">
                        {pool.minimumInvestment}
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Investor Type
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {pool.investorType}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {pool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Locked Pools</h2>
            <p className="text-sm text-gray-500 mt-1">
              Term-based exposures with redemptions at maturity.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#00c48c] hover:text-[#00d49a] hover:bg-white/5"
          >
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {LOCKED_POOLS.map((pool) => (
            <Link key={pool.id} href={`/pools/${pool.id}`}>
              <Card className="bg-[#050505] hover:bg-[#080808] border-[#172020] hover:border-[#00c48c]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00c48c]/10 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white leading-tight">
                          {pool.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {pool.subtitle}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        pool.status === "Open"
                          ? "bg-[#00c48c]/20 text-[#00c48c] border-0 text-xs"
                          : "bg-gray-800/50 text-gray-500 border-0 text-xs"
                      }
                    >
                      {pool.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Projected APY
                      </div>
                      <div className="text-xl font-bold text-white">
                        {pool.projectedAPY}
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">TVL</div>
                      <div className="text-xl font-bold text-white">
                        {pool.tvl}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Asset Type
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {pool.assetType}
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Minimum</div>
                      <div className="text-sm font-semibold text-white">
                        {pool.minimumInvestment}
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Investor Type
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {pool.investorType}
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">
                        Lock Duration
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {pool.lockDuration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {pool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center pt-12 pb-6">
        <div className="flex items-center gap-8 text-sm text-gray-600">
          <span>© Piron Finance</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
        </div>
      </div>
    </div>
  );
}
