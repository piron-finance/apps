"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { usePlatformMetrics } from "@/hooks/usePlatformData";
import { usePoolsData } from "@/hooks/usePoolsData";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("All networks");

  const { data: metrics, isLoading: metricsLoading } = usePlatformMetrics();

  const { data: poolsData, isLoading: poolsLoading } = usePoolsData();

  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 lg:space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Piron Pools
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Discover tokenized assets across global money markets.
          </p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {["All networks"].map((filter) => (
            <Button
              key={filter}
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={`flex-shrink-0 ${
                activeFilter === filter
                  ? "bg-[#1a3a2e] border-[#00c48c]/30 text-white hover:bg-[#1a3a2e]"
                  : "bg-[#0a0a0a] border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {metricsLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[#070707] border-[#1f2a2a] rounded-3xl">
              <CardContent className="p-4 flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="bg-[#070707] border-[#1f2a2a] rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">
                  Total Value Locked (TVL)
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {metrics?.totalValueLockedFormatted || "$0"}
                </div>
                <div className="text-xs text-gray-600">Across all pools</div>
              </CardContent>
            </Card>

            <Card className="bg-[#070707] border-[#1f2a2a] rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">
                  24h Net Flows
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {metrics?.netFlows24h
                    ? `$${(parseFloat(metrics.netFlows24h) / 1000000).toFixed(1)}M`
                    : "$0"}
                </div>
                <div className="text-xs text-gray-600">
                  Deposits - Withdrawals
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#070707] border-[#1f2a2a] rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">
                  Average APY
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {metrics?.averageAPY
                    ? `${Number(metrics.averageAPY).toFixed(1)}%`
                    : "0%"}
                </div>
                <div className="text-xs text-gray-600">Weighted by TVL</div>
              </CardContent>
            </Card>

            <Card className="bg-[#070707] border-[#1f2a2a] rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">
                  Active Pools
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {metrics?.activePools || 0}
                </div>
                <div className="text-xs text-gray-600">Open to deposit</div>
              </CardContent>
            </Card>
          </>
        )}
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

      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Stable Yield Pools
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Flexible liquidity pools with daily accrual and T+0/T+1 exits.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#00c48c] hover:text-[#00d49a] hover:bg-white/5 self-start sm:self-auto"
          >
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {poolsLoading
            ? // Loading state
              [...Array(3)].map((_, i) => (
                <Card key={i} className="bg-[#050505] border-[#1f2a2a]">
                  <CardContent className="p-6 flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                  </CardContent>
                </Card>
              ))
            : poolsData?.data
                ?.filter((pool) => pool.poolType === "STABLE_YIELD")
                .map((pool) => (
                  <Link key={pool.id} href={`/pools/${pool.poolAddress}`}>
                    <Card className="bg-[#050505] hover:bg-[#080808] border-[#1f2a2a] hover:border-[#00c48c]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00c48c]/10 hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6 space-y-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#052317] flex-shrink-0 overflow-hidden">
                              <Image
                                src="/pironLogo.png"
                                alt={pool.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-white leading-tight">
                                {pool.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {pool.description}
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
                              {pool.analytics?.apy
                                ? `${Number(pool.analytics.apy).toFixed(1)}%`
                                : "N/A"}
                            </div>
                          </div>
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              TVL
                            </div>
                            <div className="text-xl font-bold text-white">
                              {pool.analytics?.totalValueLocked
                                ? `$${Number(pool.analytics.totalValueLocked).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Asset
                            </div>
                            <div className="text-sm font-semibold text-white">
                              {pool.assetSymbol}
                            </div>
                          </div>
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Minimum
                            </div>
                            <div className="text-sm font-semibold text-white">
                              ${parseFloat(pool.minInvestment).toFixed(0)}
                            </div>
                          </div>
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Rating
                            </div>
                            <div className="text-sm font-semibold text-white">
                              {pool.riskRating || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {pool.tags?.map((tag: string) => (
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Locked Pools
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Term-based exposures with redemptions at maturity.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#00c48c] hover:text-[#00d49a] hover:bg-white/5 self-start sm:self-auto"
          >
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {poolsLoading
            ? // Loading state
              [...Array(3)].map((_, i) => (
                <Card key={i} className="bg-[#050505] border-[#1f2a2a]">
                  <CardContent className="p-6 flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                  </CardContent>
                </Card>
              ))
            : poolsData?.data
                ?.filter((pool) => pool.poolType === "SINGLE_ASSET")
                .map((pool) => (
                  <Link key={pool.id} href={`/pools/${pool.poolAddress}`}>
                    <Card className="bg-[#050505] hover:bg-[#080808] border-[#1f2a2a] hover:border-[#00c48c]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00c48c]/10 hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6 space-y-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden">
                              <Image
                                src="/pironLogo.png"
                                alt={pool.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-white leading-tight">
                                {pool.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {pool.description}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              pool.isActive
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
                              {pool.analytics?.apy
                                ? `${Number(pool.analytics.apy).toFixed(1)}%`
                                : pool.discountRate
                                  ? `${Number(pool.discountRate).toFixed(1)}%`
                                  : "N/A"}
                            </div>
                          </div>
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              TVL
                            </div>
                            <div className="text-xl font-bold text-white">
                              {pool.analytics?.totalValueLocked
                                ? `$${Number(pool.analytics.totalValueLocked).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Asset
                            </div>
                            <div className="text-sm font-semibold text-white">
                              {pool.assetSymbol}
                            </div>
                          </div>
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Minimum
                            </div>
                            <div className="text-sm font-semibold text-white">
                              ${parseFloat(pool.minInvestment).toFixed(0)}
                            </div>
                          </div>
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Progress
                            </div>
                            <div className="text-sm font-semibold text-white">
                              {pool.analytics?.totalValueLocked &&
                              pool.targetRaise
                                ? `${Math.min(
                                    (Number(pool.analytics.totalValueLocked) /
                                      Number(pool.targetRaise)) *
                                      100,
                                    100
                                  ).toFixed(0)}%`
                                : "0%"}
                            </div>
                          </div>
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Maturity
                            </div>
                            <div className="text-sm font-semibold text-white">
                              {pool.maturityDate
                                ? new Date(
                                    pool.maturityDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {pool.tags?.map((tag: string) => (
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

      <div className="flex items-center justify-center pt-8 sm:pt-12 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600">
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
