/**
 * Network identity for every runtime Piron runs on.
 *
 * This app identified a network only by numeric chain id — `CHAIN_INFO[chainId]` — which
 * cannot name a Stellar or Solana network at all. Stellar identifies one by passphrase and
 * Solana by genesis hash, so the backend made `Pool.chainId` nullable rather than invent
 * numbers for them. The consequence was already live, not hypothetical: the backend serves
 * non-EVM pools to this app today, and every one of them rendered with no network marker,
 * because `CHAIN_INFO[null]` is undefined and the components correctly bailed out.
 *
 * CAIP-2 is the identity that works everywhere, so it is the key here and `chainId` is
 * derived from it rather than the other way round.
 *
 * **On the duplication.** The internal admin/SPV monorepo has this as `@repo/chains`, and
 * the backend has its own copy under `src/blockchain/runtime`. This is a third, because
 * this app is a separate repository with no shared package between them. That is worth
 * fixing, and the fix is a published package rather than a reach across repo boundaries —
 * until then the three must agree, so the CAIP-2 ids and capability meanings here are
 * copied verbatim and any change has to be made in all three.
 */

export type ChainRuntime = "evm" | "stellar" | "solana";

export interface NetworkCapabilities {
  /**
   * A wallet connector exists in THIS app for this runtime.
   *
   * False for Stellar and Solana: there is no Freighter or wallet-adapter connection here
   * yet, so a deposit cannot be signed however willing the investor is. A control that
   * cannot complete should say so rather than fail at the wallet.
   */
  canSign: boolean;
  /** Piron has pools on this network, so it is worth showing and filtering to. */
  hasPools: boolean;
}

export interface NetworkMeta {
  networkId: string;
  runtime: ChainRuntime;
  /** EVM only. Null elsewhere — never synthesise one. */
  chainId: number | null;
  label: string;
  shortLabel: string;
  color: string;
  logo?: string;
  isTestnet: boolean;
  /** No trailing slash. */
  explorerUrl: string;
  capabilities: NetworkCapabilities;
}

const EVM: NetworkCapabilities = { canSign: true, hasPools: true };
/** Signable, but nothing deployed — present so a record can be labelled, not selected. */
const EVM_NO_DEPLOYMENT: NetworkCapabilities = { canSign: true, hasPools: false };
/** Served by the backend and visible to investors; not signable from this app yet. */
const READ_ONLY: NetworkCapabilities = { canSign: false, hasPools: true };

export const NETWORKS: NetworkMeta[] = [
  {
    networkId: "eip155:84532",
    runtime: "evm",
    chainId: 84532,
    label: "Base Sepolia",
    shortLabel: "Base",
    color: "#0052FF",
    logo: "/chains/base.svg",
    isTestnet: true,
    explorerUrl: "https://sepolia.basescan.org",
    capabilities: EVM,
  },
  {
    networkId: "eip155:8453",
    runtime: "evm",
    chainId: 8453,
    label: "Base",
    shortLabel: "Base",
    color: "#0052FF",
    logo: "/chains/base.svg",
    isTestnet: false,
    explorerUrl: "https://basescan.org",
    capabilities: EVM_NO_DEPLOYMENT,
  },
  {
    networkId: "eip155:5042002",
    runtime: "evm",
    chainId: 5042002,
    label: "Arc Testnet",
    shortLabel: "Arc",
    color: "#FF6B35",
    logo: "/chains/arc.svg",
    isTestnet: true,
    explorerUrl: "https://explorer.arc.fun",
    capabilities: EVM,
  },
  {
    networkId: "eip155:421614",
    runtime: "evm",
    chainId: 421614,
    label: "Arbitrum Sepolia",
    shortLabel: "Arbitrum",
    color: "#28A0F0",
    logo: "/chains/arbitrum.svg",
    isTestnet: true,
    explorerUrl: "https://sepolia.arbiscan.io",
    capabilities: EVM,
  },
  {
    networkId: "eip155:46630",
    runtime: "evm",
    chainId: 46630,
    label: "Robinhood Testnet",
    shortLabel: "Robinhood",
    color: "#00C805",
    logo: "/chains/robinhood.svg",
    isTestnet: true,
    explorerUrl: "https://robinhood-testnet.explorer.caldera.xyz",
    capabilities: EVM,
  },
  {
    networkId: "eip155:10143",
    runtime: "evm",
    chainId: 10143,
    label: "Monad Testnet",
    shortLabel: "Monad",
    color: "#836EF9",
    logo: "/chains/monad.svg",
    isTestnet: true,
    explorerUrl: "https://testnet.monadscan.com",
    capabilities: EVM,
  },
  {
    networkId: "stellar:testnet",
    runtime: "stellar",
    chainId: null,
    label: "Stellar Testnet",
    shortLabel: "Stellar",
    color: "#7D00FF",
    logo: "/chains/stellar.svg",
    isTestnet: true,
    explorerUrl: "https://stellar.expert/explorer/testnet",
    capabilities: READ_ONLY,
  },
  {
    networkId: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    runtime: "solana",
    chainId: null,
    label: "Solana Devnet",
    shortLabel: "Solana",
    color: "#14F195",
    logo: "/chains/solana.svg",
    isTestnet: true,
    explorerUrl: "https://explorer.solana.com",
    capabilities: READ_ONLY,
  },
];

