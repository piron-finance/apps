// API Response Types

export interface PlatformMetrics {
  totalValueLocked: string;
  totalValueLockedFormatted: string;
  tvlChange24h: string;
  tvlChange24hPercentage: number;
  netFlows24h: string;
  averageAPY: number;
  activePools: number;
  totalPools: number;
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  volume24h: string;
  timestamp: string;
}

export interface PoolAnalytics {
  currentAPY: number;
  tvl: string;
  navPerShare?: string;
  uniqueInvestors: number;
  activeInvestors: number;
  totalDeposits: string;
  totalWithdrawals: string;
  netFlow: string;
  volume24h: string;
  volume7d?: string;
  volume30d?: string;
}

export type PoolType = "SINGLE_ASSET" | "STABLE_YIELD" | "LOCKED";
export type PoolStatus = "PENDING_DEPLOYMENT" | "FUNDING" | "INVESTED" | "MATURED" | "CLOSED" | "ACTIVE" | "INACTIVE";

export interface Pool {
  id: string;
  chainId: number;
  poolAddress: string;
  poolType: PoolType;
  name: string;
  description: string | null;

  assetAddress?: string;
  asset?: string;
  assetSymbol: string;
  assetDecimals: number;
  minInvestment?: string;
  minDeposit?: string;
  maxPoolSize?: string;

  status: PoolStatus;
  isActive: boolean;
  isFeatured: boolean;

  // Off-chain metadata
  country: string | null;
  region: string | null;
  issuer: string | null;
  issuerLogo: string | null;
  securityType: string | null;
  riskRating: string | null;
  tags?: string[];

  // Single-asset specific
  targetRaise: string | null;
  epochEndTime: Date | string | null;
  maturityDate: Date | string | null;
  discountRate: number | null;
  fundingDeadline?: Date | string | null;

  // Locked pool specific
  projectedAPY?: string;
  escrowAddress?: string;
  lockTiers?: LockTier[];

  // Analytics (if included)
  analytics?: {
    totalValueLocked: string;
    totalShares?: string;
    navPerShare?: string | null;
    uniqueInvestors?: number;
    totalInvestors?: number;
    apy: string | null;
    utilizationRate?: string;
  } | null;

  // Live blockchain data (optional)
  liveData?: {
    totalAssets: string;
    totalShares: string;
    currentStatus: string;
  };

  // Computed fields for UI (not from backend)
  progressPercentage?: number;
  currentAPY?: number;

  createdAt: Date | string;
  updatedAt: Date | string;
}

// Lock Tier for LOCKED pools
export interface LockTier {
  index: number;
  name: string;
  lockDuration: number;
  lockDurationDays: number;
  interestRate: string;
  interestRatePercent: string;
  minDeposit: string;
  minDepositFormatted: string;
  isActive: boolean;
  totalDeposits?: string;
  depositCount?: number;
}

export interface PoolTiersResponse {
  poolAddress: string;
  tiers: LockTier[];
}

// Locked deposit preview
export interface LockedDepositPreview {
  amount: string;
  amountFormatted: string;
  tierIndex: number;
  lockDuration: number;
  lockDurationDays: number;
  interestRate: string;
  interestRatePercent: string;
  expectedInterest: string;
  expectedInterestFormatted: string;
  maturityTimestamp: number;
  maturityDate: string;
  totalAtMaturity: string;
  totalAtMaturityFormatted: string;
}

// Locked pool live metrics
export interface LockedPoolMetrics {
  poolAddress: string;
  chainId: number;
  totalDeposits: string;
  totalDepositsFormatted: string;
  activePositions: number;
  totalPositionsCreated: number;
  availableLiquidity: string;
  availableLiquidityFormatted: string;
  tiers: {
    index: number;
    lockDuration: number;
    interestRate: number;
    minDeposit: string;
    isActive: boolean;
  }[];
}

// Locked Position
export type LockedPositionStatus = "ACTIVE" | "MATURED" | "REDEEMED" | "EXITED_EARLY";

export interface LockedPosition {
  id: string;
  globalPositionId: number;
  poolAddress: string;
  poolName?: string;
  owner?: string;
  principal: string;
  principalFormatted: string;
  tierIndex: number;
  tierName?: string;
  interestRate: string;
  interestRatePercent: string;
  startTime: number | string;
  startTimeFormatted?: string;
  maturityTime: number | string;
  maturityTimeFormatted?: string;
  maturityDate?: string;
  interestPaymentType: "UPFRONT" | "AT_MATURITY";
  autoRollover: boolean;
  status: LockedPositionStatus;
  accruedInterest?: string;
  accruedInterestFormatted?: string;
  expectedInterest: string;
  expectedInterestFormatted: string;
  expectedTotalInterest?: string;
  expectedTotalInterestFormatted?: string;
  totalAtMaturity?: string;
  totalAtMaturityFormatted?: string;
  canRedeem?: boolean;
  canEarlyExit?: boolean;
  daysRemaining?: number;
  progressPercent?: number;
}

