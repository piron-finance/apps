"use client";

import { useState, useEffect } from "react";
import { useDeposit } from "@/hooks/useDeposit";
import { Pool } from "@/lib/api/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  DollarSign,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool;
  onDepositComplete?: (shares: string) => void;
}

export function DepositModal({
  isOpen,
  onClose,
  pool,
  onDepositComplete,
}: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionStartTime, setTransactionStartTime] = useState<
    number | null
  >(null);

  const {
    deposit,
    approve,
    isDepositing,
    isPending,
    isConfirming,
    isSuccess,
    error,
    shares,
    transactionHash,
    hasInsufficientBalance,
    needsApproval,
    getMaxDepositAmount,
    getUserBalance,
    reset,
    isApproving,
    isApprovalSuccess,
    refetchAllowance,
  } = useDeposit(pool);

  const expectedShares = amount;

  useEffect(() => {
    if (isSuccess && shares && !showSuccess) {
      setShowSuccess(true);
      setTransactionStartTime(null); // Clear transaction start time on success

      if (onDepositComplete) {
        onDepositComplete(shares);
      }
    }
  }, [isSuccess, shares, onDepositComplete, showSuccess]);

  useEffect(() => {
    if (!transactionStartTime) return;

    const timeoutId = setTimeout(
      () => {
        const timeElapsed = Date.now() - transactionStartTime;
        const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds

        if (timeElapsed >= twoMinutes && !isSuccess) {
          console.log("⏱️ Transaction timeout - allowing modal close");
          setTransactionStartTime(null);
          reset();
        }
      },
      2 * 60 * 1000
    );

    return () => clearTimeout(timeoutId);
  }, [transactionStartTime, isSuccess, reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || hasInsufficientBalance(amount)) return;

    try {
      setTransactionStartTime(Date.now());
      
      // Check if approval is needed
      if (needsApproval(amount)) {
        // Step 1: Approve
        await approve(amount);
        // After approval tx is sent, wait for confirmation before depositing
        // The deposit will be triggered by the approval success effect below
      } else {
        // Step 2: Direct deposit (already approved)
        await deposit(amount);
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionStartTime(null);
    }
  };

  // Auto-trigger deposit after approval is confirmed
  useEffect(() => {
    const triggerDeposit = async () => {
      if (isApprovalSuccess && amount && !isSuccess && !isDepositing) {
        try {
          await refetchAllowance();
          await deposit(amount);
        } catch (error) {
          console.error("Deposit after approval failed:", error);
          setTransactionStartTime(null);
        }
      }
    };
    triggerDeposit();
  }, [isApprovalSuccess, amount, isSuccess, isDepositing, deposit, refetchAllowance]);

  const handleClose = () => {
    const canClose =
      (!isDepositing &&
        !isPending &&
        !isConfirming &&
        !isApproving &&
        !isSuccess) ||
      transactionStartTime === null;

    if (canClose) {
      reset();
      setAmount("");
      setShowSuccess(false);
      setTransactionStartTime(null);
      onClose();
    } else {
      console.log("⚠️ Cannot close modal during transaction");
    }
  };

  const handleSuccessClose = () => {
    reset();
    setAmount("");
    setShowSuccess(false);
    onClose();
  };

  const handleMaxClick = () => {
    const maxAmount = getMaxDepositAmount();
    const userBalance = getUserBalance();
    const max = Math.min(parseFloat(maxAmount), parseFloat(userBalance));
    setAmount(max.toString());
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleSuccessClose}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md mx-4">
          <div className="text-center space-y-4 sm:space-y-6 py-4 sm:py-6">
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Deposit Successful! 🎉
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                You have successfully invested in {pool.name}
              </p>
              {error && (
                <p className="text-yellow-400 text-xs sm:text-sm mt-2">
                  ⚠️ {error}
                </p>
              )}
            </div>

            <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-slate-400">Amount Invested:</span>
                <span className="text-white font-medium">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-slate-400">Shares Received:</span>
                <span className="text-green-400 font-medium">{shares}</span>
              </div>
              {transactionHash && (
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-500">Transaction Hash:</p>
                  <p className="text-xs text-slate-400 font-mono break-all">
                    {transactionHash}
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleSuccessClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-white">
            Invest in {pool.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                  {pool.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 truncate">
                  {pool.issuer}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400">Expected APY:</span>
                <div className="font-medium text-green-400">
                  {formatPercentage(pool.discountRate || 0)}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Min Investment:</span>
                <div className="font-medium text-white">
                  {formatCurrency(pool.minInvestment)}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <Label
                htmlFor="amount"
                className="text-slate-300 text-sm sm:text-base"
              >
                Investment Amount (USDC)
              </Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-slate-800 border-slate-700 text-white pl-9 sm:pl-10 text-sm sm:text-base"
                  min="0"
                  step="0.01"
                  required
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-purple-400 hover:text-purple-300"
                >
                  MAX
                </button>
              </div>

              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Balance: {formatCurrency(getUserBalance())}</span>
                <span>Max: {formatCurrency(getMaxDepositAmount())}</span>
              </div>
            </div>

            {amount && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="text-xs sm:text-sm font-medium text-blue-400">
                    Expected Return
                  </span>
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shares to receive:</span>
                    <span className="text-white">{expectedShares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">At maturity:</span>
                    <span className="text-green-400">
                      {formatCurrency(
                        (
                          parseFloat(amount) *
                          (1 + (pool.discountRate || 0) / 100)
                        ).toString()
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-xs sm:text-sm">{error}</span>
              </div>
            )}

            {amount && hasInsufficientBalance(amount) && (
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-yellow-400 text-xs sm:text-sm">
                  Insufficient balance
                </span>
              </div>
            )}

            {amount && needsApproval(amount) && (
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                <span className="text-blue-400 text-xs sm:text-sm">
                  Token approval required - will approve and deposit in one flow
                </span>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={
                  isDepositing || isPending || isConfirming || isApproving
                }
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !amount ||
                  hasInsufficientBalance(amount) ||
                  isDepositing ||
                  isPending ||
                  isConfirming ||
                  isApproving ||
                  parseFloat(amount) < parseFloat(pool.minInvestment)
                }
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-xs sm:text-sm"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Approving...</span>
                    <span className="sm:hidden">Approving</span>
                  </>
                ) : isDepositing || isPending || isConfirming ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Investing...</span>
                    <span className="sm:hidden">Investing</span>
                  </>
                ) : needsApproval(amount) ? (
                  <>
                    <span className="hidden sm:inline">Approve & Invest</span>
                    <span className="sm:hidden">Approve</span>
                  </>
                ) : (
                  "Invest Now"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
