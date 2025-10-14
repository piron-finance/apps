"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useEpochManagement } from "@/hooks/useEpochManagement";
import { useManualPoolSync } from "@/hooks/useManualPoolSync";
import {
  InstrumentType,
  PoolStatus,
  RiskLevel,
  ApprovalStatus,
  Pool,
} from "@/types";
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Database,
} from "lucide-react";

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

const AdminPoolMetrics = ({
  pool,
}: {
  pool: EnhancedPool;
  poolMetrics: PoolMetrics | null;
}) => {
  const poolForSync = pool
    ? {
        ...pool,
        instrumentType:
          pool.instrumentType === "DISCOUNTED"
            ? InstrumentType.DISCOUNTED
            : InstrumentType.INTEREST_BEARING,
        status:
          pool.status === "FUNDING"
            ? PoolStatus.FUNDING
            : pool.status === "PENDING_INVESTMENT"
              ? PoolStatus.PENDING_INVESTMENT
              : pool.status === "INVESTED"
                ? PoolStatus.INVESTED
                : pool.status === "MATURED"
                  ? PoolStatus.MATURED
                  : PoolStatus.EMERGENCY,
        riskLevel: RiskLevel.MEDIUM,
        approvalStatus: ApprovalStatus.APPROVED,
        couponRates: pool.couponRates?.map((rate) => parseFloat(rate)) || [],
        minInvestment: pool.minInvestment || "0",
      }
    : null;

  const {
    isSyncing,
    lastSyncTime,
    error: syncError,
    success: syncSuccess,
    canSync,
    syncPoolData,
    clearError,
  } = useManualPoolSync(poolForSync as Pool);

  const fundingProgress = pool.progressPercentage;
  const timeRemaining = pool.epochEndTime - Date.now() / 1000;
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / (24 * 60 * 60)));
  const hoursRemaining = Math.max(
    0,
    Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60))
  );

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white">
            Pool Metrics & Controls
          </h3>
          {/* Manual Sync Button. we will replace this with a subgraph later */}
          <button
            onClick={syncPoolData}
            disabled={!canSync || isSyncing}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            title={canSync ? "Sync with blockchain" : "Admin access required"}
          >
            <Database className="w-4 h-4" />
            <RefreshCw
              className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Chain"}
          </button>
          {lastSyncTime && (
            <span className="text-xs text-slate-500">
              Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            String(pool.status) === "FUNDING"
              ? "bg-green-500/20 text-green-400"
              : String(pool.status) === "PENDING_INVESTMENT"
                ? "bg-yellow-500/20 text-yellow-400"
                : String(pool.status) === "INVESTED"
                  ? "bg-blue-500/20 text-blue-400"
                  : String(pool.status) === "MATURED"
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-red-500/20 text-red-400"
          }`}
        >
          {pool.status}
        </div>
      </div>

      {syncSuccess && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">
              Pool data synced successfully with blockchain
            </span>
          </div>
        </div>
      )}

      {syncError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">
              {syncError}
            </span>
            <button
              onClick={clearError}
              className="ml-auto text-xs text-red-400 hover:text-red-300 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white">
              Funding Progress
            </h4>
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
            <span>{formatCurrency(Number(pool.totalRaised))}</span>
            <span>{formatCurrency(Number(pool.targetRaise))}</span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {timeRemaining > 0
                  ? `${daysRemaining}d ${hoursRemaining}h remaining`
                  : "Epoch closed"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {pool.totalInvestors || 0}
              </div>
              <div className="text-sm text-slate-400">Total Investors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatPercentage(pool.discountRate || 0)}
              </div>
              <div className="text-sm text-slate-400">Expected APY</div>
            </div>
          </div>
        </div>

        <AdminControls pool={pool} />
      </div>
    </div>
  );
};

const AdminControls = ({ pool }: { pool: EnhancedPool }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const poolForEpoch = pool
    ? {
        ...pool,
        instrumentType:
          pool.instrumentType === "DISCOUNTED"
            ? InstrumentType.DISCOUNTED
            : InstrumentType.INTEREST_BEARING,
        status:
          pool.status === "FUNDING"
            ? PoolStatus.FUNDING
            : pool.status === "PENDING_INVESTMENT"
              ? PoolStatus.PENDING_INVESTMENT
              : pool.status === "INVESTED"
                ? PoolStatus.INVESTED
                : pool.status === "MATURED"
                  ? PoolStatus.MATURED
                  : PoolStatus.EMERGENCY,
        riskLevel: RiskLevel.MEDIUM,
        approvalStatus: ApprovalStatus.APPROVED,
        couponRates: pool.couponRates?.map((rate) => parseFloat(rate)) || [],
        minInvestment: pool.minInvestment || "0",
      }
    : null;

  const {
    isClosing,
    isSuccess,
    error,
    isPending,
    isConfirming,
    transactionHash,
    hasEpochPassed,
    timeRemaining,
    onchainEpochEndTime,
    canForceClose,
    canRegularClose,
    canCloseEpoch,
    currentAdmin,
    forceCloseEpoch,
    regularCloseEpoch,
    reset,
  } = useEpochManagement(poolForEpoch as Pool);

  const handleForceCloseEpoch = async () => {
    const success = await forceCloseEpoch();
    if (success) {
    }
  };

  const handleRegularCloseEpoch = async () => {
    const success = await regularCloseEpoch();
    if (success) {
    }
  };

  React.useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setShowConfirmDialog(false);
        reset();
      }, 2000);
    }
  }, [isSuccess, reset]);

  const isProcessing = isClosing || isPending || isConfirming;

  return (
    <div>
      <h4 className="text-lg font-semibold text-white mb-4">Admin Controls</h4>

      <div className="space-y-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Pool Status
            </span>
          </div>
          <div className="text-sm text-slate-300">
            Current:{" "}
            <span className="font-medium text-white">{pool.status}</span>
          </div>
          <div className="text-sm text-slate-300">
            Contract:{" "}
            <span className="font-mono text-xs text-slate-400">
              {pool.contractAddress}
            </span>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">
              Epoch Management
            </span>
          </div>

          <div className="mb-3">
            <div className="text-sm text-slate-300">
              <span className="font-medium">Epoch Status:</span>
              <span
                className={`ml-1 ${hasEpochPassed ? "text-red-400" : "text-green-400"}`}
              >
                {hasEpochPassed ? "Ended" : "Active"}
              </span>
              {onchainEpochEndTime && (
                <span className="ml-2 text-xs text-blue-400 bg-blue-500/10 px-1 rounded">
                  Onchain
                </span>
              )}
            </div>
            {!hasEpochPassed && timeRemaining > 0 && (
              <div className="text-xs text-slate-400 mt-1">
                Time remaining: {Math.floor(timeRemaining / (24 * 60 * 60))}d{" "}
                {Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60))}h
              </div>
            )}
          </div>

          {canCloseEpoch ? (
            <div>
              {canForceClose ? (
                <div>
                  <p className="text-sm text-slate-300 mb-3">
                    The funding epoch is currently active. You can force close
                    it to move to the investment phase.
                  </p>
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={isProcessing}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isPending || isConfirming
                          ? "Processing..."
                          : "Closing Epoch..."}
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        Force Close Epoch
                      </>
                    )}
                  </button>
                </div>
              ) : canRegularClose ? (
                <div>
                  <p className="text-sm text-slate-300 mb-3">
                    The funding epoch has ended. Close it to move to the
                    investment phase.
                  </p>
                  <button
                    onClick={handleRegularCloseEpoch}
                    disabled={isProcessing}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isPending || isConfirming
                          ? "Processing..."
                          : "Closing Epoch..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Close Epoch
                      </>
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              {!currentAdmin
                ? "Admin access required for epoch management"
                : String(pool.status) === "FUNDING"
                  ? "Epoch management not available"
                  : "Epoch management only available during funding phase"}
            </p>
          )}
        </div>

        {String(pool.status) === "PENDING_INVESTMENT" && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">
                Next Steps
              </span>
            </div>
            <p className="text-sm text-slate-300">
              The epoch has been closed successfully. The pool is now in
              PENDING_INVESTMENT status. The SPV (Special Purpose Vehicle) can
              now withdraw funds for investment and process the investment.
            </p>
          </div>
        )}

        {transactionHash && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">
                Transaction Status
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400 break-all mb-2">
              {transactionHash}
            </div>
            <div className="text-sm">
              {isConfirming ? (
                <span className="text-yellow-400">⏳ Confirming...</span>
              ) : isSuccess ? (
                <span className="text-green-400">✅ Confirmed</span>
              ) : (
                <span className="text-blue-400">📤 Submitted</span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Error</span>
            </div>
            <div className="text-sm text-red-400">{error}</div>
          </div>
        )}
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-bold text-white">
                Confirm Force Close Epoch
              </h3>
            </div>

            <p className="text-slate-300 mb-4">
              This will immediately close the funding epoch and move the pool to
              the investment phase. This action cannot be undone.
            </p>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
              <div className="text-sm text-orange-400">
                <strong>Warning:</strong> Investors will no longer be able to
                deposit funds after this action.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isProcessing}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleForceCloseEpoch}
                disabled={isProcessing}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Close"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PoolDetails = ({ pool }: { pool: EnhancedPool }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Pool Details</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Pool Name</label>
            <div className="text-white font-medium">{pool.name}</div>
          </div>

          <div>
            <label className="text-sm text-slate-400">Issuer</label>
            <div className="text-white font-medium">{pool.issuer}</div>
          </div>

          <div>
            <label className="text-sm text-slate-400">Instrument Type</label>
            <div className="text-white font-medium">
              {pool.instrumentType === "DISCOUNTED"
                ? "Discounted"
                : "Interest Bearing"}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400">Risk Level</label>
            <div
              className={`font-medium ${
                pool.riskLevel === "LOW"
                  ? "text-green-400"
                  : pool.riskLevel === "MEDIUM"
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {pool.riskLevel}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Pool Contract</label>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-white bg-slate-800 px-2 py-1 rounded">
                {pool.contractAddress.slice(0, 20)}...
              </code>
              <button
                onClick={() => copyToClipboard(pool.contractAddress, "pool")}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {copiedField === "pool" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400">Manager Contract</label>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-white bg-slate-800 px-2 py-1 rounded">
                {pool.managerAddress.slice(0, 20)}...
              </code>
              <button
                onClick={() => copyToClipboard(pool.managerAddress, "manager")}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {copiedField === "manager" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400">Escrow Contract</label>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-white bg-slate-800 px-2 py-1 rounded">
                {pool.escrowAddress.slice(0, 20)}...
              </code>
              <button
                onClick={() => copyToClipboard(pool.escrowAddress, "escrow")}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {copiedField === "escrow" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
        <h4 className="text-lg font-semibold text-white mb-4">Timeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400">Epoch End Time</label>
            <div className="text-white font-medium">
              {new Date(pool.epochEndTime * 1000).toLocaleString()}
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400">Maturity Date</label>
            <div className="text-white font-medium">
              {new Date(pool.maturityDate * 1000).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminPoolDetailPage() {
  const params = useParams();
  const poolId = params.id as string;

  const pools = useQuery(api.pools.getAllPoolsWithComputed, {}) as
    | EnhancedPool[]
    | undefined;

  const pool = useMemo(() => {
    if (!pools) return null;
    return pools.find((p: EnhancedPool) => p._id === poolId) || null;
  }, [pools, poolId]);

  if (!pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading pool details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/pironauthority/pools"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{pool.name}</h1>
            <p className="text-slate-400">Admin Pool Management</p>
          </div>
        </div>

        <AdminPoolMetrics pool={pool} poolMetrics={null} />

        <PoolDetails pool={pool} />
      </div>
    </div>
  );
}
