// API Response Types

export interface PlatformMetrics {
  totalValueLocked: string;
  totalValueLockedFormatted: string;
  tvlChange24h: string;
  tvlChange24hPercentage: number;
  netFlows24h: string;
  netFlows24hFormatted?: string;
  volume24h: string;
  averageAPY: number;
  activePools: number;
  totalPools: number;
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  /** Populated when metrics are scoped to a specific chain */
  chainId?: number | null;
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
// Mirrors the backend Prisma PoolStatus enum (source of truth).
export type PoolStatus =
  | "PENDING_DEPLOYMENT"
  | "FUNDING"
  | "FILLED"
  | "PENDING_INVESTMENT"
  | "INVESTED"
  | "MATURED"
  | "WITHDRAWN"
  | "EMERGENCY"
  | "CANCELLED";

export interface Pool {
  id: string;
  /**
   * CAIP-2 network identity — the only identity a Stellar or Solana pool has.
   *
   * Optional because a backend deployed before the runtime work does not send it; prefer
   * it over `chainId` wherever both would do.
   */
  networkId?: string;
  /** Which runtime this pool lives on. Served alongside networkId. */
  runtime?: "evm" | "stellar" | "solana";
  /**
   * EVM chain id, or null off EVM.
   *
   * Was `number`, which the backend has never sent for a Stellar or Solana pool — those
   * rows carry null. Declaring it non-nullable meant nothing here was forced to handle
   * the null, and the app typechecked clean while every non-EVM pool rendered with no
   * network marker and `switchChainAsync({ chainId: null })` threw at the wallet.
   */
  chainId: number | null;
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
    /** Single Asset only: amount subscribed during funding. Not the same as TVL. */
    totalRaised?: string | null;
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

// Early exit preview: what leaving a locked position now would pay, in whole tokens.
// Mirrors GET /locked-positions/:id/preview-early-exit field for field.
export interface EarlyExitPreview {
  id: string;
  positionId: number;
  poolAddress: string;
  chainId: number;
  principal: string;
  interest: string;
  interestPayment: "UPFRONT" | "AT_MATURITY";
  daysElapsed: number;
  daysRemaining: number;
  penalty: string;
  /** The rate this position exits at. Its own, fixed at deposit, where the contract fixes one. */
  penaltyPercentage: string;
  proRataInterest: string;
  forfeitedInterest: string;
  estimatedPayout: string;
  /** Set only when the chain could not be read and the figures are an estimate. */
  note?: string;
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

// ── Products (one product = 1..N per-chain pool instances) ────────────────────
// Shares are NOT fungible across chains — `aggregates` is a labeled roll-up,
// `instances` is the per-chain truth (the unit you actually deposit into).
export interface ProductInstance {
  chainId: number;
  poolAddress: string;
  status: string;
  tvl: string;
  apy: number | null;
  navPerShare: string | null;
  assetSymbol: string;
  minInvestment: string;
}

export interface ProductAggregates {
  totalTvl: string;
  /**
   * EVM chain ids of this product's instances.
   *
   * Numeric, so it cannot include a Stellar or Solana instance — a product live on Base
   * and Stellar appeared here as one network. Prefer `networks`.
   */
  chains: number[];
  /** CAIP-2 ids of every network this product is on. Served alongside `chains`. */
  networks?: string[];
  instanceCount: number;
  blendedApy: number | null;
  /** null for SINGLE_ASSET — read statusByChain instead. */
  combinedStatus: string | null;
  statusByChain: Record<number, string>;
}

export interface Product {
  productKey: string;
  name: string;
  description: string | null;
  poolType: PoolType;
  issuer: string | null;
  issuerLogo: string | null;
  securityType: string | null;
  riskRating: string | null;
  country: string | null;
  region: string | null;
  tags: string[];
  isFeatured: boolean;
  synthesized: boolean;
  aggregates: ProductAggregates;
  instances: ProductInstance[];
}

export interface ProductsResponse {
  data: Product[];
}

// ── Instruments (the securities a pool's capital is deployed into) ────────────
// Mirrors the backend `Instrument` model as returned by
// GET /spv/pools/:poolAddress/instruments (public, read-only).
export interface Instrument {
  id: string;
  poolId: string;
  instrumentId: number;
  instrumentType: string;
  purchasePrice: string;
  faceValue: string;
  purchaseDate: string;
  maturityDate: string;
  /** Basis points. */
  annualCouponRate: number | null;
  /** 0=none, 2=semi-annual, 4=quarterly, 12=monthly. */
  couponFrequency: number | null;
  nextCouponDueDate: string | null;
  couponsPaid: number;
  isActive: boolean;
  maturedAt: string | null;
  realizedYield: string | null;
  issuer: string | null;
  cusip: string | null;
  isin: string | null;
  documentUrl: string | null;
  rating: string | null;
}

export interface PoolInstrumentsResponse {
  poolAddress: string;
  poolName: string;
  instruments: Instrument[];
  summary: { total: number; active: number; matured: number };
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
  chainId?: number;
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
  // "floating" = STABLE_YIELD per-share NAV; "none" = no NAV (SINGLE_ASSET/LOCKED), data is empty
  navType: "floating" | "none";
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

/**
 * A network as the backend reports it, from GET /health/runtime-chains.
 *
 * `enabled` is the field that matters here: it is false while a chain is switched off in
 * the admin console, and a chain that is off has no pools to show and takes no deposits,
 * so it should not be offered. Everything else is duplicated in the local registry,
 * which keeps working if this call fails.
 */
export interface NetworkStatus {
  id: string;
  runtime: "evm" | "stellar" | "solana";
  name: string;
  isTestnet: boolean;
  explorerUrl?: string;
  enabled: boolean;
}

/**
 * A transaction the backend built for us to sign, tagged with the runtime that signs it.
 *
 * Discriminated on `runtime` so the shape and the signing path cannot disagree: narrowing
 * on it gives exactly the fields that runtime needs, and a new runtime added to the union
 * makes every switch that does not handle it a type error rather than a silent fallthrough.
 * Mirrors `UnsignedTransaction` in the backend's runtime types.
 */
export type UnsignedTransaction =
  | EvmUnsignedTransaction
  | StellarUnsignedTransaction
  | SolanaUnsignedTransaction;

export interface EvmUnsignedTransaction {
  runtime: "evm";
  networkId: string;
  chainId: number;
  to: string;
  data: string;
  value: string;
}

export interface StellarUnsignedTransaction {
  runtime: "stellar";
  networkId: string;
  /** Base64 transaction envelope, signed whole by Freighter. */
  xdr: string;
  /**
   * The network this envelope was built for.
   *
   * Stellar has no numeric chain id — the passphrase *is* the network identity, and it is
   * mixed into the signature. Signing against the wrong one produces a signature the
   * network rejects, so it travels with the envelope rather than being read from the
   * wallet at signing time.
   */
  networkPassphrase: string;
  /**
   * Unix seconds after which this envelope is dead.
   *
   * A prepared Soroban transaction expires, unlike EVM calldata which is good forever. A
   * quote left on screen for five minutes is no longer submittable, and saying so beats
   * an opaque rejection from the network.
   */
  validUntilTime?: number;
  /** Where to submit. Absent falls back to the public testnet node. */
  rpcUrl?: string;
}

export interface SolanaUnsignedTransaction {
  runtime: "solana";
  networkId: string;
  /** Base64 serialised transaction. */
  transaction: string;
  blockhash: string;
  lastValidBlockHeight: number;
  /** Accounts that must sign. The investor's wallet is one; a client-created account may be another. */
  requiredSigners: string[];
}

/** What `POST /deposits/locked` returns for a Stellar or Solana pool. */
export interface NonEvmLockedDepositQuote {
  transaction: UnsignedTransaction;
  deposit: {
    amount: string;
    amountWei: string;
    depositor: string;
    poolAddress: string;
    poolName: string;
    assetSymbol: string;
    tierIndex: number;
    interestPayment: "UPFRONT" | "AT_MATURITY";
    durationDays: number;
    apyBps: number;
    expectedInterest: string;
    expectedTotal: string;
    lockEndDate: string;
  };
  /** Always false off EVM: neither runtime needs a separate allowance transaction. */
  requiresApproval: boolean;
}
