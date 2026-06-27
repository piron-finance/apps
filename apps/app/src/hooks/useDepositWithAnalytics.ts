/**
 * useDepositWithAnalytics
 *
 * Thin decorator over useDeposit — adds PostHog funnel event captures.
 * The underlying useDeposit business logic is untouched.
 *
 * Decorator pattern: call sites swap `useDeposit` → `useDepositWithAnalytics`
 * and get identical return types plus silent analytics side-effects.
 *
 * Events captured (8 funnel stages):
 *   pool_viewed             — call capturePoolView() from pool detail page useEffect
 *   deposit_modal_opened    — call captureModalOpen() from modal onOpenChange
 *   deposit_amount_entered  — call captureAmountEntered() debounced from input
 *   deposit_approve_started — wraps approve()
 *   deposit_approve_success — wraps approve() resolve
 *   deposit_tx_submitted    — wraps deposit() preamble
 *   deposit_tx_confirmed    — wraps deposit() resolve
 *   deposit_tx_failed       — wraps deposit() catch
 *
 * Privacy:
 *   - No wallet address, full tx hash, raw amount, KYC status
 *   - tx_prefix = first 10 chars of hash only (non-identifying)
 *   - pool_type + chain_id only (no pool_address — too identifying for aggregate funnel)
 */

import { useCallback } from "react";
import posthog from "posthog-js";
import { useDeposit } from "./useDeposit";
import type { Pool } from "@/lib/api/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function capture(event: string, props: Record<string, unknown> = {}) {
  // posthog is a no-op if not initialised (NEXT_PUBLIC_POSTHOG_KEY not set)
  try { posthog.capture(event, props); } catch { /* silently ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Module-level side-effect helpers (not tied to the hook instance)
// ─────────────────────────────────────────────────────────────────────────────

/** Call from pool detail page useEffect when the pool detail mounts. */
export function capturePoolView(pool: Pick<Pool, "poolType" | "chainId">) {
  capture("pool_viewed", { pool_type: pool.poolType, chain_id: pool.chainId });
}

/** Call from deposit modal onOpenChange(true). */
export function captureModalOpen(pool: Pick<Pool, "poolType" | "chainId">) {
  capture("deposit_modal_opened", { pool_type: pool.poolType, chain_id: pool.chainId });
}

/** Call from debounced deposit amount input handler (fires once, not on every keystroke). */
export function captureAmountEntered(pool: Pick<Pool, "poolType">) {
  capture("deposit_amount_entered", { pool_type: pool.poolType });
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useDepositWithAnalytics(pool?: Pool) {
  const base = useDeposit(pool);

  const poolProps = pool
    ? { pool_type: pool.poolType, chain_id: pool.chainId }
    : {};

  // ── approve ────────────────────────────────────────────────────────────────
  const approve = useCallback(
    async (amount: string): Promise<`0x${string}`> => {
      capture("deposit_approve_started", poolProps);
      const hash = await base.approve(amount);
      capture("deposit_approve_success", poolProps);
      return hash;
    },
    [base.approve, pool?.poolType, pool?.chainId],
  );

  // ── deposit ────────────────────────────────────────────────────────────────
  const deposit = useCallback(
    async (
      amount: string,
      tierIndex?: number,
      interestPayment?: "UPFRONT" | "AT_MATURITY",
    ): Promise<`0x${string}`> => {
      capture("deposit_tx_submitted", {
        ...poolProps,
        has_tier: tierIndex !== undefined,
      });
      try {
        const hash = await base.deposit(amount, tierIndex, interestPayment);
        capture("deposit_tx_confirmed", {
          ...poolProps,
          tx_prefix: hash?.slice(0, 10) ?? null, // first 10 chars only
        });
        return hash;
      } catch (err) {
        capture("deposit_tx_failed", {
          ...poolProps,
          failure_stage: "tx",
        });
        throw err;
      }
    },
    [base.deposit, pool?.poolType, pool?.chainId],
  );

  return {
    ...base,
    approve,
    deposit,
  };
}
