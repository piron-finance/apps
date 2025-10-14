import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PoolStatus, InstrumentType, RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: string | number | bigint,
  currency: string = "USD",
  decimals: number = 2
): string {
  const numAmount =
    typeof amount === "string" ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numAmount);
}

export function formatNumber(
  amount: string | number | bigint,
  decimals: number = 2
): string {
  const numAmount =
    typeof amount === "string" ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numAmount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatTimeRemaining(epochEndTime: number): string {
  const now = Date.now();
  const timeLeft = epochEndTime - now;

  if (timeLeft <= 0) return "Ended";

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateFundingProgress(
  totalRaised: string,
  targetRaise: string
): number {
  const raised = parseFloat(totalRaised);
  const target = parseFloat(targetRaise);
  return target > 0 ? (raised / target) * 100 : 0;
}

export function calculateAPY(
  currentValue: string,
  initialInvestment: string,
  daysInvested: number
): number {
  const current = parseFloat(currentValue);
  const initial = parseFloat(initialInvestment);
  const years = daysInvested / 365;

  if (initial === 0 || years === 0) return 0;

  return ((current / initial) ** (1 / years) - 1) * 100;
}

export function calculateExpectedReturn(
  investment: string,
  discountRate?: number,
  couponRates?: number[],
  instrumentType?: InstrumentType
): string {
  const amount = parseFloat(investment);

  if (instrumentType === InstrumentType.DISCOUNTED && discountRate) {
    const discount = (discountRate / 10000) * amount;
    return (amount + discount).toString();
  }

  if (instrumentType === InstrumentType.INTEREST_BEARING && couponRates) {
    const totalCouponRate = couponRates.reduce((sum, rate) => sum + rate, 0);
    const totalReturn = (totalCouponRate / 10000) * amount;
    return (amount + totalReturn).toString();
  }

  return investment;
}

export function getPoolStatusColor(status: PoolStatus | string): string {
  const statusString =
    typeof status === "string"
      ? status
      : status === PoolStatus.FUNDING
        ? "FUNDING"
        : status === PoolStatus.PENDING_INVESTMENT
          ? "PENDING_INVESTMENT"
          : status === PoolStatus.INVESTED
            ? "INVESTED"
            : status === PoolStatus.MATURED
              ? "MATURED"
              : status === PoolStatus.EMERGENCY
                ? "EMERGENCY"
                : "UNKNOWN";

  switch (statusString) {
    case "FUNDING":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "PENDING_INVESTMENT":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "INVESTED":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "MATURED":
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    case "EMERGENCY":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
}

export function getPoolStatusLabel(status: PoolStatus | string): string {
  const statusString =
    typeof status === "string"
      ? status
      : status === PoolStatus.FUNDING
        ? "FUNDING"
        : status === PoolStatus.PENDING_INVESTMENT
          ? "PENDING_INVESTMENT"
          : status === PoolStatus.INVESTED
            ? "INVESTED"
            : status === PoolStatus.MATURED
              ? "MATURED"
              : status === PoolStatus.EMERGENCY
                ? "EMERGENCY"
                : "UNKNOWN";

  switch (statusString) {
    case "FUNDING":
      return "Funding";
    case "PENDING_INVESTMENT":
      return "Pending Investment";
    case "INVESTED":
      return "Invested";
    case "MATURED":
      return "Matured";
    case "EMERGENCY":
      return "Emergency";
    default:
      return "Unknown";
  }
}

export function getRiskLevelColor(riskLevel: RiskLevel | string): string {
  const riskString =
    typeof riskLevel === "string"
      ? riskLevel
      : riskLevel === RiskLevel.LOW
        ? "LOW"
        : riskLevel === RiskLevel.MEDIUM
          ? "MEDIUM"
          : riskLevel === RiskLevel.HIGH
            ? "HIGH"
            : "UNKNOWN";

  switch (riskString) {
    case "LOW":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "MEDIUM":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "HIGH":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
}

export function getInstrumentTypeLabel(type: InstrumentType | string): string {
  const typeString =
    typeof type === "string"
      ? type
      : type === InstrumentType.DISCOUNTED
        ? "DISCOUNTED"
        : type === InstrumentType.INTEREST_BEARING
          ? "INTEREST_BEARING"
          : "UNKNOWN";

  switch (typeString) {
    case "DISCOUNTED":
      return "Discounted";
    case "INTEREST_BEARING":
      return "Interest Bearing";
    default:
      return "Unknown";
  }
}

export function truncateAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function isPoolActive(pool: {
  status: PoolStatus | string;
  epochEndTime: number;
  maturityDate: number;
}): boolean {
  const now = Date.now();
  const statusString =
    typeof pool.status === "string"
      ? pool.status
      : pool.status === PoolStatus.FUNDING
        ? "FUNDING"
        : pool.status === PoolStatus.PENDING_INVESTMENT
          ? "PENDING_INVESTMENT"
          : pool.status === PoolStatus.INVESTED
            ? "INVESTED"
            : pool.status === PoolStatus.MATURED
              ? "MATURED"
              : pool.status === PoolStatus.EMERGENCY
                ? "EMERGENCY"
                : "UNKNOWN";

  return (
    (statusString === "FUNDING" && now < pool.epochEndTime) ||
    (statusString === "INVESTED" && now < pool.maturityDate) ||
    statusString === "PENDING_INVESTMENT"
  );
}

export function canUserWithdraw(pool: {
  status: PoolStatus | string;
  maturityDate: number;
}): boolean {
  const now = Date.now();
  const statusString =
    typeof pool.status === "string"
      ? pool.status
      : pool.status === PoolStatus.FUNDING
        ? "FUNDING"
        : pool.status === PoolStatus.PENDING_INVESTMENT
          ? "PENDING_INVESTMENT"
          : pool.status === PoolStatus.INVESTED
            ? "INVESTED"
            : pool.status === PoolStatus.MATURED
              ? "MATURED"
              : pool.status === PoolStatus.EMERGENCY
                ? "EMERGENCY"
                : "UNKNOWN";

  return (
    statusString === "FUNDING" ||
    statusString === "INVESTED" ||
    (statusString === "MATURED" && now >= pool.maturityDate) ||
    statusString === "EMERGENCY"
  );
}

export function getWithdrawalPenalty(pool: { status: PoolStatus }): number {
  if (pool.status === PoolStatus.INVESTED) {
    return 2; // 2% penalty for early withdrawal
  }
  return 0;
}

export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateAmount(
  amount: string,
  minAmount?: string
): { isValid: boolean; error?: string } {
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: "Amount must be a positive number" };
  }

  if (minAmount && numAmount < parseFloat(minAmount)) {
    return {
      isValid: false,
      error: `Amount must be at least ${formatCurrency(minAmount)}`,
    };
  }

  return { isValid: true };
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
