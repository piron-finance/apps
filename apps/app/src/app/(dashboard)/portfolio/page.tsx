"use client";

import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api/endpoints";
import type { PortfolioSummary } from "@/lib/api/types";

export default function PortfolioPage() {
  const { address } = useAccount();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setPortfolio(null);
      return;
    }

    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await usersApi.getPositions(address);
        setPortfolio(data);
      } catch (err: any) {
        console.error("Error fetching portfolio:", err);
        setError(err?.response?.data?.message || "Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [address]);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getReturnColor = (returnValue: string) => {
    const num = parseFloat(returnValue);
    if (num > 0) return "text-[#00c48c]";
    if (num < 0) return "text-red-400";
    return "text-gray-500";
  };

  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            My Portfolio
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Track your investments and performance
          </p>
        </div>
      </div>

      {!address ? (
        <Card className="bg-[#070707] border-[#1f2a2a]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-slate-400 text-center mb-4">
              Connect your wallet to view your portfolio
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="bg-[#070707] border-[#1f2a2a]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00c48c] mb-4" />
            <p className="text-slate-400">Loading portfolio...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="bg-[#070707] border-[#1f2a2a]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-400 text-center mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#00c48c] hover:bg-[#00d49a] text-black"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-[#070707] border-[#1f2a2a] rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">
                  Total Portfolio Value
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {portfolio?.analytics?.totalValueFormatted ||
                    formatCurrency(portfolio?.analytics?.totalValue || "0")}
                </div>
                <div className="text-xs text-gray-600">
                  {formatCurrency(portfolio?.analytics?.totalDeposited || "0")}{" "}
                  deposited
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#070707] border-[#1f2a2a] rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">
                  Total Returns
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold mb-1 ${getReturnColor(portfolio?.analytics?.totalReturn || "0")}`}
                >
                  {formatCurrency(portfolio?.analytics?.totalReturn || "0")}
                </div>
                <div
                  className={`text-xs ${getReturnColor(portfolio?.analytics?.totalReturnPercentage || "0")}`}
                >
                  {portfolio?.analytics?.totalReturnPercentage || "0.00"}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#070707] border-[#1f2a2a] rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">
                  Active Positions
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {portfolio?.analytics?.activePositions || 0}
                </div>
                <div className="text-xs text-gray-600">Across pools</div>
              </CardContent>
            </Card>

            <Card className="bg-[#070707] border-[#1f2a2a] rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-500 mb-2">
                  Avg. APY
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {portfolio?.analytics?.averageAPY || "0.00"}%
                </div>
                <div className="text-xs text-gray-600">Weighted average</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#070707] border-[#1f2a2a] rounded-2xl sm:rounded-3xl">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-6">
                Your Positions
              </h2>
              {!portfolio?.positions?.length ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="mb-4">No positions yet</p>
                  <Link href="/pools">
                    <Button className="bg-[#00c48c] hover:bg-[#00d49a] text-black">
                      Explore Pools
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio.positions.map((position) => (
                    <div
                      key={position.id}
                      className="bg-[#050505] hover:bg-[#080808] rounded-lg p-4 sm:p-5 border border-[#1f2a2a] hover:border-[#00c48c]/30 transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-white font-semibold text-base">
                                {position.pool.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded">
                                  {position.pool.assetSymbol}
                                </span>
                                {position.pool.country && (
                                  <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded">
                                    {position.pool.country}
                                  </span>
                                )}
                                {position.pool.poolType && (
                                  <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded">
                                    {position.pool.poolType === "STABLE_YIELD"
                                      ? "Stable Yield"
                                      : "Single Asset"}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs bg-[#00c48c]/20 text-[#00c48c] border-0 px-2 py-1 rounded">
                              {position.pool.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">
                                Current Value
                              </div>
                              <div className="text-sm sm:text-base font-bold text-white">
                                {formatCurrency(position.currentValue)}
                              </div>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">
                                Deposited
                              </div>
                              <div className="text-sm sm:text-base font-bold text-white">
                                {formatCurrency(position.totalDeposited)}
                              </div>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">
                                Total Return
                              </div>
                              <div
                                className={`text-sm sm:text-base font-bold ${getReturnColor(position.totalReturn)}`}
                              >
                                {formatCurrency(position.totalReturn)}
                              </div>
                              <div
                                className={`text-xs ${getReturnColor(position.totalReturn)}`}
                              >
                                {position.totalReturnPercentage}%
                              </div>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">
                                APY
                              </div>
                              <div className="text-sm sm:text-base font-bold text-white">
                                {position.pool.apy || "0.00"}%
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            {position.daysHeld !== undefined && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Held for {position.daysHeld} days</span>
                              </div>
                            )}
                            {position.pool.maturityDate && (
                              <div className="flex items-center gap-1">
                                <span>
                                  Matures:{" "}
                                  {formatDate(position.pool.maturityDate)}
                                </span>
                              </div>
                            )}
                            {position.lastActivityDate && (
                              <div className="flex items-center gap-1">
                                <span>
                                  Last{" "}
                                  {position.lastActivityType?.toLowerCase()}:{" "}
                                  {formatDate(position.lastActivityDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2">
                          <Link
                            href={`/pools/${position.pool.poolAddress}`}
                            className="flex-1 lg:flex-initial"
                          >
                            <Button
                              size="sm"
                              className="w-full bg-[#00c48c] hover:bg-[#00d49a] text-black"
                            >
                              View Pool
                              <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
