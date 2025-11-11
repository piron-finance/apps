"use client";

import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { usePoolsData } from "@/hooks/usePoolsData";
import { usePlatformMetrics } from "@/hooks/usePlatformData";
import type { Pool } from "@/lib/api/types";
import Image from "next/image";

interface LocalPoolFilters {
  search: string;
  status: string;
  poolType: string;
  riskLevel: string;
  minAPY: string;
  maxAPY: string;
}

export default function PoolsPage() {
  const { address: walletAddress } = useAccount();
  const [filters, setFilters] = useState<LocalPoolFilters>({
    search: "",
    status: "all",
    poolType: "all",
    riskLevel: "all",
    minAPY: "",
    maxAPY: "",
  });

  // Fetch data from NestJS backend
  const { data: poolsResponse, isLoading: poolsLoading } = usePoolsData();
  const { data: metrics, isLoading: metricsLoading } = usePlatformMetrics();

  const pools = poolsResponse?.data || [];
  const isLoading = poolsLoading;

  const filteredPools = useMemo(() => {
    if (!pools) return [];

    return pools.filter((pool: Pool) => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !pool.name.toLowerCase().includes(searchTerm) &&
          !(pool.issuer?.toLowerCase() || "").includes(searchTerm) &&
          !(pool.description?.toLowerCase() || "").includes(searchTerm)
        ) {
          return false;
        }
      }

      if (filters.status !== "all" && pool.status !== filters.status) {
        return false;
      }

      if (filters.poolType !== "all" && pool.poolType !== filters.poolType) {
        return false;
      }

      if (
        filters.riskLevel !== "all" &&
        pool.riskRating !== filters.riskLevel
      ) {
        return false;
      }

      const apy = pool.analytics?.apy ? parseFloat(pool.analytics.apy) : 0;
      if (filters.minAPY && apy < parseFloat(filters.minAPY)) {
        return false;
      }

      if (filters.maxAPY && apy > parseFloat(filters.maxAPY)) {
        return false;
      }

      return true;
    });
  }, [pools, filters]);

  const totalTVL = metrics?.totalValueLocked
    ? parseFloat(metrics.totalValueLocked)
    : 0;

  const activePoolsCount = metrics?.activePools || 0;

  const totalPools = metrics?.totalPools || pools.length || 0;

  const averageAPY = metrics?.averageAPY
    ? parseFloat(metrics.averageAPY.toString())
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Investment Pools</h1>
          <p className="text-slate-400 mt-1">
            Discover and invest in tokenized money market securities
          </p>
        </div>
      </div>

      {/* {false && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-white mb-1">
                Ready to start investing? Create your free account! ✨
              </h3>
              <p className="text-slate-300 text-sm">
                Join thousands of investors accessing exclusive tokenized
                securities. Sign up takes less than 30 seconds.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Sign Up Free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )} */}

      {/* {isSignedIn && walletAddress && kycStatus?.kycStatus !== "APPROVED" && (
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-white mb-1">
                Almost there! Complete your verification 🚀
              </h3>
              <p className="text-slate-300 text-sm">
                Quick 2-minute identity verification unlocks access to all
                investment opportunities. Your account is ready!
              </p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">Step 2 of 2</div>
                <div className="w-16 bg-slate-700 rounded-full h-2 mb-2">
                  <div className="w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"></div>
                </div>
                <div className="text-xs text-slate-300">50% Complete</div>
              </div>
              <Button
                onClick={() => setShowKYCModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Complete KYC
              </Button>
            </div>
          </div>
        </div>
      )} */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Value Locked
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-slate-400">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(totalTVL.toString())}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Across {totalPools} pools
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Active Pools
            </CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-slate-400">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {activePoolsCount}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {totalPools - activePoolsCount} completed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Average APY
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span className="text-slate-400">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {formatPercentage(averageAPY)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Expected returns</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search pools..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-400"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="CLOSED">Closed</option>
              <option value="MATURED">Matured</option>
            </select>
            <select
              value={filters.poolType}
              onChange={(e) =>
                setFilters({ ...filters, poolType: e.target.value })
              }
              className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Types</option>
              <option value="STABLE_YIELD">Stable Yield</option>
              <option value="SINGLE_ASSET">Single Asset</option>
            </select>
            <input
              type="number"
              placeholder="Min APY %"
              value={filters.minAPY}
              onChange={(e) =>
                setFilters({ ...filters, minAPY: e.target.value })
              }
              className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-400"
            />
            <input
              type="number"
              placeholder="Max APY %"
              value={filters.maxAPY}
              onChange={(e) =>
                setFilters({ ...filters, maxAPY: e.target.value })
              }
              className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-400"
            />
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Showing {filteredPools.length} of {totalPools} pools
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Loading Pools...
            </h3>
            <p className="text-slate-400 text-center">
              Fetching pool data from database
            </p>
          </CardContent>
        </Card>
      ) : filteredPools.length === 0 ? (
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No pools found
            </h3>
            <p className="text-slate-400 text-center">
              {pools?.length === 0
                ? "No pools have been created yet."
                : "Try adjusting your filters or search criteria to find investment opportunities."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPools.map((pool: Pool) => (
            <Link key={pool.id} href={`/pools/${pool.id}`}>
              <Card className="bg-slate-900/50 hover:bg-slate-900/70 border-white/10 hover:border-[#00c48c]/30 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden">
                        <Image
                          src="/pironLogo.png"
                          alt={pool.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">
                          {pool.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {pool.assetSymbol}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        pool.status === "ACTIVE"
                          ? "bg-[#00c48c]/20 text-[#00c48c]"
                          : "bg-gray-500/20 text-gray-400"
                      } border-0 text-xs`}
                    >
                      {pool.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">APY</div>
                      <div className="text-lg font-bold text-white">
                        {pool.analytics?.apy
                          ? `${Number(pool.analytics.apy).toFixed(2)}%`
                          : pool.discountRate
                            ? `${Number(pool.discountRate).toFixed(2)}%`
                            : "N/A"}
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">TVL</div>
                      <div className="text-lg font-bold text-white">
                        {pool.analytics?.totalValueLocked
                          ? `$${(parseFloat(pool.analytics.totalValueLocked) / 1000000).toFixed(1)}M`
                          : "$0"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center text-sm">
                    <span className="text-gray-500">Min Investment</span>
                    <span className="text-white font-medium">
                      ${parseFloat(pool.minInvestment).toFixed(0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
