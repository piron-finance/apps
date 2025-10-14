"use client";

import { useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useAccount } from "wagmi";
import { KYCModal } from "@/components/kyc/kyc-modal";
import { DepositModal } from "@/components/pools/deposit-modal";
import { Doc } from "../../../../../convex/_generated/dataModel";
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  truncateAddress,
} from "@/lib/utils";
import { useWithdraw } from "@/hooks/useWithdraw";
import {
  Pool,
  RiskLevel,
  ApprovalStatus,
  InstrumentType,
  PoolStatus,
} from "@/types";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  FileText,
  Copy,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";
import Image from "next/image";

type EnhancedPool = Doc<"pools"> & {
  totalRaisedNumeric: number;
  targetRaiseNumeric: number;
  couponRatesNumeric: number[];
  progressPercentage: number;
  expectedAPY: number;
  poolWeight: number;
  isActivePool: boolean;
};

interface PoolMetrics {
  isActive: boolean;
  timeRemaining: number;
  fundingProgress: number;
  calculatedAPY: number;
  tokenPrice: string;
  nav: string;
}

const FundingProgress = ({
  pool,
  poolMetrics,
}: {
  pool: EnhancedPool;
  poolMetrics: PoolMetrics | null;
}) => {
  const fundingProgress = pool.progressPercentage;
  const timeRemaining = pool.epochEndTime - Date.now() / 1000;
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / (24 * 60 * 60)));
  const hoursRemaining = Math.max(
    0,
    Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60))
  );

  return (
    <div className="min-h-64 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-white">Funding Progress</h4>
          <span className="text-sm text-slate-400">
            {fundingProgress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(fundingProgress, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-slate-400">
          <span>{formatCurrency(pool.totalRaisedNumeric)}</span>
          <span>{formatCurrency(pool.targetRaiseNumeric)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {timeRemaining > 0
              ? `${daysRemaining}d ${hoursRemaining}h remaining`
              : "Epoch closed"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <div className="text-xl font-bold text-white">
            {pool.totalInvestors || 0}
          </div>
          <div className="text-xs text-slate-400">Investors</div>
        </div>
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <div className="text-xl font-bold text-green-400">
            {formatPercentage(poolMetrics?.calculatedAPY || 0)}
          </div>
          <div className="text-xs text-slate-400">Expected APY</div>
        </div>
      </div>
    </div>
  );
};

const CouponSchedule = ({ pool }: { pool: EnhancedPool }) => {
  const now = Date.now() / 1000;

  return (
    <div className="min-h-64 space-y-4">
      <h4 className="text-lg font-semibold text-white">
        Coupon Payment Schedule
      </h4>

      <div className="space-y-3">
        {pool.couponDates?.slice(0, 6).map((date: number, index: number) => {
          const isPaid = date < now;
          const rate = parseFloat(pool.couponRates?.[index] || "0");

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${isPaid ? "bg-green-400" : "bg-slate-600"}`}
                ></div>
                <div className="text-sm text-slate-300">
                  {formatDate(date * 1000)}
                </div>
              </div>
              <div className="text-sm font-medium text-white">
                {formatPercentage(rate / 100)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InvestmentChart = ({ pool }: { pool: EnhancedPool }) => {
  const totalRaised = parseFloat(pool.totalRaised || "0");
  const actualInvested = parseFloat(pool.actualInvested || "0");

  if (pool.status === "PENDING_INVESTMENT") {
    return (
      <div className="min-h-64 space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            Investment Preparation
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
              <div>
                <div className="text-sm text-slate-400">Funds Raised</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(totalRaised)}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600">
              <div>
                <div className="text-sm text-slate-400">
                  Awaiting Investment
                </div>
                <div className="text-lg text-slate-300">
                  SPV processing funds
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pool.status === "INVESTED") {
    const investmentProgress =
      actualInvested > 0 ? (actualInvested / totalRaised) * 100 : 0;

    if (pool.instrumentType === "DISCOUNTED") {
      const timeToMaturity = pool.maturityDate - Date.now() / 1000;
      const totalTime = pool.maturityDate - pool.epochEndTime;
      const timeElapsed = Math.max(0, Date.now() / 1000 - pool.epochEndTime);
      const maturityProgress =
        totalTime > 0 ? Math.min((timeElapsed / totalTime) * 100, 100) : 0;

      return (
        <div className="min-h-64 space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Discount Appreciation
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">
                    Investment Progress
                  </span>
                  <span className="text-sm text-white">
                    {investmentProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${Math.min(investmentProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-400">
                  {formatCurrency(actualInvested)} of{" "}
                  {formatCurrency(totalRaised)} invested
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">
                    Time to Maturity
                  </span>
                  <span className="text-sm text-white">
                    {maturityProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(maturityProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-400">
                  {Math.max(0, Math.ceil(timeToMaturity / (24 * 60 * 60)))} days
                  remaining
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return <CouponSchedule pool={pool} />;
    }
  }

  if (pool.status === "MATURED") {
    return (
      <div className="min-h-64 space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            Pool Completed
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div>
                <div className="text-sm text-green-400">Total Invested</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(actualInvested || totalRaised)}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>

            {pool.instrumentType === "DISCOUNTED" && (
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <div className="text-sm text-slate-400">
                    Discount Realized
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    {formatPercentage(pool.discountRate || 0)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Face Value</div>
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(parseFloat(pool.targetRaise || "0"))}
                  </div>
                </div>
              </div>
            )}

            <div className="text-center p-4 bg-slate-800/30 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Status</div>
              <div className="text-lg font-semibold text-green-400">
                Ready for Withdrawal
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-64 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <Target className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white mb-2">
            Emergency Status
          </h4>
          <p className="text-slate-400 text-sm">
            Pool operations have been suspended. Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

const LifecycleChecklist = ({ pool }: { pool: EnhancedPool }) => {
  const getStatusStep = (status: string) => {
    switch (status) {
      case "FUNDING":
        return 0;
      case "PENDING_INVESTMENT":
        return 1;
      case "INVESTED":
        return 2;
      case "MATURED":
        return 3;
      case "EMERGENCY":
        return -1;
      default:
        return -1;
    }
  };

  const currentStep = getStatusStep(pool.status);
  const isEmergency = pool.status === "EMERGENCY";

  const steps = [
    {
      label: "Funding Open",
      icon: Target,
      description: "Accepting investments",
    },
    {
      label: "Investment Pending",
      icon: Clock,
      description: "Processing investment",
    },
    {
      label: "Actively Invested",
      icon: TrendingUp,
      description: "Generating returns",
    },
    { label: "Matured", icon: CheckCircle, description: "Returns available" },
  ];

  if (isEmergency) {
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Pool Status</h4>
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-3 text-red-400">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">!</span>
            </div>
            <div>
              <div className="font-medium">Emergency Status</div>
              <div className="text-sm text-red-300">
                Pool requires attention
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">Pool Lifecycle</h4>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const IconComponent = step.icon;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isCurrent
                  ? "bg-purple-500/20 border border-purple-500/30"
                  : isCompleted
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-slate-800/50 border border-slate-700/50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCurrent
                    ? "bg-purple-500"
                    : isCompleted
                      ? "bg-green-500"
                      : "bg-slate-600"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <IconComponent
                    className={`w-4 h-4 ${
                      isCurrent ? "text-white" : "text-slate-400"
                    }`}
                  />
                )}
              </div>
              <div>
                <div
                  className={`font-medium ${
                    isCurrent
                      ? "text-purple-300"
                      : isCompleted
                        ? "text-green-400"
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-xs text-slate-500">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function PoolDetailPage() {
  const params = useParams();
  const poolId = params.id as string;
  const { isSignedIn } = useUser();
  const { address: walletAddress, isConnected } = useAccount();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const pools = useQuery(api.pools.getAllPoolsWithComputed, {}) as
    | EnhancedPool[]
    | undefined;
  const isLoading = pools === undefined;

  const pool = useMemo(() => {
    if (!pools) return null;
    return pools.find((p: EnhancedPool) => p._id === poolId) || null;
  }, [pools, poolId]);

  const poolTransactions = useQuery(
    api.transactions.getTransactionsByPool,
    pool?._id ? { poolId: pool._id } : "skip"
  );

  const kycStatus = useQuery(
    api.kyc.getUserKycStatus,
    isSignedIn && walletAddress ? { walletAddress } : "skip"
  );

  const statusMap = {
    FUNDING: PoolStatus.FUNDING,
    PENDING_INVESTMENT: PoolStatus.PENDING_INVESTMENT,
    INVESTED: PoolStatus.INVESTED,
    MATURED: PoolStatus.MATURED,
    EMERGENCY: PoolStatus.EMERGENCY,
  } as const;

  const instrumentMap = {
    DISCOUNTED: InstrumentType.DISCOUNTED,
    INTEREST_BEARING: InstrumentType.INTEREST_BEARING,
  } as const;

  const poolForWithdraw = pool
    ? {
        ...pool,
        instrumentType:
          instrumentMap[pool.instrumentType] || InstrumentType.INTEREST_BEARING,
        status: statusMap[pool.status] || PoolStatus.EMERGENCY,
        riskLevel: RiskLevel.MEDIUM,
        approvalStatus: ApprovalStatus.APPROVED,
        couponRates: pool.couponRates?.map((rate) => parseFloat(rate)) || [],
        minInvestment: pool.minInvestment || "0",
      }
    : null;

  const {
    isWithdrawing,
    isSuccess: withdrawSuccess,
    error: withdrawError,
    withdraw,
    getMaxWithdrawAmount,
  } = useWithdraw(poolForWithdraw || ({} as Pool));

  const poolMetrics = useMemo(() => {
    if (!pool) return null;

    const now = Date.now() / 1000;
    const isActive = pool.maturityDate > now;
    const timeRemaining = pool.maturityDate - now;
    const fundingProgress = pool.progressPercentage;
    const calculatedAPY = pool.expectedAPY;

    return {
      isActive,
      timeRemaining,
      fundingProgress,
      calculatedAPY,
      tokenPrice: "1.000",
      nav: pool.totalRaised,
    };
  }, [pool]);

  const getInvestmentButtonState = useMemo(() => {
    if (!pool)
      return {
        text: "Loading...",
        disabled: true,
        needsAuth: false,
        needsKYC: false,
      };

    if (pool.status === "MATURED") {
      if (!isSignedIn)
        return {
          text: "Sign In to Withdraw",
          disabled: false,
          needsAuth: true,
          needsKYC: false,
        };
      if (!isConnected || !walletAddress)
        return {
          text: "Connect Wallet",
          disabled: true,
          needsAuth: false,
          needsKYC: false,
        };
      return {
        text: "Withdraw",
        disabled: false,
        needsAuth: false,
        needsKYC: false,
      };
    }

    if (pool.status !== "FUNDING")
      return {
        text: "Not Available",
        disabled: true,
        needsAuth: false,
        needsKYC: false,
      };
    if (!isSignedIn)
      return {
        text: "Sign In to Invest",
        disabled: false,
        needsAuth: true,
        needsKYC: false,
      };
    if (!isConnected || !walletAddress)
      return {
        text: "Connect Wallet",
        disabled: true,
        needsAuth: false,
        needsKYC: false,
      };

    const userKycStatus = kycStatus?.kycStatus || "NOT_STARTED";
    const hasBasicKyc = kycStatus?.hasUser && userKycStatus === "APPROVED";

    return {
      text: hasBasicKyc ? "Invest Now" : "Complete Verification",
      disabled: false,
      needsAuth: false,
      needsKYC: !hasBasicKyc,
    };
  }, [pool, isSignedIn, isConnected, walletAddress, kycStatus]);

  const handleMaturityWithdrawal = useCallback(async () => {
    if (!walletAddress || !pool) return;

    try {
      const maxAmount = getMaxWithdrawAmount();
      if (maxAmount === "0") {
        console.error("No funds available for withdrawal");
        return;
      }
      await withdraw(maxAmount);
    } catch (error) {
      console.error("Maturity withdrawal failed:", error);
    }
  }, [walletAddress, pool, getMaxWithdrawAmount, withdraw]);

  const handleInvestmentClick = useCallback(() => {
    if (getInvestmentButtonState.disabled) return;

    if (getInvestmentButtonState.needsAuth) {
      window.location.href = "/sign-in";
      return;
    }

    if (pool?.status === "MATURED") {
      handleMaturityWithdrawal();
      return;
    }

    if (getInvestmentButtonState.needsKYC) {
      setShowKYCModal(true);
    } else {
      setShowDepositModal(true);
    }
  }, [getInvestmentButtonState, pool?.status, handleMaturityWithdrawal]);

  const getStatusColor = (status: string) => {
    const statusColors = {
      FUNDING: "bg-blue-500/20 text-blue-400",
      INVESTED: "bg-green-500/20 text-green-400",
      MATURED: "bg-gray-500/20 text-gray-400",
      EMERGENCY: "bg-red-500/20 text-red-400",
    } as const;
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-yellow-500/20 text-yellow-400"
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Pool Not Found</h1>
          <Link
            href="/pools"
            className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/pools"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-slate-600"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center">
              {pool.image ? (
                <Image
                  src={pool.image}
                  alt={pool.name}
                  width={40}
                  height={40}
                />
              ) : (
                <Building2 className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{pool.name}</h1>
              <p className="text-slate-400">{pool.issuer}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {/* Pool Status */}
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pool.status)}`}
            >
              {pool.status === "FUNDING" && "Open for investments"}
              {pool.status === "INVESTED" && "Invested"}
              {pool.status === "MATURED" && "Matured"}
              {pool.status === "EMERGENCY" && "Emergency"}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Pool Status
                </h2>
              </div>

              <div className="flex items-end gap-8 mb-6">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatCurrency(Number(pool.totalRaised))}
                  </div>
                  <div className="text-slate-400">TVL USD</div>
                </div>
              </div>

              {pool.status === "FUNDING" && (
                <FundingProgress pool={pool} poolMetrics={poolMetrics} />
              )}
              {(pool.status === "PENDING_INVESTMENT" ||
                pool.status === "INVESTED" ||
                pool.status === "MATURED" ||
                pool.status === "EMERGENCY") && <InvestmentChart pool={pool} />}
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-slate-400 font-medium">
                        Token
                      </th>
                      <th className="text-left py-3 text-slate-400 font-medium">
                        APY
                      </th>
                      <th className="text-left py-3 text-slate-400 font-medium">
                        TVL (USD)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-4">
                        <div className="font-medium text-white">
                          {pool.name} Token
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-green-400 font-medium">
                          {formatPercentage(poolMetrics?.calculatedAPY || 0)}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-white font-medium">
                          {formatCurrency(Number(pool.totalRaised))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    {pool.image ? (
                      <Image
                        src={pool.image}
                        alt={pool.name}
                        width={40}
                        height={80}
                        className="object-cover"
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {pool.issuer}
                    </h3>
                    <p className="text-slate-400">Investment Manager</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </button>
                  <button className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Executive summary
                  </button>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {pool.description ||
                  "This is a tokenized investment pool offering exposure to high-quality assets. The strategy focuses on delivering consistent returns while maintaining strong risk management and regulatory compliance."}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Holdings
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-slate-400 font-medium">
                        Date
                      </th>
                      <th className="text-left py-3 text-slate-400 font-medium">
                        Address
                      </th>
                      <th className="text-right py-3 text-slate-400 font-medium">
                        Amount
                      </th>
                      <th className="text-right py-3 text-slate-400 font-medium">
                        % Holding
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {poolTransactions &&
                    Array.isArray(poolTransactions) &&
                    poolTransactions.length > 0 ? (
                      poolTransactions
                        .filter(
                          (tx: Doc<"transactions">) => tx.type === "DEPOSIT"
                        )
                        .slice(0, 10)
                        .map((tx: Doc<"transactions">) => {
                          const totalRaised = parseFloat(
                            pool?.totalRaised || "0"
                          );
                          const userAmount = parseFloat(tx.amount || "0");
                          const percentageHolding =
                            totalRaised > 0
                              ? (userAmount / totalRaised) * 100
                              : 0;

                          return (
                            <tr
                              key={tx._id}
                              className="border-b border-slate-800/60"
                            >
                              <td className="py-3 text-slate-300">
                                {formatDate(tx.createdAt)}
                              </td>
                              <td className="py-3 text-slate-300 font-mono">
                                {truncateAddress(tx.txHash || "", 6, 4)}
                              </td>
                              <td className="py-3 text-right text-slate-300">
                                {formatCurrency(tx.amount)}
                              </td>
                              <td className="py-3 text-right text-slate-300">
                                {formatPercentage(percentageHolding)}
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td
                          className="py-3 text-slate-400 text-center"
                          colSpan={4}
                        >
                          {poolTransactions === undefined
                            ? "Loading..."
                            : "No deposit activity yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Overview</h3>
                {pool.status === "FUNDING" && (
                  <div className="text-sm text-green-400 font-medium">
                    Open for investments
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Asset Type</span>
                  <span className="text-white">
                    {pool.instrumentType === "DISCOUNTED"
                      ? "Discounted Securities"
                      : "Interest Bearing"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">APY</span>
                  <span className="text-green-400 font-medium">
                    {formatPercentage(poolMetrics?.calculatedAPY || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Min. Investment</span>
                  <span className="text-white">
                    {formatCurrency(Number(pool.minInvestment))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Investor Type</span>
                  <span className="text-white">Accredited Investors</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Available Networks</span>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                    <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pool Structure</span>
                  <span className="text-white">SPV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Level</span>
                  <span className="text-white">{pool.riskLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Maturity Date</span>
                  <span className="text-white">
                    {formatDate(pool.maturityDate * 1000)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
              <LifecycleChecklist pool={pool} />
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Copy className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">Contract Address</span>
              </div>
              <div className="font-mono text-xs text-slate-300 break-all bg-slate-800/50 p-3 rounded-lg mb-4">
                {pool.contractAddress}
              </div>

              {withdrawSuccess && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-sm text-green-400">
                    ✅ Withdrawal completed successfully!
                  </div>
                </div>
              )}

              {withdrawError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="text-sm text-red-400">❌ {withdrawError}</div>
                </div>
              )}

              <button
                onClick={handleInvestmentClick}
                disabled={getInvestmentButtonState.disabled || isWithdrawing}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  getInvestmentButtonState.disabled || isWithdrawing
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                }`}
              >
                {isWithdrawing && pool?.status === "MATURED"
                  ? "Processing Withdrawal..."
                  : getInvestmentButtonState.text}
              </button>
            </div>
          </div>
        </div>
      </div>

      <KYCModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onKYCComplete={() => {
          setShowKYCModal(false);
          window.location.reload();
        }}
      />

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        pool={poolForWithdraw || ({} as Pool)}
        onDepositComplete={() => {
          setShowDepositModal(false);
        }}
      />
    </div>
  );
}
