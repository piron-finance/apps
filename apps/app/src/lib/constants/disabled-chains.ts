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
 * This is the stopgap version: a constant, changed by deploying. The intended
 * replacement is an operator toggle in the internal admin app, writing a flag the
 * backend serves, so a chain can be pulled without a release. When that lands,
 * this list becomes the fallback for when that call fails.
 */
export const DISABLED_CHAIN_IDS: readonly number[] = [
  5042002, // Arc Testnet
];

export function isChainDisabled(chainId?: number | null): boolean {
  if (chainId === undefined || chainId === null) return false;
  return DISABLED_CHAIN_IDS.includes(chainId);
}

/** Drops disabled chains from a list of chain ids. */
export function withoutDisabledChains(chainIds?: number[] | null): number[] {
  if (!chainIds) return [];
  return chainIds.filter((id) => !isChainDisabled(id));
}
