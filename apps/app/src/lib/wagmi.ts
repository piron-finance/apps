import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

const morphL2 = {
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Base Sepolia Explorer",
      url: "https://sepolia-explorer.base.org",
    },
  },
};

export const config = createConfig({
  chains: [morphL2],
  connectors: [injected()],
  transports: {
    [morphL2.id]: http(),
  },
});
