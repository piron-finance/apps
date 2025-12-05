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
   * Get pool by ID
   */
  getById: async (id: string): Promise<Pool> => {
    const { data } = await apiClient.get(`/pools/${id}`);
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
   * Get pool performance metrics
   */
  getPerformance: async (
    id: string,
    period: string = "30d"
  ): Promise<PoolPerformance> => {
    const { data } = await apiClient.get(`/pools/${id}/performance`, {
      params: { period },
    });
    return data;
  },

  /**
   * Get pool instruments
   */
  getInstruments: async (id: string) => {
    const { data } = await apiClient.get(`/pools/${id}/instruments`);
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
   * Get all user positions
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
// WITHDRAWALS APIs
// ============================================================================

export const withdrawalsApi = {
  /**
   * Get pool withdrawal requests
   */
  getPoolRequests: async (poolId: string) => {
    const { data } = await apiClient.get(
      `/pools/${poolId}/withdrawal-requests`
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
