"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Optimistic ledger of transactions the user has just signed.
 *
 * On-chain confirmation is near-instant, but the backend only learns about a
 * transaction when its indexer next polls the chain (12s in BURST, 60s in
 * NORMAL). Between those two moments the API still returns the pre-deposit
 * state, so without this store the user sees nothing happen and reaches for
 * refresh.
 *
 * A record is added the moment the wallet returns a hash, rendered with a
 * "Pending" tag, and dropped as soon as the backend returns a transaction with
 * the same hash — at which point the confirmed row takes its place.
 */

export type PendingTxType =
  | "DEPOSIT"
  | "POSITION_CREATED"
  | "WITHDRAWAL"
  | "POSITION_REDEEMED"
  | "EARLY_EXIT";

export interface PendingTx {
  txHash: string;
  chainId: number;
  /** Lowercased pool address the transaction targets. */
  poolAddress: string;
  /** Lowercased wallet that signed it. */
  userAddress: string;
  type: PendingTxType;
  /** Token-denominated amount, or null when the action has no amount (e.g. redeem-all). */
  amount: string | null;
  submittedAt: number;
  /** Set once the receipt lands; until then the row reads "Submitted". */
  minedAt?: number;
}

/**
 * A pending row is dropped after this long even if the backend never reports it.
 * Covers dropped, replaced, and reverted transactions, which produce no
 * indexed record and would otherwise leave a permanent phantom row.
 */
const PENDING_TTL_MS = 3 * 60 * 1000;

const STORAGE_KEY = "piron.pendingTx.v1";

interface PendingTxContextValue {
  /** Every non-expired pending transaction. */
  pending: PendingTx[];
  /** True while anything is unconfirmed — query hooks poll fast while this holds. */
  hasPending: boolean;
  add: (tx: Omit<PendingTx, "submittedAt">) => void;
  /** Marks a transaction as mined on-chain, while still awaiting the backend. */
  markMined: (txHash: string) => void;
  /** Pending rows for one pool, newest first. */
  pendingForPool: (poolAddress?: string) => PendingTx[];
  /**
   * Drops any pending row whose hash the backend has now indexed. Safe to call
   * on every render with the hashes currently on screen.
   */
  reconcile: (indexedTxHashes: Array<string | undefined | null>) => void;
}

const PendingTxContext = createContext<PendingTxContextValue | undefined>(undefined);

function readStored(): PendingTx[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingTx[];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - PENDING_TTL_MS;
    return parsed.filter((t) => t && typeof t.txHash === "string" && t.submittedAt > cutoff);
  } catch {
    return [];
  }
}

export function PendingTxProvider({ children }: { children: React.ReactNode }) {
  // Starts empty so the server and first client render agree; stored rows are
  // rehydrated in the effect below.
  const [pending, setPending] = useState<PendingTx[]>([]);

  useEffect(() => {
    const stored = readStored();
    if (stored.length > 0) setPending(stored);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
    } catch {
      // sessionStorage can be unavailable (private mode, quota) — the store
      // still works in memory, it just won't survive a reload.
    }
  }, [pending]);

  // Sweep expired rows so a dropped or reverted transaction can't sit there
  // forever. Only runs while something is actually pending.
  useEffect(() => {
    if (pending.length === 0) return;
    const timer = setInterval(() => {
      const cutoff = Date.now() - PENDING_TTL_MS;
      setPending((prev) => {
        const next = prev.filter((t) => t.submittedAt > cutoff);
        return next.length === prev.length ? prev : next;
      });
    }, 15000);
    return () => clearInterval(timer);
  }, [pending.length]);

  const add = useCallback((tx: Omit<PendingTx, "submittedAt">) => {
    const hash = tx.txHash.toLowerCase();
    setPending((prev) => {
      if (prev.some((t) => t.txHash.toLowerCase() === hash)) return prev;
      return [
        {
          ...tx,
          txHash: hash,
          poolAddress: tx.poolAddress.toLowerCase(),
          userAddress: tx.userAddress.toLowerCase(),
          submittedAt: Date.now(),
        },
        ...prev,
      ];
    });
  }, []);

  const markMined = useCallback((txHash: string) => {
    const hash = txHash.toLowerCase();
    setPending((prev) => {
      let changed = false;
      const next = prev.map((t) => {
        if (t.txHash === hash && !t.minedAt) {
          changed = true;
          return { ...t, minedAt: Date.now() };
        }
        return t;
      });
      return changed ? next : prev;
    });
  }, []);

  const reconcile = useCallback((indexedTxHashes: Array<string | undefined | null>) => {
    const indexed = new Set(
      indexedTxHashes.filter((h): h is string => typeof h === "string" && h.length > 0).map((h) => h.toLowerCase())
    );
    if (indexed.size === 0) return;
    setPending((prev) => {
      const next = prev.filter((t) => !indexed.has(t.txHash));
      return next.length === prev.length ? prev : next;
    });
  }, []);

  const pendingForPool = useCallback(
    (poolAddress?: string) => {
      if (!poolAddress) return [];
      const target = poolAddress.toLowerCase();
      return pending
        .filter((t) => t.poolAddress === target)
        .sort((a, b) => b.submittedAt - a.submittedAt);
    },
    [pending]
  );

  const value = useMemo<PendingTxContextValue>(
    () => ({
      pending,
      hasPending: pending.length > 0,
      add,
      markMined,
      pendingForPool,
      reconcile,
    }),
    [pending, add, markMined, pendingForPool, reconcile]
  );

  return <PendingTxContext.Provider value={value}>{children}</PendingTxContext.Provider>;
}

export function usePendingTx(): PendingTxContextValue {
  const ctx = useContext(PendingTxContext);
  if (!ctx) throw new Error("usePendingTx must be used within a PendingTxProvider");
  return ctx;
}

/**
 * True while any transaction is awaiting backend indexing. Query hooks read this
 * to drop to a ~3s poll instead of their resting 30–60s cadence.
 *
 * Returns false outside the provider so query hooks stay usable in isolation
 * (tests, storybook) without the whole app tree.
 */
export function useHasPendingTx(): boolean {
  return useContext(PendingTxContext)?.hasPending ?? false;
}

/**
 * Drops pending rows that the given server payload has now indexed. Pass the
 * transaction hashes currently returned by the API.
 */
export function useReconcilePending(indexedTxHashes: Array<string | undefined | null>) {
  const ctx = useContext(PendingTxContext);
  const reconcile = ctx?.reconcile;
  // Compare by value — the caller almost always builds a fresh array each render.
  const key = indexedTxHashes.filter(Boolean).join(",");
  const latest = useRef(indexedTxHashes);
  latest.current = indexedTxHashes;

  useEffect(() => {
    reconcile?.(latest.current);
  }, [key, reconcile]);
}
