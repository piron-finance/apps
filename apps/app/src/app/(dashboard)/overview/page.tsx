"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  Target,
  Users,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import {
  formatCurrency,
  formatPercentage,
  formatDateTime,
  getPoolStatusColor,
  getPoolStatusLabel,
} from "@/lib/utils";

type EnhancedPool = Doc<"pools"> & {
  totalRaisedNumeric: number;
  targetRaiseNumeric: number;
  couponRatesNumeric: number[];
  progressPercentage: number;
  expectedAPY: number;
  poolWeight: number;
  isActivePool: boolean;
};

export default function OverviewPage() {
  const { isSignedIn, user } = useUser();
  const pools = useQuery(api.pools.getAllPoolsWithComputed, {}) as
    | EnhancedPool[]
    | undefined;
  const dbUser = useQuery(
    api.users.getByClerkId,
    isSignedIn && user?.id ? { clerkId: user.id } : "skip"
  );
  const userTransactions = useQuery(
    api.transactions.getTransactionsByUser,
    dbUser?._id ? { userId: dbUser._id } : "skip"
  );

  if (!isSignedIn) {
    return (
      <div className="p-6">
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Sign in to view your dashboard
            </h3>
            <p className="text-slate-400 text-center mb-6 max-w-md">
              Create your free account to track investments, view returns, and
              access your portfolio dashboard.
            </p>
            <div className="flex gap-3">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Link href="/sign-up">Sign Up Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activePools = pools?.filter((p) => p.isActivePool) || [];
  const maturedPools = pools?.filter((p) => p.status === "MATURED") || [];
  const totalInvested =
    pools?.reduce((sum, p) => sum + p.totalRaisedNumeric, 0) || 0;

  const poolAPYs = activePools.map((p) => p.expectedAPY);
  const weights = activePools.map((p) => p.poolWeight);

  const weightedSum = poolAPYs.reduce(
    (sum, apy, i) => sum + apy * (weights[i] || 0),
    0
  );
  const weightTotal = weights.reduce((s, w) => s + w, 0);
  const avgAPY =
    weightTotal > 0
      ? weightedSum / weightTotal
      : poolAPYs.length
        ? poolAPYs.reduce((s, v) => s + v, 0) / poolAPYs.length
        : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">
            Track your investments and discover new opportunities
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Link href="/pools">
            <Plus className="w-4 h-4 mr-2" />
            Explore Pools
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Invested
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(totalInvested)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Across {activePools.length} active pools
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Average APY
            </CardTitle>
            <Target className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatPercentage(avgAPY)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Expected annual yield</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Active Positions
            </CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activePools.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {maturedPools.length} matured
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Featured Pools</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/pools" className="text-slate-400 hover:text-white">
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(pools || []).slice(0, 3).map((pool) => (
              <div
                key={pool._id}
                className="p-4 bg-slate-800/50 rounded-lg border border-white/5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{pool.name}</h3>
                    <p className="text-sm text-slate-400">{pool.issuer}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getPoolStatusColor(pool.status)} text-xs`}
                  >
                    {getPoolStatusLabel(pool.status)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">APY</span>
                    <p className="font-semibold text-green-400">
                      {formatPercentage(pool.expectedAPY)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Min Investment</span>
                    <p className="font-semibold text-white">
                      {formatCurrency(pool.minInvestment || "0")}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white">
                      {formatPercentage(pool.progressPercentage)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(pool.progressPercentage, 100)}
                    className="h-2 bg-slate-700/60"
                    indicatorClassName="from-cyan-400 to-blue-400"
                  />
                </div>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Link href={`/pools/${pool._id}`}>View Details</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(userTransactions) && userTransactions.length > 0 ? (
              userTransactions.slice(0, 5).map((tx: Doc<"transactions">) => {
                const pool = (pools || []).find((p) => p._id === tx.poolId);
                return (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === "DEPOSIT"
                            ? "bg-green-500/20 text-green-400"
                            : tx.type === "WITHDRAW"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {tx.type === "DEPOSIT" ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : tx.type === "WITHDRAW" ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <DollarSign className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white capitalize">
                          {tx.type.toLowerCase().replace("_", " ")} in{" "}
                          {pool?.name || "Unknown Pool"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-400">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
