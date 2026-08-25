/**
 * Refetch cadences for user- and pool-facing data.
 *
 * A transaction is on-chain within a couple of seconds, but the backend only
 * writes it once its indexer sees it. We push the receipt to the backend the
 * moment it confirms (POST /deposits/confirm), so the bounded wait is the
 * client refetch — hence a 3s poll while anything is unconfirmed, which keeps
 * "signed" to "confirmed on screen" comfortably inside 5 seconds.
 *
 * The resting cadences are deliberately slow: pool and position data barely
 * moves between transactions, and every client polling hard multiplies straight
 * into backend and RPC load.
 */

/** While the user has an unconfirmed transaction on screen. */
export const LIVE_POLL_MS = 3000;

/** Steady state for pool-wide data (transaction ledger, pool stats). */
export const RESTING_POLL_MS = 60000;

/** Steady state for the connected user's own positions. */
export const RESTING_USER_POLL_MS = 30000;
