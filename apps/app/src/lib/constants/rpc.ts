/**
 * RPC endpoints for chains with no public node (Arc, Robinhood).
 *
 * Their only endpoint is a provider URL with our key in it, and everything in this
 * bundle is readable by every visitor: a literal in source, and a NEXT_PUBLIC_ variable
 * just the same. So the browser never holds that URL. It talks to the backend's RPC
 * proxy, which keeps the key server-side and rate-limits by IP.
 *
 * There is deliberately no env override for these chains. Any URL put in one would ship
 * to the browser, key and all.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3008/api/v1";

export function rpcProxyUrl(chain: "arc" | "robinhood"): string {
  return `${API_BASE}/rpc/${chain}`;
}

/** The proxy refuses a JSON-RPC batch of more than 50 calls; stay well inside it. */
export const RPC_PROXY_BATCH = { batchSize: 25 } as const;
