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

export interface Pool {
  id: string;
  chainId: number;
  poolAddress: string;
  poolType: "SINGLE_ASSET" | "STABLE_YIELD";
  name: string;
  description: string | null;

  assetAddress: string;
  assetSymbol: string;
  assetDecimals: number;
  minInvestment: string;

  status: "ACTIVE" | "INACTIVE" | "CLOSED" | "MATURED";
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

  // Analytics (if included)
  analytics?: {
    totalValueLocked: string;
    totalShares: string;
    navPerShare: string | null;
    uniqueInvestors: number;
    apy: string | null;
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
  type?: "SINGLE_ASSET" | "STABLE_YIELD";
  status?: "ACTIVE" | "INACTIVE" | "CLOSED" | "MATURED";
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
    assetSymbol: string;
    status: string;
  };
  totalShares: string;
  totalDeposited: string;
  totalWithdrawn: string;
  currentValue: string;
  navPerShare?: string;
  totalReturn: string;
  totalReturnPercentage: number;
  unrealizedReturn: string;
  realizedReturn: string;
  couponsClaimed?: string;
  pendingRefund?: string;
  firstDepositTime?: string;
  lastDepositTime?: string;
  lastWithdrawalTime?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  totalValue: string;
  totalDeposited: string;
  totalReturn: string;
  totalReturnPercentage: number;
  unrealizedReturn: string;
  realizedReturn: string;
  positions: UserPosition[];
}

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  shares?: string;
  fee?: string;
  txHash: string;
  status: string;
  poolId?: string;
  pool?: {
    name: string;
    assetSymbol: string;
  };
  from?: string;
  to?: string;
  blockNumber: string;
  gasUsed?: string;
  timestamp: string;
  createdAt: string;
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

export interface KYCStatus {
  kycStatus: string;
  kycLevel?: string;
  documentsRequired: string[];
  documentsSubmitted: any[];
  canInvest: boolean;
  investmentLimits?: {
    daily?: string;
    monthly?: string;
    total?: string;
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