export interface UserLockedPositionsResponse {
  walletAddress: string;
  positions: LockedPosition[];
  summary: {
    totalPrincipal: string;
    totalExpectedInterest: string;
    activePositions: number;
    maturedPositions: number;
  };
}

// Early exit preview
export interface EarlyExitPreview {
  positionId: number;
  principal: string;
  accruedInterest: string;
  timeElapsed: number;
  timeElapsedDays: number;
  timeRemaining: number;
  timeRemainingDays: number;
  earlyExitPenalty: string;
  penaltyPercent: string;
  netReceived: string;
  forfeitedInterest: string;
  recommendation: string;
}

export interface PoolsResponse {
  data: Pool[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PoolFilters {
  poolType?: PoolType;
  type?: PoolType; // alias
  status?: PoolStatus;
  asset?: string;
  isActive?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  country?: string;
  region?: string;
}

export interface UserPosition {
  id: string;
  poolId: string;
  pool: {
    id: string;
    name: string;
    poolType: string;
    poolAddress: string;
    assetSymbol: string;
    status: string;
    apy?: string;
    navPerShare?: string;
    maturityDate?: string;
    country?: string;
    issuer?: string;
  };
  totalShares: string;
  totalDeposited: string;
  totalWithdrawn: string;
  currentValue: string;
  navPerShare?: string;
  totalReturn: string;
  totalReturnPercentage: string;
  unrealizedReturn: string;
  realizedReturn: string;
  couponsClaimed?: string;
  pendingRefund?: string;
  firstDepositTime?: string;
  lastDepositTime?: string;
  lastWithdrawalTime?: string;
  daysHeld?: number;
  lastActivityDate?: string;
  lastActivityType?: "DEPOSIT" | "WITHDRAWAL";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioAnalytics {
  totalValue: string;
  totalValueFormatted: string;
  totalDeposited: string;
  totalReturn: string;
  totalReturnPercentage: string;
  unrealizedReturn: string;
  realizedReturn: string;
  activePositions: number;
  activeLockedPositions: number;
  averageAPY: string;
  lockedPrincipal: string;
  lockedExpectedPayout: string;
}

export interface PortfolioSummary {
  analytics: PortfolioAnalytics;
  positions: UserPosition[];
}

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "INTEREST"
  | "FEE"
  | "REDEEM"
  | "EARLY_EXIT"
  | "ROLLOVER"
  | "COUPON_CLAIM"
  | "MATURITY_CLAIM"
  | "REFUND"
  | "EMERGENCY_WITHDRAWAL"
  | "TRANSFER"
  | "POSITION_CREATED"
  | "POSITION_REDEEMED"
  | "INTEREST_PAYMENT";

export type TransactionStatus = "PENDING" | "CONFIRMED" | "FAILED";

export interface Transaction {
  id: string;
  type: TransactionType;
  txHash: string;
  chainId?: number;
  amount: string;
  shares?: string | null;
  fee?: string | null;
  from?: string | null;
  to?: string | null;
  blockNumber?: string | null;
  blockHash?: string | null;
  gasUsed?: string | null;
  gasPrice?: string | null;
  status: TransactionStatus;
  failureReason?: string | null;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  poolId?: string;
  userWallet?: string; // Pool transactions endpoint returns this
  user?: {
    walletAddress: string;
  };
  pool?: {
    name: string;
    poolAddress: string;
    assetSymbol: string;
  };
}

export interface TransactionFilters {
  poolId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


export interface NAVHistoryPoint {
  timestamp: string;
  navPerShare: string;
  totalNAV: string;
  totalShares: string;
  cashReserves: string;
  instrumentValue: string;
  accruedFees: string;
}

export interface NAVHistoryResponse {
  poolId: string;
  period: string;
  interval: string;
  data: NAVHistoryPoint[];
}

export interface PoolPerformance {
  poolId: string;
  period: string;
  currentAPY: number;
  averageAPY: number;
  maxAPY: number;
  minAPY: number;
  totalReturn: string;
  totalReturnPercentage: number;
  volatility: number;
  sharpeRatio: number;
  deposits: string;
  withdrawals: string;
  netFlow: string;
  uniqueDepositors: number;
  uniqueWithdrawers: number;
}
