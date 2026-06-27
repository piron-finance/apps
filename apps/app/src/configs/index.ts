import { createConfig, http } from "wagmi";
import { baseSepolia, morphHolesky, arbitrum, arbitrumSepolia } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";
import { defineChain } from "viem";

// RPC endpoints are env-overridable so a rate-limited/burned provider key can be
// rotated without a code change. Fall back to the previous hardcoded defaults.
// NOTE: NEXT_PUBLIC_* values ship in the client bundle — use a frontend-scoped key.
const ARC_TESTNET_RPC =
  process.env.NEXT_PUBLIC_ARC_TESTNET_RPC ||
  "https://arc-testnet.g.alchemy.com/v2/FeJRn-TNvhl6iQRFlBHPL";
const BASE_SEPOLIA_RPC = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC; // undefined → wagmi uses chain default
const ARBITRUM_SEPOLIA_RPC = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC; // undefined → wagmi uses chain default

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
    [baseSepolia.id]: http(BASE_SEPOLIA_RPC),
    [arcTestnet.id]: http(ARC_TESTNET_RPC),
    [arbitrumSepolia.id]: http(ARBITRUM_SEPOLIA_RPC),
    [morphHolesky.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
