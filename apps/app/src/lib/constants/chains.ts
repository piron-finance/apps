import { rpcProxyUrl } from "./rpc";
import { networkLabel, resolveNetwork, type NetworkRef } from "./networks";

export interface ChainInfo {
  id: number;
  name: string;
  shortName: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorers: {
    name: string;
    url: string;
  }[];
  logo?: string;
  color?: string;
}

export const CHAIN_INFO: Record<number, ChainInfo> = {
  // Ethereum Mainnet
  1: {
    id: 1,
    name: "Ethereum",
    shortName: "ETH",
    network: "mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://eth.llamarpc.com"],
    blockExplorers: [
      {
        name: "Etherscan",
        url: "https://etherscan.io",
      },
    ],
    logo: "/chains/ethereum.svg",
    color: "#627EEA",
  },

  // Base Mainnet
  8453: {
    id: 8453,
    name: "Base",
    shortName: "Base",
    network: "base",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorers: [
      {
        name: "Basescan",
        url: "https://basescan.org",
      },
    ],
    logo: "/chains/base.svg",
    color: "#0052FF",
  },

  // Base Sepolia (Testnet)
  84532: {
    id: 84532,
    name: "Base Sepolia",
    shortName: "Base",
    network: "base-sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorers: [
      {
        name: "Base Sepolia Explorer",
        url: "https://sepolia.basescan.org",
      },
    ],
    logo: "/chains/base.svg",
    color: "#0052FF",
  },

  // Arbitrum One
  42161: {
    id: 42161,
    name: "Arbitrum One",
    shortName: "Arbitrum",
    network: "arbitrum",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorers: [
      {
        name: "Arbiscan",
        url: "https://arbiscan.io",
      },
    ],
    logo: "/chains/arbitrum.svg",
    color: "#28A0F0",
  },

  // Arbitrum Sepolia (Testnet)
  421614: {
    id: 421614,
    name: "Arbitrum Sepolia",
    shortName: "Arbitrum",
    network: "arbitrum-sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC ||
        "https://sepolia-rollup.arbitrum.io/rpc",
    ],
    blockExplorers: [
      {
        name: "Arbiscan",
        url: "https://sepolia.arbiscan.io",
      },
    ],
    logo: "/chains/arbitrum.svg",
    color: "#28A0F0",
  },

  // Morph Holesky (Testnet)
  2810: {
    id: 2810,
    name: "Morph Holesky",
    shortName: "Morph",
    network: "morph-holesky",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-holesky.morphl2.io"],
    blockExplorers: [
      {
        name: "Morph Holesky Explorer",
        url: "https://explorer-holesky.morphl2.io",
      },
    ],
    color: "#6366F1",
  },

  // Polygon
  137: {
    id: 137,
    name: "Polygon",
    shortName: "Polygon",
    network: "polygon",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorers: [
      {
        name: "PolygonScan",
        url: "https://polygonscan.com",
      },
    ],
    logo: "/chains/polygon.svg",
    color: "#8247E5",
  },

  // Optimism
  10: {
    id: 10,
    name: "Optimism",
    shortName: "Optimism",
    network: "optimism",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorers: [
      {
        name: "Optimistic Etherscan",
        url: "https://optimistic.etherscan.io",
      },
    ],
    logo: "/chains/optimism.svg",
    color: "#FF0420",
  },

  // Sepolia Testnet
  11155111: {
    id: 11155111,
    name: "Sepolia",
    shortName: "Sepolia",
    network: "sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.sepolia.org"],
    blockExplorers: [
      {
        name: "Sepolia Etherscan",
        url: "https://sepolia.etherscan.io",
      },
    ],
    logo: "/chains/ethereum.svg",
    color: "#627EEA",
  },

  // Arc Testnet
  5042002: {
    id: 5042002,
    name: "Arc Testnet",
    shortName: "Arc",
    network: "arc-testnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [rpcProxyUrl("arc")],
    blockExplorers: [
      {
        name: "Arc Explorer",
        url: "https://explorer.arc.fun",
      },
    ],
    logo: "/chains/arc.svg",
    color: "#8B5CF6",
  },

  // Robinhood Testnet
  46630: {
    id: 46630,
    name: "Robinhood Testnet",
    shortName: "Robinhood",
    network: "robinhood-testnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [rpcProxyUrl("robinhood")],
    blockExplorers: [],
    logo: "/chains/robinhood.svg",
    color: "#00C805",
  },

  // Monad Testnet
  10143: {
    id: 10143,
    name: "Monad Testnet",
    shortName: "Monad",
    network: "monad-testnet",
    nativeCurrency: {
      name: "Monad",
      symbol: "MON",
      decimals: 18,
    },
    rpcUrls: [
      process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC ||
        "https://testnet-rpc.monad.xyz",
    ],
    blockExplorers: [
      {
        name: "MonadScan",
        url: "https://testnet.monadscan.com",
      },
    ],
    logo: "/chains/monad.svg",
    color: "#836EF9",
  },
};