/** Anything carrying either identity. The shape most API records already have. */
export interface NetworkRef {
  networkId?: string | null;
  chainId?: number | null;
}

/**
 * The runtime a CAIP-2 id names, from its prefix alone.
 *
 * No registry lookup, so a network this build has never heard of — one added backend-first,
 * or a mainnet cutover — is still correctly identified as non-EVM. Returns undefined
 * rather than throwing, because callers use it to decide whether to offer a write and a
 * throw there turns into "no information", which reads as "go ahead".
 */
export function runtimeOf(networkId?: string | null): ChainRuntime | undefined {
  if (!networkId) return undefined;
  if (networkId.startsWith("eip155:")) return "evm";
  if (networkId.startsWith("stellar:")) return "stellar";
  if (networkId.startsWith("solana:")) return "solana";
  return undefined;
}

export function findNetwork(networkId?: string | null): NetworkMeta | undefined {
  if (!networkId) return undefined;
  return NETWORKS.find((n) => n.networkId === networkId);
}

export function findNetworkByChainId(chainId?: number | null): NetworkMeta | undefined {
  if (chainId === null || chainId === undefined) return undefined;
  return NETWORKS.find((n) => n.chainId === chainId);
}

/** Resolve from whichever identity a record carries, preferring CAIP-2. */
export function resolveNetwork(ref: NetworkRef): NetworkMeta | undefined {
  return findNetwork(ref.networkId) ?? findNetworkByChainId(ref.chainId);
}

/**
 * The network's name, never a raw identifier.
 *
 * Falls back through the CAIP-2 id to the chain id, so an unknown network reads as
 * something legible rather than "Unknown".
 */
export function networkLabel(ref: NetworkRef): string {
  const net = resolveNetwork(ref);
  if (net) return net.label;
  if (ref.networkId) return ref.networkId;
  if (ref.chainId !== null && ref.chainId !== undefined) return `Chain ${ref.chainId}`;
  return "Unknown network";
}

/**
 * Whether this app can sign for a pool's network, erring towards no.
 *
 * Reading `canSign` off a registry lookup gives undefined for an unknown id, and
 * undefined read as "assume we can" would offer a deposit the investor cannot complete.
 * The prefix settles the runtime without a lookup, and only EVM is signable here.
 */
export function canSignFor(ref: NetworkRef): boolean {
  const net = resolveNetwork(ref);
  if (net) return net.capabilities.canSign;
  const runtime = runtimeOf(ref.networkId);
  if (runtime && runtime !== "evm") return false;
  return false;
}

/** Networks worth showing in a filter: the ones Piron actually has pools on. */
export const SELECTABLE_NETWORKS = NETWORKS.filter((n) => n.capabilities.hasPools);

/**
 * A link to a transaction on the network's explorer.
 *
 * Takes a record rather than a chain id, because a Stellar or Solana pool has none — the
 * previous shape could only ever return nothing for one. The URL differs per runtime too:
 * Solana needs the cluster as a query parameter, and links are blank without it.
 */
export function txExplorerUrl(ref: NetworkRef, reference: string): string | undefined {
  const net = resolveNetwork(ref);
  if (!net || !reference) return undefined;
  const base = net.explorerUrl.replace(/\/$/, "");
  if (net.runtime === "solana") {
    return `${base}/tx/${reference}?cluster=${net.isTestnet ? "devnet" : "mainnet-beta"}`;
  }
  return `${base}/tx/${reference}`;
}
