import { createConfig, http, fallback } from "wagmi";
import { baseSepolia, morphHolesky, arbitrum, arbitrumSepolia } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";
import { defineChain, type Transport } from "viem";
import { rpcProxyUrl, RPC_PROXY_BATCH } from "@/lib/constants/rpc";

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
  // Monad Testnet
  10143: ["https://testnet-rpc.monad.xyz"],
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

// Arc and Robinhood have no public RPC. Both the app's own reads and the chain params a
// wallet saves on wallet_addEthereumChain go through the backend RPC proxy, so the
// provider key never reaches a browser or a wallet. See lib/constants/rpc.ts.
const ARC_TESTNET_RPC = rpcProxyUrl("arc");
const ROBINHOOD_TESTNET_RPC = rpcProxyUrl("robinhood");

// viem buffers the base fee by only 1.2× by default when estimating maxFeePerGas.
// On these L2 testnets the base fee can tick up between estimation and submission,
// making maxFeePerGas fall *below* the live base fee — the wallet then rejects the tx
// with "max fee per gas less than block base fee". A 2× buffer absorbs normal base-fee
// movement (testnet gas is negligible, so over-budgeting costs nothing).
const FEES = { baseFeeMultiplier: 2 } as const;
const withFeeBuffer = <T extends { fees?: unknown }>(chain: T): T => ({
  ...chain,
  fees: { ...(chain.fees as object), ...FEES },
});

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
  fees: FEES,
  testnet: true,
});

// Robinhood Testnet — an Arbitrum-Orbit L2 with no public RPC.
export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [ROBINHOOD_TESTNET_RPC] },
  },
  fees: FEES,
  testnet: true,
});

// Monad Testnet — the first chain on the audited (v2) contracts. It has a keyless
// public RPC, so the wallet is handed that directly; there is no key to hide behind
// the proxy.
//
// No fee buffer here, and never pad `gas` on this chain: Monad charges for the gas
// LIMIT, not the gas used, so any padding on the limit is paid for in full. Leave the
// estimate to the Monad node, which also prices cold storage above what a local
// simulation assumes.
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: PUBLIC_RPCS[10143] },
  },
  blockExplorers: {
    default: { name: "MonadScan", url: "https://testnet.monadscan.com" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 251449,
    },
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
  chains: [
    withFeeBuffer(baseSepolia),
    arcTestnet,
    withFeeBuffer(arbitrumSepolia),
    robinhoodTestnet,
    monadTestnet,
    withFeeBuffer(morphHolesky),
    withFeeBuffer(arbitrum),
  ],
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
    [monadTestnet.id]: rpcTransport(
      monadTestnet.id,
      process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC
    ),
    [arbitrum.id]: rpcTransport(arbitrum.id),
    // Arc and Robinhood read through the backend proxy — batched within its limit, low-retry.
    [arcTestnet.id]: fallback([
      http(ARC_TESTNET_RPC, { batch: RPC_PROXY_BATCH, retryCount: 1 }),
    ]),
    [robinhoodTestnet.id]: fallback([
      http(ROBINHOOD_TESTNET_RPC, { batch: RPC_PROXY_BATCH, retryCount: 1 }),
    ]),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