/**
 * Get chain information by chain ID
 * Returns default chain info if chain ID is not found
 */
export function getChainInfo(chainId: number): ChainInfo {
  return (
    CHAIN_INFO[chainId] || {
      id: chainId,
      name: `Chain ${chainId}`,
      shortName: `Chain ${chainId}`,
      network: "unknown",
      nativeCurrency: {
        name: "Unknown",
        symbol: "???",
        decimals: 18,
      },
      rpcUrls: [],
      blockExplorers: [],
      color: "#6B7280",
    }
  );
}

/**
 * Get chain name by chain ID
 */
export function getChainName(ref: number | NetworkRef | null | undefined): string {
  // Takes either identity. The numeric form could only ever answer for EVM, so a Stellar
  // or Solana pool rendered whatever `getChainInfo(null)` falls back to — which is not
  // its network. `networkLabel` degrades through the CAIP-2 id to the chain id to a
  // legible string, so an unknown network reads as something rather than as a wrong name.
  return networkLabel(typeof ref === "number" ? { chainId: ref } : (ref ?? {}));
}

/**
 * Get chain short name by chain ID
 */
export function getChainShortName(chainId: number): string {
  return getChainInfo(chainId).shortName;
}

/**
 * Get chain logo URL by chain ID
 */
export function getChainLogo(chainId: number): string | undefined {
  return getChainInfo(chainId).logo;
}

/**
 * Get chain color by chain ID
 */
export function getChainColor(chainId: number): string {
  return getChainInfo(chainId).color || "#6B7280";
}

/**
 * Get block explorer URL for a transaction
 */
export function getTransactionUrl(chainId: number, txHash: string): string {
  const chainInfo = getChainInfo(chainId);
  if (chainInfo.blockExplorers.length > 0) {
    return `${chainInfo.blockExplorers[0].url}/tx/${txHash}`;
  }
  return "#";
}

/**
 * Get block explorer URL for an address
 */
export function getAddressUrl(
  ref: number | NetworkRef | null | undefined,
  address: string,
): string {
  const net = resolveNetwork(typeof ref === "number" ? { chainId: ref } : (ref ?? {}));
  if (net) {
    const base = net.explorerUrl.replace(/\/$/, "");
    // The URL shape differs per runtime, and getting it wrong produces a real link to a
    // real explorer that shows nothing. Stellar separates contracts from accounts, and
    // Solana needs the cluster as a query parameter or the page is blank.
    if (net.runtime === "stellar") {
      return `${base}/${address.startsWith("C") ? "contract" : "account"}/${address}`;
    }
    if (net.runtime === "solana") {
      return `${base}/address/${address}?cluster=${net.isTestnet ? "devnet" : "mainnet-beta"}`;
    }
    return `${base}/address/${address}`;
  }
  // Fall back to the legacy table for an EVM chain the network registry does not list.
  if (typeof ref === "number") {
    const chainInfo = getChainInfo(ref);
    if (chainInfo.blockExplorers.length > 0) {
      return `${chainInfo.blockExplorers[0].url}/address/${address}`;
    }
  }
  return "#";
}

/**
 * Check if chain is a testnet
 */
export function isTestnet(chainId: number): boolean {
  const testnets = [84532, 2810, 11155111, 5, 5042002, 421614, 46630, 10143]; // Base Sepolia, Morph Holesky, Sepolia, Goerli, Arc Testnet, Arbitrum Sepolia, Robinhood Testnet, Monad Testnet
  return testnets.includes(chainId);
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(CHAIN_INFO).map((id) => parseInt(id));
}

/**
 * Get all supported chains
 */
export function getSupportedChains(): ChainInfo[] {
  return Object.values(CHAIN_INFO);
}
