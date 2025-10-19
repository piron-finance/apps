"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

const POOL_DATA: Record<string, any> = {
  "1": {
    name: "Flexible Stable Yield - Base",
    subtitle: "USDC native on Base • NAV updates daily",
    status: "Open",
    currentAPY: "5.2%",
    tvl: "$48.3M",
    netFlows24h: "+$0.8M",
    liquidity: "T+0/T+1",
    fees: "0.30% mgmt • 10% expense ratio",
    assets: "T-Bills",
    admin: "Piron SPV Ltd.",
    poolType: "Flexible Stable Yield",
    benchmark: "SOFR + spread",
    risk: "Low",
    redemption: "Same day to T+1",
    auditor: "Top-tier",
    reporting: "Monthly statements",
    estimatedDailyYield: "0.014%",
    network: "Base",
    minDeposit: "10 USDC",
    exitTerms: "T+0/T+1",
  },
};

const ACTIVITY_DATA = [
  {
    time: "2025-03-03 14:02",
    type: "Deposit",
    amount: "25,000 USDC",
    status: "Completed",
  },
  {
    time: "2025-02-14 09:15",
    type: "Withdraw",
    amount: "-10,000 USDC",
    status: "Completed",
  },
];

export default function PoolDetailPage() {
  const params = useParams();
  const poolId = params.id as string;
  const pool = POOL_DATA[poolId] || POOL_DATA["1"];

  const [selectedTimeframe, setSelectedTimeframe] = useState("All");
  const [depositAmount, setDepositAmount] = useState("");
  const [userBalance] = useState("0.00 USDC");
  const [accruedYield] = useState("—");
  const [sharePrice] = useState("1.0083");

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
          <div className="w-16 h-16 rounded-full bg-[#1b1305] flex items-center justify-center">
            <Image src="/pironLogo.png" alt="Pool" width={64} height={64} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{pool.name}</h1>
            <p className="text-gray-400 mt-1">{pool.subtitle}</p>
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
                      {pool.currentAPY}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-white/5">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">TVL</div>
                    <div className="text-2xl font-bold text-white">
                      {pool.tvl}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-white/5">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      24h Net Flows
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {pool.netFlows24h}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full h-64 bg-black/40 border border-white/5 rounded-lg flex items-center justify-center">
                <span className="text-gray-600">Performance Chart</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-[#1f2a2a]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Liquidity</span>
                  <span className="text-white font-medium">
                    {pool.liquidity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fees</span>
                  <span className="text-white font-medium">{pool.fees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assets</span>
                  <span className="text-white font-medium">{pool.assets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Admin</span>
                  <span className="text-white font-medium">{pool.admin}</span>
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
                      {userBalance}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-[#1f2a2a] ">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      Accrued Yield
                    </div>
                    <div className="text-xl font-bold text-white">
                      {accruedYield}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-[#1f2a2a] ">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      Share Price (NAV)
                    </div>
                    <div className="text-xl font-bold text-white">
                      {sharePrice}
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
                {ACTIVITY_DATA.map((activity, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 gap-4 text-sm py-3 border-b border-white/5"
                  >
                    <div className="text-gray-400">{activity.time}</div>
                    <div className="text-white">{activity.type}</div>
                    <div className="text-white">{activity.amount}</div>
                    <div className="text-gray-400">{activity.status}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#070707] border-[#172020]">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl text-white font-bold">About this Pool</h2>

              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="flex justify-between pr-8">
                  <span className="text-gray-500">Pool Type</span>
                  <span className="text-white font-medium">
                    {pool.poolType}
                  </span>
                </div>
                <div className="flex justify-between pr-8">
                  <span className="text-gray-500">Benchmark</span>
                  <span className="text-white font-medium">
                    {pool.benchmark}
                  </span>
                </div>
                <div className="flex justify-between pr-8">
                  <span className="text-gray-500">Risk</span>
                  <span className="text-white font-medium">{pool.risk}</span>
                </div>
                <div className="flex justify-between pr-8">
                  <span className="text-gray-500">Redemption</span>
                  <span className="text-white font-medium">
                    {pool.redemption}
                  </span>
                </div>
                <div className="flex justify-between pr-8">
                  <span className="text-gray-500">Auditor</span>
                  <span className="text-white font-medium">{pool.auditor}</span>
                </div>
                <div className="flex justify-between pr-8">
                  <span className="text-gray-500">Reporting</span>
                  <span className="text-white font-medium">
                    {pool.reporting}
                  </span>
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
                  Flexible exits available
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
                      className="w-full bg-black/40 border-white/10 text-white text-right pr-16 h-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      USDC
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Est. daily yield</span>
                  <span className="text-white">{pool.estimatedDailyYield}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Network</span>
                  <span className="text-white">{pool.network}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min deposit</span>
                  <span className="text-white">{pool.minDeposit}</span>
                </div>

                <div className="flex justify-between text-sm pb-4 border-b border-white/5">
                  <span className="text-gray-500">Exit terms</span>
                  <span className="text-white">{pool.exitTerms}</span>
                </div>

                {/* Warning Banner */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-sm text-yellow-500">
                    Ensure wallet is on {pool.network} to deposit to this pool.
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
