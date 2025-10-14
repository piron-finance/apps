"use client";

import { useUser } from "@clerk/nextjs";
import { useAccount } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectButton } from "@/lib/connect-button";
import {
  PieChart,
  Target,
  User,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

import {
  formatCurrency,
  formatPercentage,
  formatDate,
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

export default function PortfolioPage() {
  const { isSignedIn, user } = useUser();
  const { isConnected } = useAccount();

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
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Sign in to view your portfolio
          </h2>
          <p className="text-slate-400 mb-6">
            Create your free account to track your investments, view returns,
            and manage your portfolio.
          </p>
          <div className="flex gap-3 justify-center">
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
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <PieChart className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to view your investment portfolio and track your
            positions.
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  const userInvestedPools =
    Array.isArray(userTransactions) && pools
      ? pools.filter((pool) =>
          userTransactions.some(
            (tx: Doc<"transactions">) =>
              tx.poolId === pool._id && tx.type === "DEPOSIT"
          )
        )
      : [];

  const totalInvested = Array.isArray(userTransactions)
    ? userTransactions
        .filter((tx: Doc<"transactions">) => tx.type === "DEPOSIT")
        .reduce(
          (sum, tx: Doc<"transactions">) => sum + parseFloat(tx.amount || "0"),
          0
        )
    : 0;

  const totalWithdrawn = Array.isArray(userTransactions)
    ? userTransactions
        .filter((tx: Doc<"transactions">) => tx.type === "WITHDRAW")
        .reduce(
          (sum, tx: Doc<"transactions">) => sum + parseFloat(tx.amount || "0"),
          0
        )
    : 0;

  const netInvested = totalInvested - totalWithdrawn;
  const activePositions = userInvestedPools.filter(
    (pool) =>
      pool.status === "FUNDING" ||
      pool.status === "PENDING_INVESTMENT" ||
      pool.status === "INVESTED"
  ).length;
  const maturedPositions = userInvestedPools.filter(
    (pool) => pool.status === "MATURED"
  ).length;

  if (
    !Array.isArray(userTransactions) ||
    userTransactions.length === 0 ||
    userInvestedPools.length === 0
  ) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <PieChart className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Your Portfolio is Empty
          </h2>
          <p className="text-slate-400 mb-6">
            You haven&apos;t invested in any pools yet. Complete your KYC
            verification to start investing in tokenized securities.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => (window.location.href = "/pools")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Target className="w-4 h-4 mr-2" />
              Browse Investment Pools
            </Button>
            <p className="text-xs text-slate-500">
              KYC verification will be required before your first investment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Portfolio</h1>
          <p className="text-slate-400 mt-1">
            Track your investments and monitor performance
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Link href="/pools">
            <Target className="w-4 h-4 mr-2" />
            Find More Pools
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Invested
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(netInvested)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Net investment amount</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Current Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(netInvested)}
            </div>
            <p className="text-xs text-green-400 mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {formatPercentage(0)} total return
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Active Positions
            </CardTitle>
            <PieChart className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activePositions}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {maturedPositions} matured
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Pools
            </CardTitle>
            <Target className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {userInvestedPools.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Investment positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Holdings */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Your Holdings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userInvestedPools.map((pool) => {
            const userDeposits = Array.isArray(userTransactions)
              ? userTransactions
                  .filter(
                    (tx: Doc<"transactions">) =>
                      tx.poolId === pool._id && tx.type === "DEPOSIT"
                  )
                  .reduce(
                    (sum, tx: Doc<"transactions">) =>
                      sum + parseFloat(tx.amount || "0"),
                    0
                  )
              : 0;

            const userWithdrawals = Array.isArray(userTransactions)
              ? userTransactions
                  .filter(
                    (tx: Doc<"transactions">) =>
                      tx.poolId === pool._id && tx.type === "WITHDRAW"
                  )
                  .reduce(
                    (sum, tx: Doc<"transactions">) =>
                      sum + parseFloat(tx.amount || "0"),
                    0
                  )
              : 0;

            const netPosition = userDeposits - userWithdrawals;

            return (
              <div
                key={pool._id}
                className="p-6 bg-slate-800/50 rounded-lg border border-white/5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white text-lg">
                        {pool.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${getPoolStatusColor(pool.status)} text-xs`}
                      >
                        {getPoolStatusLabel(pool.status)}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{pool.issuer}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Your Position</span>
                        <p className="font-semibold text-white">
                          {formatCurrency(netPosition)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Pool APY</span>
                        <p className="font-semibold text-green-400">
                          {formatPercentage(pool.expectedAPY / 100)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Maturity</span>
                        <p className="font-semibold text-white">
                          {formatDate(pool.maturityDate * 1000)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Risk Level</span>
                        <p className="font-semibold text-yellow-400">
                          {pool.riskLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/pools/${pool._id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
