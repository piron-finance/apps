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
export function getChainName(chainId: number): string {
  return getChainInfo(chainId).name;
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
export function getAddressUrl(chainId: number, address: string): string {
  const chainInfo = getChainInfo(chainId);
  if (chainInfo.blockExplorers.length > 0) {
    return `${chainInfo.blockExplorers[0].url}/address/${address}`;
  }
  return "#";
}

/**
 * Check if chain is a testnet
 */
export function isTestnet(chainId: number): boolean {
  const testnets = [84532, 2810, 11155111, 5]; // Base Sepolia, Morph Holesky, Sepolia, Goerli
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
