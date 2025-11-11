"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Share, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  usePoolData,
  usePoolAnalytics,
  usePoolNavHistory,
} from "@/hooks/usePoolsData";
import { useUserPositionInPool } from "@/hooks/useUserData";

export default function PoolDetailPage() {
  const params = useParams();
  const poolId = params.id as string;

  // Fetch pool data
  const { data: pool, isLoading: poolLoading } = usePoolData(poolId);
  const { data: analytics, isLoading: analyticsLoading } =
    usePoolAnalytics(poolId);
  const { data: navHistory, isLoading: navLoading } = usePoolNavHistory(
    poolId,
    "30d",
    "daily"
  );

  // TODO: Replace with actual user ID from auth
  const userId = "user-id-placeholder";
  const { data: userPosition } = useUserPositionInPool(userId, poolId);

  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [depositAmount, setDepositAmount] = useState("");

  const isLoading = poolLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00c48c] mx-auto mb-4" />
          <p className="text-gray-400">Loading pool details...</p>
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Pool not found</p>
          <Link href="/pools">
            <Button className="mt-4">Back to Pools</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-white transition-colors">
          Pools
        </Link>
        <span>›</span>
        <span className="text-white">{pool.name}</span>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1b1305] flex items-center justify-center overflow-hidden">
            <Image
              src="/pironLogo.png"
              alt="Pool"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{pool.name}</h1>
            <p className="text-gray-400 mt-1">
              {pool.assetSymbol} •{" "}
              {pool.poolType === "STABLE_YIELD"
                ? "Flexible Liquidity"
                : "Fixed Term"}
            </p>
          </div>
          <Badge className="bg-[#00c48c]/20 text-[#00c48c] border-0 ml-4">
            {pool.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-transparent border-white/10 text-white hover:bg-white/5"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border-white/10 text-white hover:bg-white/5"
          >
            <FileText className="w-4 h-4 mr-2" />
            Docs
          </Button>
          <Button className="bg-[#00c48c] hover:bg-[#00d49a] text-black font-semibold px-6">
            Deposit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
        {/* Left Column - Performance & Holdings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Section */}
          <Card className="bg-[#050505] border-[#172020]  ">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-end border-b border-[#1f2a2a] pb-4 w-full">
                <div className="flex items-center justify-end gap-2">
                  {["1M", "3M", "1Y", "All"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedTimeframe === tf
                          ? "bg-[#1a3a2e] text-white"
                          : "bg-transparent text-gray-400 hover:text-white"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-[#070707] border-white/5">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      Current APY
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {pool.analytics?.apy
                        ? `${Number(pool.analytics.apy).toFixed(2)}%`
                        : pool.discountRate
                          ? `${Number(pool.discountRate).toFixed(2)}%`
                          : "N/A"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-white/5">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">TVL</div>
                    <div className="text-2xl font-bold text-white">
                      {pool.analytics?.totalValueLocked
                        ? `$${(parseFloat(pool.analytics.totalValueLocked) / 1000000).toFixed(2)}M`
                        : "$0"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-white/5">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      Unique Investors
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {pool.analytics?.uniqueInvestors || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full h-64 bg-black/40 border border-white/5 rounded-lg flex items-center justify-center">
                <span className="text-gray-600">Performance Chart</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-[#1f2a2a]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Asset</span>
                  <span className="text-white font-medium">
                    {pool.assetSymbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Min Investment</span>
                  <span className="text-white font-medium">
                    ${parseFloat(pool.minInvestment).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pool Type</span>
                  <span className="text-white font-medium">
                    {pool.poolType === "STABLE_YIELD"
                      ? "Stable Yield"
                      : "Single Asset"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Region</span>
                  <span className="text-white font-medium">
                    {pool.region || pool.country || "Global"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#050505] border-[#172020]">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl text-white font-bold">
                  Holdings & Activity
                </h2>
                <span className="text-sm text-gray-500">Your position</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-[#070707] border-[#1f2a2a] ">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      Your Balance
                    </div>
                    <div className="text-xl font-bold text-white">
                      {userPosition?.totalShares
                        ? `${parseFloat(userPosition.totalShares).toFixed(2)} ${pool.assetSymbol}`
                        : `0.00 ${pool.assetSymbol}`}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-[#1f2a2a] ">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      Position Value
                    </div>
                    <div className="text-xl font-bold text-white">
                      {userPosition?.currentValue
                        ? `$${parseFloat(userPosition.currentValue).toFixed(2)}`
                        : "$0.00"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-[#1f2a2a] ">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      Share Price (NAV)
                    </div>
                    <div className="text-xl font-bold text-white">
                      {pool.analytics?.navPerShare
                        ? `$${parseFloat(pool.analytics.navPerShare).toFixed(4)}`
                        : "$1.0000"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-500 pb-2 border-b border-white/5">
                  <div>Time</div>
                  <div>Type</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                {userPosition ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Transaction history coming soon</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No position in this pool yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#070707] border-[#172020]">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl text-white font-bold">About this Pool</h2>

              <div className="space-y-3">
                <p className="text-gray-300">
                  {pool.description || "No description available."}
                </p>

                <div className="grid grid-cols-2 gap-y-4 text-sm pt-4">
                  <div className="flex justify-between pr-8">
                    <span className="text-gray-500">Pool Type</span>
                    <span className="text-white font-medium">
                      {pool.poolType === "STABLE_YIELD"
                        ? "Stable Yield"
                        : "Single Asset"}
                    </span>
                  </div>
                  <div className="flex justify-between pr-8">
                    <span className="text-gray-500">Security Type</span>
                    <span className="text-white font-medium">
                      {pool.securityType || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pr-8">
                    <span className="text-gray-500">Risk Rating</span>
                    <span className="text-white font-medium">
                      {pool.riskRating || "Not rated"}
                    </span>
                  </div>
                  <div className="flex justify-between pr-8">
                    <span className="text-gray-500">Issuer</span>
                    <span className="text-white font-medium">
                      {pool.issuer || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between pr-8">
                    <span className="text-gray-500">Region</span>
                    <span className="text-white font-medium">
                      {pool.region || pool.country || "Global"}
                    </span>
                  </div>
                  {pool.maturityDate && (
                    <div className="flex justify-between pr-8">
                      <span className="text-gray-500">Maturity Date</span>
                      <span className="text-white font-medium">
                        {new Date(pool.maturityDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/10 text-white hover:bg-white/5"
                >
                  Factsheet
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-white/10 text-white hover:bg-white/5"
                >
                  KYC requirements
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-white/10 text-white hover:bg-white/5"
                >
                  Contracts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-[#070707] border-[#172020] sticky top-8">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl text-white font-bold">Invest</h2>
                <span className="text-sm text-gray-500">
                  {pool.poolType === "STABLE_YIELD"
                    ? "Flexible exits"
                    : "Fixed term"}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">
                    Amount
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-black/40 border-white/10 text-white text-right pr-20 h-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {pool.assetSymbol}
                    </span>
                  </div>
                </div>

                {pool.analytics?.apy && depositAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Est. daily yield</span>
                    <span className="text-white">
                      $
                      {(
                        (parseFloat(depositAmount) *
                          parseFloat(pool.analytics.apy)) /
                        365 /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Chain ID</span>
                  <span className="text-white">{pool.chainId}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min deposit</span>
                  <span className="text-white">
                    ${parseFloat(pool.minInvestment).toFixed(0)}
                  </span>
                </div>

                <div className="flex justify-between text-sm pb-4 border-b border-white/5">
                  <span className="text-gray-500">Pool Address</span>
                  <span className="text-white text-xs">
                    {pool.poolAddress.slice(0, 6)}...
                    {pool.poolAddress.slice(-4)}
                  </span>
                </div>

                {/* Warning Banner */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-sm text-yellow-500">
                    Ensure wallet is on Chain ID {pool.chainId} to deposit to
                    this pool.
                  </p>
                </div>

                <Button className="w-full bg-[#00c48c] hover:bg-[#00d49a] text-black font-semibold h-12">
                  Deposit
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 h-12"
                >
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center pt-12 pb-6 border-t border-white/5">
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
