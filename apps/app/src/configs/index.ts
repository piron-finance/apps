import { createConfig, http } from "wagmi";
import { baseSepolia, morphHolesky, arbitrum } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";
import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://arc-testnet.g.alchemy.com/v2/FeJRn-TNvhl6iQRFlBHPL"] },
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
  chains: [baseSepolia, arcTestnet, morphHolesky, arbitrum],
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
    [baseSepolia.id]: http(),
    [arcTestnet.id]: http(),
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
