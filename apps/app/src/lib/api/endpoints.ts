import { apiClient } from "./client";
import type {
  PlatformMetrics,
  PoolsResponse,
  Pool,
  PoolFilters,
  PortfolioSummary,
  UserPosition,
  Transaction,
  TransactionsResponse,
  TransactionFilters,
  KYCStatus,
  NAVHistoryResponse,
  PoolPerformance,
  PoolTiersResponse,
  LockedDepositPreview,
  LockedPoolMetrics,
  LockedPosition,
  UserLockedPositionsResponse,
  EarlyExitPreview,
} from "./types";

// ============================================================================
// PLATFORM APIs
// ============================================================================

export const platformApi = {
  /**
   * Get platform-wide metrics
   */
  getMetrics: async (): Promise<PlatformMetrics> => {
    const { data } = await apiClient.get("/platform/metrics");
    return data;
  },
};

// ============================================================================
// POOLS APIs
// ============================================================================

export const poolsApi = {
  /**
   * Get all pools with filtering
   */
  getAll: async (filters?: PoolFilters): Promise<PoolsResponse> => {
    const { data } = await apiClient.get("/pools", { params: filters });
    return data;
  },

  /**
   * Get featured pools
   */
  getFeatured: async (): Promise<PoolsResponse> => {
    const { data } = await apiClient.get("/pools/featured");
    return data;
  },

  /**
   * Get pool by ID/address
   */
  getById: async (id: string): Promise<Pool> => {
    const { data } = await apiClient.get(`/pools/${id}`);
    return data;
  },

  /**
   * Get pool stats
   */
  getStats: async (poolAddress: string) => {
    const { data } = await apiClient.get(`/pools/${poolAddress}/stats`);
    return data;
  },

  /**
   * Get pool analytics
   */
  getAnalytics: async (id: string) => {
    const { data } = await apiClient.get(`/pools/${id}/analytics`);
    return data;
  },

  /**
   * Get NAV history for charts
   */
  getNavHistory: async (
    id: string,
    period: string = "30d",
    interval: string = "daily"
  ): Promise<NAVHistoryResponse> => {
    const { data } = await apiClient.get(`/pools/${id}/nav-history`, {
      params: { period, interval },
    });
    return data;
  },

  /**
   * Get pool performance metrics (uses stats endpoint)
   */
  getPerformance: async (
    id: string,
    period: string = "30d"
  ): Promise<PoolPerformance> => {
    const { data } = await apiClient.get(`/pools/${id}/stats`, {
      params: { period },
    });
    return data;
  },

  /**
   * Get pool instruments
   */
  getInstruments: async (id: string) => {
    const { data } = await apiClient.get(`/spv/pools/${id}/instruments`);
    return data;
  },

  /**
   * Get lock tiers for a locked pool
   */
  getTiers: async (poolAddress: string): Promise<PoolTiersResponse> => {
    const { data } = await apiClient.get(`/pools/${poolAddress}/tiers`);
    return data;
  },

  /**
   * Get locked pool live metrics from blockchain
   */
  getLockedMetrics: async (
    chainId: number,
    poolAddress: string
  ): Promise<LockedPoolMetrics> => {
    const { data } = await apiClient.get(
      `/pools/${chainId}/${poolAddress}/locked-metrics`
    );
    return data;
  },

  /**
   * Preview a locked deposit
   */
  previewLockedDeposit: async (
    chainId: number,
    poolAddress: string,
    amount: string,
    tierIndex: number
  ): Promise<LockedDepositPreview> => {
    const { data } = await apiClient.get(
      `/pools/${chainId}/${poolAddress}/preview-locked`,
      { params: { amount, tierIndex } }
    );
    return data;
  },
};

// ============================================================================
// USERS APIs
// ============================================================================

