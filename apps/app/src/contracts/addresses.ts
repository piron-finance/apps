import { baseSepolia, morphHolesky, arbitrum, mainnet } from "wagmi/chains";

export const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: {
    FACTORY: "0xDA2082E087D216C5D6eA0F250Cb5Ce845C65374F" as `0x${string}`,
    REGISTRY: "0x30B1e8019066FB6BfcceF35F205f09FC95Fa3428" as `0x${string}`,
    MANAGER: "0xE1A5F7564079FB8eAF22f2968c74c1d657dE8F47" as `0x${string}`,
    ACCESSMANAGER:
      "0x71beC1E31890867c0846873ea9f5344e39DD2fD8" as `0x${string}`,
  },
  [morphHolesky.id]: {
    FACTORY: "0x2aC57eE40D608b994e783C264695A963f515bCaB" as `0x${string}`,
    REGISTRY: "0x1e10d333756189E626F391d1128B2490aDa5EC95" as `0x${string}`,
    MANAGER: "0x7309Ab783285AE9E94F5d9F2A89b4B69B4320f72" as `0x${string}`,
    ACCESSMANAGER:
      "0xe8D592F5eCaFE47a2914897004c2C787b59C80dC" as `0x${string}`,
  },
  [arbitrum.id]: {
    FACTORY: "0x" as `0x${string}`,
    REGISTRY: "0x" as `0x${string}`,
    MANAGER: "0x" as `0x${string}`,
    ACCESSMANAGER: "0x" as `0x${string}`,
  },
  [mainnet.id]: {
    FACTORY: "0x" as `0x${string}`,
    REGISTRY: "0x" as `0x${string}`,
    MANAGER: "0x" as `0x${string}`,
    ACCESSMANAGER: "0x" as `0x${string}`,
  },
} as const;

export function getContractAddress(
  chainId: number,
  contract: keyof (typeof CONTRACT_ADDRESSES)[keyof typeof CONTRACT_ADDRESSES]
) {
  const addresses =
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return addresses[contract];
}
