"use client";

import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Target,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

export default function PortfolioPage() {
  const { address } = useAccount();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            My Portfolio
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            Track your investments and performance
          </p>
        </div>
      </div>

      {!address ? (
        <Card className="bg-slate-900/50 border-white/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-slate-400 text-center mb-4">
              Connect your wallet to view your portfolio
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-slate-900/50 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">
                  Total Portfolio Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  $0.00
                </div>
                <p className="text-xs text-slate-400 mt-1">Coming soon</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">
                  Total Returns
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  $0.00
                </div>
                <p className="text-xs text-slate-400 mt-1">0.00%</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">
                  Active Positions
                </CardTitle>
                <Target className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-white">0</div>
                <p className="text-xs text-slate-400 mt-1">Across pools</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">
                  Avg. APY
                </CardTitle>
                <PieChart className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  0.00%
                </div>
                <p className="text-xs text-slate-400 mt-1">Weighted average</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900/50 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Your Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-400">
                <p className="mb-4">No positions yet</p>
                <Link href="/pools">
                  <Button className="bg-[#00c48c] hover:bg-[#00d49a] text-black">
                    Explore Pools
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