export const usersApi = {
  /**
   * Get user profile
   */
  getProfile: async (walletAddress: string) => {
    const { data } = await apiClient.get(`/users/${walletAddress}`);
    return data;
  },

  /**
   * Get KYC status
   */
  getKYCStatus: async (walletAddress: string): Promise<KYCStatus> => {
    const { data } = await apiClient.get(`/users/${walletAddress}/kyc-status`);
    return data;
  },

  /**
   * Submit KYC document
   */
  submitKYC: async (walletAddress: string, kycData: any) => {
    const { data } = await apiClient.post(
      `/users/${walletAddress}/kyc`,
      kycData
    );
    return data;
  },

  /**
   * Get all user positions (regular + locked)
   */
  getPositions: async (walletAddress: string): Promise<PortfolioSummary> => {
    const { data } = await apiClient.get(`/users/${walletAddress}/positions`);
    return data;
  },

  /**
   * Get user position in specific pool
   */
  getPositionInPool: async (
    walletAddress: string,
    poolId: string
  ): Promise<UserPosition> => {
    const { data } = await apiClient.get(
      `/users/${walletAddress}/positions/${poolId}`
    );
    return data;
  },

  /**
   * Get user's locked positions
   */
  getLockedPositions: async (
    walletAddress: string
  ): Promise<UserLockedPositionsResponse> => {
    const { data } = await apiClient.get(
      `/users/${walletAddress}/locked-positions`
    );
    return data;
  },

  /**
   * Get user transactions
   */
  getTransactions: async (
    walletAddress: string,
    params?: any
  ): Promise<TransactionsResponse> => {
    const { data } = await apiClient.get(
      `/users/${walletAddress}/transactions`,
      { params }
    );
    return data;
  },
};

// ============================================================================
// NOTIFICATIONS APIs
// ============================================================================

