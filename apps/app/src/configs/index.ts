import { createConfig, http, fallback } from "wagmi";
import { baseSepolia, morphHolesky, arbitrum, arbitrumSepolia } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";
import { defineChain, type Transport } from "viem";

// Keyless public RPCs are ALWAYS the primary path. A NEXT_PUBLIC_* provider key
// ships in the client bundle, so it is (a) publicly visible and (b) hit directly
// by every browser — a single burned/rate-limited key would otherwise 429 across
// the whole user base and flood the console with CORS/429 errors. Public nodes
// have no shared quota and set CORS headers, so they degrade gracefully.
//
// An optional env override is appended as an EXTRA fallback only (used if every
// public node is down), which preserves the ability to point at a paid endpoint
// without letting a bad key become a single point of failure.
const PUBLIC_RPCS: Record<number, string[]> = {
  // Base Sepolia
  84532: [
    "https://sepolia.base.org",
    "https://base-sepolia-rpc.publicnode.com",
    "https://base-sepolia.drpc.org",
  ],
  // Arbitrum Sepolia
  421614: [
    "https://sepolia-rollup.arbitrum.io/rpc",
    "https://arbitrum-sepolia-rpc.publicnode.com",
    "https://arbitrum-sepolia.drpc.org",
  ],
  // Arbitrum One
  42161: [
    "https://arb1.arbitrum.io/rpc",
    "https://arbitrum-one-rpc.publicnode.com",
  ],
  // Morph Holesky
  2810: ["https://rpc-holesky.morphl2.io"],
};

// Build a batched, low-retry fallback transport. Batching collapses the many
// per-render eth_call/eth_getBalance requests into a handful of JSON-RPC batches
// (the request storm is what exhausts provider quotas), and a low retry count
// stops a 429 from being amplified 3x before failover.
function rpcTransport(chainId: number, override?: string): Transport {
  const urls = [...(PUBLIC_RPCS[chainId] ?? [])];
  if (override && !urls.includes(override)) urls.push(override);
  return fallback(
    urls.map((url) => http(url, { batch: true, retryCount: 1 })),
    { rank: false }
  );
}

// Arc Testnet has no public RPC, so the (env-overridable) provider endpoint is
// its only option here.
const ARC_TESTNET_RPC =
  process.env.NEXT_PUBLIC_ARC_TESTNET_RPC ||
  "https://arc-testnet.g.alchemy.com/v2/FeJRn-TNvhl6iQRFlBHPL";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [ARC_TESTNET_RPC] },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://explorer.arc.fun" },
  },
  testnet: true,
});

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect will not work properly."
  );
}

export const config = createConfig({
  chains: [baseSepolia, arcTestnet, arbitrumSepolia, morphHolesky, arbitrum],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "Piron Finance",
      appLogoUrl: "https://piron.finance/logo.png",
    }),
    ...(projectId
      ? [
          walletConnect({
            projectId,
            metadata: {
              name: "Piron Finance",
              description:
                "DeFi Investment Platform for Tokenized Money Market Securities",
              url: "https://piron.finance",
              icons: ["https://piron.finance/logo.png"],
            },
          }),
        ]
      : []),
  ],
  transports: {
    [baseSepolia.id]: rpcTransport(
      baseSepolia.id,
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC
    ),
    [arbitrumSepolia.id]: rpcTransport(
      arbitrumSepolia.id,
      process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC
    ),
    [morphHolesky.id]: rpcTransport(morphHolesky.id),
    [arbitrum.id]: rpcTransport(arbitrum.id),
    // Arc has no public RPC — single provider endpoint, batched + low-retry.
    [arcTestnet.id]: fallback([
      http(ARC_TESTNET_RPC, { batch: true, retryCount: 1 }),
    ]),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
