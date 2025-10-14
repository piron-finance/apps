import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Info,
  Calculator,
} from "lucide-react";
import { Pool } from "@/types";
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  calculateExpectedReturn,
  validateAmount,
  getWithdrawalPenalty,
} from "@/lib/utils";
import { ConnectButton } from "@/lib/connect-button";

interface InvestModalProps {
  pool: Pool;
  isOpen: boolean;
  onClose: () => void;
  onInvest: (amount: string) => Promise<void>;
}

export function InvestModal({
  pool,
  isOpen,
  onClose,
  onInvest,
}: InvestModalProps) {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<
    "input" | "confirm" | "processing" | "success"
  >("input");

  const minInvestment = parseFloat(pool.minInvestment);
  const expectedReturn = calculateExpectedReturn(
    amount || "0",
    pool.discountRate,
    pool.couponRates,
    pool.instrumentType
  );
  const expectedAPY =
    pool.instrumentType === 0 && pool.discountRate
      ? pool.discountRate / 100
      : pool.couponRates
        ? pool.couponRates.reduce((sum, rate) => sum + rate, 0) / 100
        : 0;

  const validation = validateAmount(amount, pool.minInvestment);
  const withdrawalPenalty = getWithdrawalPenalty(pool);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setError("");
      setStep("input");
    }
  }, [isOpen]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError("");
  };

  const handleNext = () => {
    if (!validation.isValid) {
      setError(validation.error || "Invalid amount");
      return;
    }
    setStep("confirm");
  };

  const handleInvest = async () => {
    if (!validation.isValid) return;

    setIsLoading(true);
    setStep("processing");

    try {
      await onInvest(amount);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investment failed");
      setStep("input");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const renderInputStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="amount" className="text-sm font-medium text-white">
            Investment Amount (USD)
          </Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white text-lg h-12"
              min={minInvestment}
              step="0.01"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAmount(pool.minInvestment)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Min: {formatCurrency(pool.minInvestment)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAmount("1000")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            $1,000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAmount("5000")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            $5,000
          </Button>
        </div>
      </div>

      {amount && validation.isValid && (
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            <h4 className="font-medium text-white">Investment Summary</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Investment Amount</span>
              <p className="font-semibold text-white">
                {formatCurrency(amount)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Expected Return</span>
              <p className="font-semibold text-green-400">
                {formatCurrency(expectedReturn)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Expected APY</span>
              <p className="font-semibold text-blue-400">
                {formatPercentage(expectedAPY)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Maturity Date</span>
              <p className="font-semibold text-white">
                {formatDate(pool.maturityDate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {withdrawalPenalty > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-400">
                Early Withdrawal Penalty
              </p>
              <p className="text-yellow-300 mt-1">
                Withdrawing after investment processing incurs a{" "}
                {withdrawalPenalty}% penalty.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleClose}
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Cancel
        </Button>
        {isConnected ? (
          <Button
            onClick={handleNext}
            disabled={!validation.isValid}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Review Investment
          </Button>
        ) : (
          <div className="flex-1">
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-white">Confirm Investment Details</h4>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Pool</span>
            <span className="font-medium text-white">{pool.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Investment Amount</span>
            <span className="font-semibold text-white">
              {formatCurrency(amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Expected Return</span>
            <span className="font-semibold text-green-400">
              {formatCurrency(expectedReturn)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Expected APY</span>
            <span className="font-semibold text-blue-400">
              {formatPercentage(expectedAPY)}
            </span>
          </div>
          <Separator className="bg-slate-700" />
          <div className="flex justify-between">
            <span className="text-slate-400">Maturity Date</span>
            <span className="font-medium text-white">
              {formatDate(pool.maturityDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-400">Investment Terms</p>
            <ul className="text-blue-300 mt-1 space-y-1">
              <li>• Funds will be locked until maturity or early withdrawal</li>
              <li>• Returns are projected and not guaranteed</li>
              <li>• Early withdrawal may incur penalties</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep("input")}
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Back
        </Button>
        <Button
          onClick={handleInvest}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Investment"
          )}
        </Button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
      <div>
        <h4 className="font-semibold text-white mb-2">
          Processing Investment...
        </h4>
        <p className="text-slate-400">
          Please confirm the transaction in your wallet and wait for
          confirmation.
        </p>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-2">
          Investment Successful!
        </h4>
        <p className="text-slate-400">
          Your investment of {formatCurrency(amount)} has been processed
          successfully.
        </p>
      </div>
      <Button
        onClick={handleClose}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        Close
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {step === "input" && "Invest in Pool"}
            {step === "confirm" && "Confirm Investment"}
            {step === "processing" && "Processing Investment"}
            {step === "success" && "Investment Complete"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {step === "input" && `Invest in ${pool.name}`}
            {step === "confirm" && "Please review your investment details"}
            {step === "processing" && "Your investment is being processed"}
            {step === "success" && "Your investment was successful"}
          </DialogDescription>
        </DialogHeader>

        {step === "input" && renderInputStep()}
        {step === "confirm" && renderConfirmStep()}
        {step === "processing" && renderProcessingStep()}
        {step === "success" && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
}
