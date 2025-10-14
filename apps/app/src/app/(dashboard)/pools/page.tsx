"use client";

import { useState, useMemo } from "react";
import { PoolCard } from "@/components/pools/pool-card";
import { useUser } from "@clerk/nextjs";
import { useAccount } from "wagmi";
import { KYCModal } from "@/components/kyc/kyc-modal";
import {
  PoolFiltersComponent,
  PoolFilters,
} from "@/components/pools/pool-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Loader2,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";

type EnhancedPool = Doc<"pools"> & {
  totalRaisedNumeric: number;
  targetRaiseNumeric: number;
  couponRatesNumeric: number[];
  progressPercentage: number;
  expectedAPY: number;
  poolWeight: number;
  isActivePool: boolean;
};

export default function PoolsPage() {
  const { isSignedIn } = useUser();
  const { address: walletAddress } = useAccount();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [filters, setFilters] = useState<PoolFilters>({
    search: "",
    status: "all",
    instrumentType: "all",
    riskLevel: "all",
    minAPY: "",
    maxAPY: "",
  });

  const pools = useQuery(api.pools.getAllPoolsWithComputed, {}) as
    | EnhancedPool[]
    | undefined;
  const isLoading = pools === undefined;

  const kycStatus = useQuery(
    api.kyc.getUserKycStatus,
    isSignedIn && walletAddress ? { walletAddress } : "skip"
  );

  const filteredPools = useMemo(() => {
    if (!pools) return [];

    return pools.filter((pool: EnhancedPool) => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !pool.name.toLowerCase().includes(searchTerm) &&
          !pool.issuer.toLowerCase().includes(searchTerm) &&
          !pool.description?.toLowerCase().includes(searchTerm)
        ) {
          return false;
        }
      }

      if (filters.status !== "all" && pool.status !== String(filters.status)) {
        return false;
      }

      if (
        filters.instrumentType !== "all" &&
        pool.instrumentType !== String(filters.instrumentType)
      ) {
        return false;
      }

      if (
        filters.riskLevel !== "all" &&
        pool.riskLevel !== String(filters.riskLevel)
      ) {
        return false;
      }

      if (filters.minAPY && pool.expectedAPY < parseFloat(filters.minAPY)) {
        return false;
      }

      if (filters.maxAPY && pool.expectedAPY > parseFloat(filters.maxAPY)) {
        return false;
      }

      return true;
    });
  }, [pools, filters]);

  const totalTVL =
    pools?.reduce((sum, pool) => sum + pool.totalRaisedNumeric, 0) || 0;

  const activePoolsCount =
    pools?.filter((pool: EnhancedPool) => pool.isActivePool).length || 0;

  const totalPools = pools?.length || 0;

  const poolAPYs = pools?.map((pool: EnhancedPool) => pool.expectedAPY) || [];
  const weights = pools?.map((pool: EnhancedPool) => pool.poolWeight) || [];

  const weightedSum = poolAPYs.reduce(
    (sum, apy, i) => sum + apy * (weights[i] || 0),
    0
  );
  const weightTotal = weights.reduce((s, w) => s + w, 0);
  const averageAPY =
    weightTotal > 0
      ? weightedSum / weightTotal
      : poolAPYs.length
        ? poolAPYs.reduce((s, v) => s + v, 0) / poolAPYs.length
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

      {!isSignedIn && (
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
      )}

      {isSignedIn &&
        walletAddress &&
        (!kycStatus?.hasUser || kycStatus?.kycStatus !== "APPROVED") && (
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
        )}

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

      <PoolFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        activePoolsCount={filteredPools.length}
        totalPoolsCount={totalPools}
      />

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
          {filteredPools.map((pool: EnhancedPool) => (
            <PoolCard
              key={pool._id}
              pool={pool}
              userPosition={undefined}
              showInvestButton={true}
            />
          ))}
        </div>
      )}

      <KYCModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onKYCComplete={() => {
          setShowKYCModal(false);

          window.location.reload();
        }}
      />
    </div>
  );
}
