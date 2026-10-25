/**
 * Chains hidden from the investor-facing app.
 *
 * A disabled chain disappears from the network selector and its pools are
 * filtered out of every listing, so it is as though the chain is not supported.
 *
 * What this deliberately does *not* do is remove the chain from the wagmi config
 * in `configs/index.ts`. Someone may already hold a position on a disabled
 * chain, and the wallet still needs to be able to talk to it so they can read
 * and exit that position. Removing the chain definition would strand them.
 *
 * The operator toggle this anticipated now exists: the backend serves `enabled` per
 * network on GET /health/runtime-chains, and `ChainContext` feeds the answer in through
 * `setServedDisabledNetworks`. So the list below is what it said it would become — the
 * fallback for when that call has not answered or failed, which is also what makes the
 * picker work offline rather than emptying.
 */
export const DISABLED_CHAIN_IDS: readonly number[] = [
  5042002, // Arc Testnet
];

/**
 * CAIP-2 ids the backend reports as switched off, or null before it has answered.
 *
 * Module-level rather than context state because `isChainDisabled` is called from plain
 * functions outside the React tree — the product-stripping helpers in `useProductsData`
 * among them — and threading a hook through those would mean rewriting them for no gain.
 */
let servedDisabled: readonly string[] | null = null;

/** Called by ChainContext once the backend has answered. Null resets to the fallback. */
export function setServedDisabledNetworks(networkIds: readonly string[] | null): void {
  servedDisabled = networkIds;
}

/** Whether a network is switched off, by CAIP-2 id. */
export function isNetworkDisabled(networkId?: string | null): boolean {
  if (!networkId) return false;
  if (servedDisabled) return servedDisabled.includes(networkId);
  // No answer yet: fall back to the constant, which only knows EVM chains.
  const chainId = networkId.startsWith("eip155:")
    ? parseInt(networkId.slice("eip155:".length), 10)
    : NaN;
  return Number.isFinite(chainId) && DISABLED_CHAIN_IDS.includes(chainId);
}

export function isChainDisabled(chainId?: number | null): boolean {
  if (chainId === undefined || chainId === null) return false;
  if (servedDisabled) return servedDisabled.includes(`eip155:${chainId}`);
  return DISABLED_CHAIN_IDS.includes(chainId);
}

/** Drops disabled chains from a list of chain ids. */
export function withoutDisabledChains(chainIds?: number[] | null): number[] {
  if (!chainIds) return [];
  return chainIds.filter((id) => !isChainDisabled(id));
}
