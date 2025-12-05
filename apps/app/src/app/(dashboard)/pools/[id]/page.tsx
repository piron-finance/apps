"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Share,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  usePoolData,
  usePoolAnalytics,
  usePoolNavHistory,
} from "@/hooks/usePoolsData";
import { useUserPositionInPool } from "@/hooks/useUserData";
import { useDeposit } from "@/hooks/useDeposit";
import { usePoolTransactions } from "@/hooks/useTransactions";
import { useAccount } from "wagmi";
import NAVChart from "@/components/charts/NAVChart";
import { getChainName, getTransactionUrl } from "@/lib/constants";

export default function PoolDetailPage() {
  const params = useParams();
  const poolAddress = params.id as string; // This is actually the poolAddress from the URL

  // Fetch pool data using poolAddress
  const { data: pool, isLoading: poolLoading } = usePoolData(poolAddress);
  const { data: analytics, isLoading: analyticsLoading } =
    usePoolAnalytics(poolAddress);

  // Get connected wallet address
  const { address: walletAddress } = useAccount();

  // Fetch user position (only if wallet is connected)
  const { data: userPosition } = useUserPositionInPool(
    walletAddress || "",
    poolAddress,
    {
      enabled: Boolean(walletAddress), // Only fetch if wallet is connected
    }
  );

  // Skip NAV history for now - endpoint not implemented on backend yet
  // const { data: navHistory, isLoading: navLoading } = usePoolNavHistory(
  //   poolId,
  //   "30d",
  //   "daily"
  // );

  const [selectedTimeframe, setSelectedTimeframe] = useState("1M");
  const [depositAmount, setDepositAmount] = useState("");
  const [hasTriggeredAutoDeposit, setHasTriggeredAutoDeposit] = useState(false);

  // Fetch transaction history for this pool
  const { data: transactionsData, isLoading: transactionsLoading } =
    usePoolTransactions(poolAddress, { page: 1, limit: 20 });

  // Initialize deposit hook
  const {
    deposit,
    approve,
    needsApproval,
    hasInsufficientBalance,
    getUserBalance,
    isApproving,
    isApprovalSuccess,
    isConfirming,
    isSuccess,
    refetchAllowance,
    balanceRaw,
  } = useDeposit(pool || undefined);

  // Auto-deposit after approval (only once)
  useEffect(() => {
    const triggerDeposit = async () => {
      if (
        isApprovalSuccess &&
        depositAmount &&
        !isSuccess &&
        !isConfirming &&
        !hasTriggeredAutoDeposit
      ) {
        console.log("🟢 Approval successful, triggering deposit...");
        setHasTriggeredAutoDeposit(true); // Prevent multiple calls
        try {
          await refetchAllowance();
          await deposit(depositAmount);
        } catch (error) {
          console.error("Deposit after approval failed:", error);
          setHasTriggeredAutoDeposit(false); // Reset on error to allow retry
        }
      }
    };
    triggerDeposit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isApprovalSuccess,
    depositAmount,
    isSuccess,
    isConfirming,
    hasTriggeredAutoDeposit,
  ]);

  // Clear amount and reset flag after successful deposit
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setDepositAmount("");
        setHasTriggeredAutoDeposit(false); // Reset for next deposit
      }, 3000); // Clear after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Handle deposit click
  const handleDeposit = async () => {
    console.log("🔵 Deposit clicked:", {
      depositAmount,
      hasPool: !!pool,
      walletAddress,
      balanceRaw,
      assetAddress: pool?.assetAddress,
    });

    if (!depositAmount) {
      alert("Please enter a deposit amount");
      return;
    }

    if (!pool) {
      alert("Pool data not loaded");
      return;
    }

    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!pool.assetAddress) {
      console.error("Pool missing assetAddress:", pool);
      alert("Pool configuration error - missing asset address");
      return;
    }

    // Check balance before proceeding (only if loaded)
    if (balanceRaw && hasInsufficientBalance(depositAmount)) {
      alert(
        `Insufficient balance. You have ${getUserBalance()} ${pool.assetSymbol}`
      );
      return;
    }

    try {
      if (needsApproval(depositAmount)) {
        console.log("🟡 Approval needed, requesting approval...");
        setHasTriggeredAutoDeposit(false); // Reset before approval
        await approve(depositAmount);
        // Deposit will be triggered automatically by the useEffect above
      } else {
        console.log("🟢 No approval needed, depositing directly...");
        await deposit(depositAmount);
      }
    } catch (error) {
      console.error("❌ Deposit failed:", error);
      setHasTriggeredAutoDeposit(false); // Reset on error
      alert(
        `Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

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
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
        <Link href="/" className="hover:text-white transition-colors">
          Pools
        </Link>
        <span>›</span>
        <span className="text-white">{pool.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-0">
        <div className="flex items-start gap-3 sm:gap-4 flex-1">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#1b1305] flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image
              src="/pironLogo.png"
              alt="Pool"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
              {pool.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mt-1">
              {pool.assetSymbol} •{" "}
              {pool.poolType === "STABLE_YIELD"
                ? "Flexible Liquidity"
                : "Fixed Term"}
            </p>
          </div>
          <Badge className="bg-[#00c48c]/20 text-[#00c48c] border-0 flex-shrink-0">
            {pool.status}
          </Badge>
        </div>
        {/* <div className="flex items-center gap-2 sm:gap-3 flex-wrap lg:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-white/10 text-white hover:bg-white/5 text-xs sm:text-sm"
          >
            <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-white/10 text-white hover:bg-white/5 text-xs sm:text-sm"
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Docs
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={
              !walletAddress ||
              !depositAmount ||
              isApproving ||
              isConfirming ||
              Boolean(balanceRaw && hasInsufficientBalance(depositAmount))
            }
            className="bg-[#00c48c] hover:bg-[#00d49a] text-black font-semibold px-4 sm:px-6 text-xs sm:text-sm disabled:opacity-50"
          >
            {isApproving
              ? "Approving..."
              : isConfirming
                ? "Depositing..."
                : "Deposit"}
          </Button>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column - Performance & Holdings */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Performance Section */}
          <Card className="bg-[#050505] border-white/20">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col items-end border-b border-white/20 pb-4 w-full">
                <div className="flex items-center justify-end gap-2 overflow-x-auto w-full pb-2 sm:pb-0">
                  {["1M", "3M", "1Y", "All"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-200 flex-shrink-0 ${
                        selectedTimeframe === tf
                          ? "bg-[#1a3a2e] text-white border border-[#00c48c]/30"
                          : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="bg-[#070707] border-white/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      Current APY
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {pool.analytics?.apy
                        ? `${Number(pool.analytics.apy).toFixed(2)}%`
                        : pool.discountRate
                          ? `${Number(pool.discountRate).toFixed(2)}%`
                          : "N/A"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-white/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      NAV Price
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {pool.analytics?.navPerShare
                        ? `$${parseFloat(pool.analytics.navPerShare).toFixed(4)}`
                        : "$1.0000"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-white/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      Unique Investors
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {pool.analytics?.uniqueInvestors || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full h-48 sm:h-56 lg:h-64 bg-black/40 border border-white/5 rounded-lg p-3 sm:p-4 overflow-hidden">
                <NAVChart data={[]} timeframe={selectedTimeframe} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm pt-4 border-t border-white/20">
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

          <Card className="bg-[#050505] border-white/20">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg sm:text-xl text-white font-bold">
                  Holdings & Activity
                </h2>
                <span className="text-xs sm:text-sm text-gray-500">
                  Your position
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="bg-[#070707] border-white/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      Your Balance
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {userPosition?.totalShares
                        ? `${parseFloat(userPosition.totalShares).toFixed(2)} ${pool.assetSymbol}`
                        : `0.00 ${pool.assetSymbol}`}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-white/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      Position Value
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {userPosition?.currentValue
                        ? `$${parseFloat(userPosition.currentValue).toFixed(2)}`
                        : "$0.00"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#070707] border-white/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">
                      TVL
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {pool.analytics?.totalValueLocked
                        ? `$${Number(pool.analytics.totalValueLocked).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                        : "$0"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="hidden sm:grid sm:grid-cols-5 gap-4 text-sm text-gray-500 pb-2 border-b border-white/20">
                  <div>Time</div>
                  <div>Type</div>
                  <div>User</div>
                  <div>Amount</div>
                  <div>Hash</div>
                </div>
                {transactionsLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading transactions...</p>
                  </div>
                ) : transactionsData && transactionsData.data.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {transactionsData.data.map((tx) => (
                      <div
                        key={tx.id}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 px-4 py-3 text-xs sm:text-sm hover:bg-white/5 transition-colors"
                      >
                        <div className="text-gray-400">
                          {new Date(tx.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div>
                          <Badge
                            variant={
                              tx.type === "DEPOSIT"
                                ? "default"
                                : tx.type === "WITHDRAWAL"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {tx.type}
                          </Badge>
                        </div>
                        <div className="font-mono text-gray-400 truncate text-xs">
                          {tx.userWallet || tx.user?.walletAddress
                            ? `${(tx.userWallet || tx.user?.walletAddress)!.slice(0, 6)}...${(tx.userWallet || tx.user?.walletAddress)!.slice(-4)}`
                            : "N/A"}
                        </div>
                        <div className="font-semibold text-white">
                          {Number(tx.amount).toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          {tx.pool?.assetSymbol || pool?.assetSymbol || ""}
                        </div>
                        <div>
                          <a
                            href={getTransactionUrl(pool.chainId, tx.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00c48c] hover:underline font-mono text-xs truncate block"
                          >
                            {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm sm:text-base">No transactions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#070707] border-white/20">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl text-white font-bold">
                About this Pool
              </h2>

              <div className="space-y-3">
                <p className="text-sm sm:text-base text-gray-300">
                  {pool.description || "No description available."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-y-4 text-xs sm:text-sm pt-4">
                  <div className="flex justify-between sm:pr-8">
                    <span className="text-gray-500">Pool Type</span>
                    <span className="text-white font-medium">
                      {pool.poolType === "STABLE_YIELD"
                        ? "Stable Yield"
                        : "Single Asset"}
                    </span>
                  </div>
                  <div className="flex justify-between sm:pr-8">
                    <span className="text-gray-500">Security Type</span>
                    <span className="text-white font-medium">
                      {pool.securityType || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between sm:pr-8">
                    <span className="text-gray-500">Risk Rating</span>
                    <span className="text-white font-medium">
                      {pool.riskRating || "Not rated"}
                    </span>
                  </div>
                  <div className="flex justify-between sm:pr-8">
                    <span className="text-gray-500">Issuer</span>
                    <span className="text-white font-medium">
                      {pool.issuer || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between sm:pr-8">
                    <span className="text-gray-500">Region</span>
                    <span className="text-white font-medium">
                      {pool.region || pool.country || "Global"}
                    </span>
                  </div>
                  {pool.maturityDate && (
                    <div className="flex justify-between sm:pr-8">
                      <span className="text-gray-500">Maturity Date</span>
                      <span className="text-white font-medium">
                        {new Date(pool.maturityDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-4">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/10 text-white hover:bg-white/5 text-xs sm:text-sm"
                >
                  Factsheet
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-white/10 text-white hover:bg-white/5 text-xs sm:text-sm"
                >
                  KYC requirements
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-white/10 text-white hover:bg-white/5 text-xs sm:text-sm"
                >
                  Contracts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-[#070707] border-white/20 lg:sticky lg:top-8">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
                  <span className="text-gray-500">Network</span>
                  <span className="text-white">
                    {getChainName(pool.chainId)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min deposit</span>
                  <span className="text-white">
                    ${parseFloat(pool.minInvestment).toFixed(0)}
                  </span>
                </div>

                <div className="flex justify-between text-sm pb-4 border-b border-white/20">
                  <span className="text-gray-500">Pool Address</span>
                  <span className="text-white text-xs">
                    {pool.poolAddress.slice(0, 6)}...
                    {pool.poolAddress.slice(-4)}
                  </span>
                </div>

                {/* Status Messages */}
                {!walletAddress ? (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-sm text-blue-400">
                      Connect your wallet to deposit
                    </p>
                  </div>
                ) : null}

                {walletAddress &&
                balanceRaw && // Only show if balance is loaded
                depositAmount &&
                hasInsufficientBalance(depositAmount) ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-400">
                      Insufficient balance. You have {getUserBalance()}{" "}
                      {pool.assetSymbol}
                    </p>
                  </div>
                ) : null}

                {isSuccess ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-green-400">
                      Deposit successful! 🎉
                    </p>
                  </div>
                ) : null}

                {/* {!isSuccess ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-sm text-yellow-500">
                      Ensure wallet is on Chain ID {pool.chainId}
                    </p>
                  </div>
                ) : null} */}

                <Button
                  onClick={handleDeposit}
                  disabled={
                    !walletAddress ||
                    !depositAmount ||
                    isApproving ||
                    isConfirming ||
                    Boolean(balanceRaw && hasInsufficientBalance(depositAmount))
                  }
                  className="w-full bg-[#00c48c] hover:bg-[#00d49a] text-black font-semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Depositing...
                    </>
                  ) : (
                    "Deposit"
                  )}
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

      <div className="flex items-center justify-center pt-8 sm:pt-12 pb-6 border-t border-white/20">
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
