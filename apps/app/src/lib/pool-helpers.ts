import type { Pool } from "@/lib/api/types";

/**
 * Effective APY for a pool.
 *
 * Single-asset (discounted) pools carry their fixed promised rate as
 * `discountRate` in basis points (e.g. 560 bps = 5.60%). This is the rate the
 * protocol promises and the SPV settles against — used directly, NOT annualized
 * (see spv.service `promisedRatePct`: `discountRate / 100 || projectedAPY`).
 * The backend leaves `analytics.apy` at "0" for these pools, so we read the
 * promised rate straight off the pool record.
 */
export function getEffectiveApy(pool: Pool): {
  apy: number;
  isFixed: boolean;
  hasValue: boolean;
} {
  const isSingleAsset = pool.poolType === "SINGLE_ASSET";
  const isLocked = pool.poolType === "LOCKED";

  // Fixed promised rate for single-asset pools — discountRate (bps) → percent.
  if (isSingleAsset && pool.discountRate != null && pool.discountRate > 0) {
    return { apy: pool.discountRate / 100, isFixed: true, hasValue: true };
  }

  const analyticsApy = pool.analytics?.apy ? parseFloat(pool.analytics.apy) : 0;
  const projected = pool.projectedAPY ? parseFloat(pool.projectedAPY) : 0;
  const apy = analyticsApy > 0 ? analyticsApy : projected > 0 ? projected : 0;

  return { apy, isFixed: isSingleAsset || isLocked, hasValue: apy > 0 };
}

export type DepositAvailability = {
  /** Whether deposits are currently accepted (from off-chain pool state). */
  canDeposit: boolean;
  /** CTA label — the verb when open, the closed reason when not. */
  label: string;
  /** Short human explanation, suitable for a note or tooltip. */
  reason: string;
  /** Coarse state for styling/branching. */
  state: "open" | "filled" | "funding-ended" | "matured" | "closed" | "pending";
};

const TERMINAL_STATUSES = ["MATURED", "WITHDRAWN", "CANCELLED", "EMERGENCY"] as const;
const ACTIVE_STATUSES = ["FUNDING", "PENDING_INVESTMENT", "INVESTED"] as const;

/**
 * Whether a pool accepts deposits right now, derived purely from off-chain
 * state (status + epoch) so it works before a wallet is connected. The deposit
 * form additionally respects on-chain capacity (`maxDeposit`) when connected.
 */
export function getDepositAvailability(pool: Pool): DepositAvailability {
  const status = pool.status;
  const epochEnd = pool.epochEndTime ? new Date(pool.epochEndTime).getTime() : null;
  const epochEnded = epochEnd != null && Date.now() >= epochEnd;

  if ((TERMINAL_STATUSES as readonly string[]).includes(status)) {
    if (status === "MATURED" || status === "WITHDRAWN") {
      return { canDeposit: false, label: "Pool matured", reason: "This pool has matured.", state: "matured" };
    }
    if (status === "CANCELLED") {
      return { canDeposit: false, label: "Pool cancelled", reason: "This pool was cancelled.", state: "closed" };
    }
    return { canDeposit: false, label: "Deposits paused", reason: "Deposits are paused.", state: "closed" };
  }

  if (pool.poolType === "SINGLE_ASSET") {
    if (status === "FILLED") {
      return { canDeposit: false, label: "Pool filled", reason: "Target raise reached — funding is complete.", state: "filled" };
    }
    if (status === "PENDING_INVESTMENT" || status === "INVESTED") {
      return { canDeposit: false, label: "Funding closed", reason: "The funding period has ended.", state: "funding-ended" };
    }
    if (status === "FUNDING") {
      if (epochEnded) {
        return { canDeposit: false, label: "Funding closed", reason: "The funding period has ended.", state: "funding-ended" };
      }
      return { canDeposit: true, label: "Deposit", reason: "Funding is open.", state: "open" };
    }
    return { canDeposit: false, label: "Opening soon", reason: "This pool is being deployed.", state: "pending" };
  }

  if (pool.poolType === "LOCKED") {
    if ((ACTIVE_STATUSES as readonly string[]).includes(status)) {
      return { canDeposit: true, label: "Lock deposit", reason: "Open for new locked deposits.", state: "open" };
    }
    return { canDeposit: false, label: "Deposits closed", reason: "This pool is not accepting deposits.", state: "closed" };
  }

  // STABLE_YIELD — a perpetual vault, open while active.
  if ((ACTIVE_STATUSES as readonly string[]).includes(status)) {
    return { canDeposit: true, label: "Deposit", reason: "Open for deposits.", state: "open" };
  }
  return { canDeposit: false, label: "Deposits closed", reason: "This pool is not accepting deposits.", state: "closed" };
}
