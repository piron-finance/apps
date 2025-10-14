import { createConfig, http } from "wagmi";
import { baseSepolia, morphHolesky, arbitrum } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect will not work properly."
  );
}

export const config = createConfig({
  chains: [baseSepolia, morphHolesky, arbitrum],
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
