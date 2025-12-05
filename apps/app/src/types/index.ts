export enum PoolStatus {
  FUNDING = 0,
  PENDING_INVESTMENT = 1,
  INVESTED = 2,
  MATURED = 3,
  EMERGENCY = 4,
}

export enum InstrumentType {
  DISCOUNTED = 0,
  INTEREST_BEARING = 1,
}

export enum RiskLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  EMERGENCY_WITHDRAW = "EMERGENCY_WITHDRAW",
  POOL_CREATION = "POOL_CREATION",
  INVESTMENT_PROCESSED = "INVESTMENT_PROCESSED",
  COUPON_PAYMENT = "COUPON_PAYMENT",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  SPV = "SPV",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Pool {
  _id: string;
  contractAddress: string;
  managerAddress: string;
  escrowAddress: string;
  name: string;
  symbol?: string;
  image?: string;
  asset?: string;
  instrumentType: InstrumentType;
  status: PoolStatus;
  targetRaise: string;
  totalRaised: string;
  totalInvestors?: number;
  actualInvested?: string;
  discountRate?: number;
  couponRates?: number[];
  couponDates?: number[];
  epochEndTime: number;
  maturityDate: number;
  issuer: string;
  riskLevel: RiskLevel;
  minInvestment: string;
  description?: string;
  createdBy: string;
  approvedBy?: string;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserPosition {
  _id: string;
  userId: string;
  poolId: string;
  contractAddress: string;
  sharesOwned: string;
  assetsDeposited: string;
  depositTime: number;
  currentValue: string;
  expectedReturn: string;
  discountEarned?: string;
  lastTransactionHash?: string;
  createdAt: number;
  updatedAt: number;
  pool?: Pool;
}

export interface Transaction {
  _id: string;
  userId: string;
  poolId: string;
  type: TransactionType;
  amount: string;
  shares?: string;
  txHash: string;
  blockNumber: number;
  status: TransactionStatus;
  createdAt: number;
  pool?: Pool;
}

export interface User {
  _id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  image?: string;
  role: UserRole;
  permissions?: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PoolConfig {
  targetRaise: string;
  epochEndTime: number;
  maturityDate: number;
  discountRate?: number;
  instrumentType: InstrumentType;
  couponDates?: number[];
  couponRates?: number[];
  issuer: string;
  riskLevel: RiskLevel;
  minInvestment: string;
  description?: string;
}

export interface PoolMetrics {
  totalValueLocked: string;
  totalPools: number;
  activePools: number;
  totalUsers: number;
  totalReturns: string;
  averageAPY: number;
}

export interface UserPortfolio {
  totalInvested: string;
  currentValue: string;
  totalReturns: string;
  positions: UserPosition[];
  pendingCoupons: string;
  availableForWithdrawal: string;
}

export interface CouponPayment {
  poolId: string;
  userId: string;
  amount: string;
  couponDate: number;
  claimed: boolean;
  claimedAt?: number;
  txHash?: string;
}

export interface PoolAnalytics {
  fundingProgress: number;
  timeRemaining: number;
  totalInvestors: number;
  averageInvestment: string;
  projectedReturns: string;
  riskScore: number;
}

export interface SPVDashboard {
  pendingWithdrawals: Pool[];
  pendingInvestments: Pool[];
  pendingCoupons: Pool[];
  totalFundsManaged: string;
  activeInvestments: number;
}

export interface AdminDashboard {
  pendingApprovals: Pool[];
  totalPools: number;
  totalTVL: string;
  systemHealth: {
    activeUsers: number;
    failedTransactions: number;
    poolsNeedingAttention: number;
  };
}