export const notificationsApi = {
  /**
   * Get user notifications
   */
  getAll: async (walletAddress: string, params?: any) => {
    const { data } = await apiClient.get(
      `/users/${walletAddress}/notifications`,
      { params }
    );
    return data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (walletAddress: string, notificationId: string) => {
    const { data } = await apiClient.patch(
      `/users/${walletAddress}/notifications/${notificationId}/read`
    );
    return data;
  },
};

// ============================================================================
// FEES APIs
// ============================================================================

export const feesApi = {
  /**
   * Get pool deposit fee
   */
  getPoolFee: async (poolAddress: string) => {
    const { data } = await apiClient.get(`/fees/pool/${poolAddress}`);
    return data;
  },

  /**
   * Get all pool fee rates
   */
  getPoolRates: async (poolAddress: string) => {
    const { data } = await apiClient.get(`/fees/pool/${poolAddress}/rates`);
    return data;
  },

  /**
   * Calculate deposit fee for amount
   */
  calculate: async (poolAddress: string, amount: string) => {
    const { data } = await apiClient.get("/fees/calculate", {
      params: { poolAddress, amount },
    });
    return data;
  },

  /**
   * Get fee splits configuration
   */
  getSplits: async (chainId?: number) => {
    const { data } = await apiClient.get("/fees/splits", {
      params: chainId ? { chainId } : undefined,
    });
    return data;
  },
};

// ============================================================================
// FIAT APIs
// ============================================================================

export const fiatApi = {
  /**
   * Initiate fiat deposit
   */
  deposit: async (depositData: {
    fiatAmount: number;
    fiatCurrency: string;
    cryptoAsset: string;
  }) => {
    const { data } = await apiClient.post("/fiat/deposit", depositData);
    return data;
  },

  /**
   * Get fiat transaction status
   */
  getTransaction: async (reference: string) => {
    const { data } = await apiClient.get(`/fiat/transactions/${reference}`);
    return data;
  },
};

/**
 * Pool Deposit - Build deposit transaction
 */
export const buildDepositTransaction = async (depositData: {
  poolAddress: string;
  amount: string;
  receiver: string;
}) => {
  const { data } = await apiClient.post("/deposits", depositData);
  return data;
};

/**
 * Build locked deposit transaction
 */
export const buildLockedDepositTransaction = async (depositData: {
  poolAddress: string;
  amount: string;
  receiver: string;
  tierIndex: number;
  interestPayment?: "UPFRONT" | "AT_MATURITY";
}) => {
  const { data } = await apiClient.post("/deposits/locked", depositData);
  return data;
};

// ============================================================================
// LOCKED POSITIONS APIs
// ============================================================================

export const lockedPositionsApi = {
  /**
   * Get locked position by ID
   */
  getById: async (positionId: number): Promise<LockedPosition> => {
    const { data } = await apiClient.get(`/locked-positions/${positionId}`);
    return data;
  },

  /**
   * Preview early exit from locked position
   */
  previewEarlyExit: async (positionId: number): Promise<EarlyExitPreview> => {
    const { data } = await apiClient.get(
      `/locked-positions/${positionId}/preview-early-exit`
    );
    return data;
  },
};

// ============================================================================
// WITHDRAWALS APIs
// ============================================================================

export const withdrawalsApi = {
  /**
   * Get pool withdrawal requests for a user
   */
  getPoolRequests: async (poolId: string, userAddress: string) => {
    const { data } = await apiClient.get(
      `/spv/pools/${poolId}/withdrawal-requests/${userAddress}`
    );
    return data;
  },

  /**
   * Get user withdrawal requests
   */
  getUserRequests: async (walletAddress: string) => {
    const { data } = await apiClient.get(
      `/users/${walletAddress}/withdrawal-requests`
    );
    return data;
  },

  /**
   * Build withdrawal transaction
   */
  buildWithdrawal: async (withdrawalData: {
    poolAddress: string;
    amount: string;
    receiver: string;
  }) => {
    const { data } = await apiClient.post("/withdrawals", withdrawalData);
    return data;
  },

  /**
   * Redeem matured locked position
   */
  redeemMatured: async (redeemData: {
    positionId: number;
    poolAddress: string;
  }) => {
    const { data } = await apiClient.post("/withdrawals/redeem", redeemData);
    return data;
  },

  /**
   * Early exit from locked position
   */
  earlyExit: async (exitData: { positionId: number; poolAddress: string }) => {
    const { data } = await apiClient.post("/withdrawals/early-exit", exitData);
    return data;
  },

  /**
   * Set auto-rollover for locked position
   */
  setAutoRollover: async (rolloverData: {
    positionId: number;
    poolAddress: string;
    newTierIndex?: number;
  }) => {
    const { data } = await apiClient.post(
      "/withdrawals/auto-rollover",
      rolloverData
    );
    return data;
  },

  /**
   * Transfer locked position to another address
   */
  transferPosition: async (transferData: {
    positionId: number;
    poolAddress: string;
    toAddress: string;
  }) => {
    const { data } = await apiClient.post(
      "/withdrawals/transfer-position",
      transferData
    );
    return data;
  },

  /**
   * Get withdrawal queue status
   */
  getQueueStatus: async (poolAddress: string, userAddress: string) => {
    const { data } = await apiClient.get("/withdrawals/queue-status", {
      params: { poolAddress, userAddress },
    });
    return data;
  },

  /**
   * Preview withdrawal
   */
  preview: async (poolAddress: string, amount: string, userAddress: string) => {
    const { data } = await apiClient.get("/withdrawals/preview", {
      params: { poolAddress, amount, userAddress },
    });
    return data;
  },
};

// ============================================================================
// TRANSACTION APIs
// ============================================================================

export const transactionsApi = {
  /**
   * Get all transactions for a specific pool
   */
  getPoolTransactions: async (
    poolAddress: string,
    params?: { page?: number; limit?: number }
  ): Promise<TransactionsResponse> => {
    const { data } = await apiClient.get(`/pools/${poolAddress}/transactions`, {
      params,
    });
    return data;
  },

  /**
   * Get all transactions for a specific user/wallet
   */
  getUserTransactions: async (
    walletAddress: string,
    filters?: TransactionFilters
  ): Promise<TransactionsResponse> => {
    const { data } = await apiClient.get(
      `/users/${walletAddress}/transactions`,
      { params: filters }
    );
    return data;
  },

  /**
   * Get details of a specific transaction by hash
   */
  getTransactionByHash: async (txHash: string): Promise<Transaction> => {
    const { data } = await apiClient.get(`/transactions/${txHash}`);
    return data;
  },
};
