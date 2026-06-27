"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChainOption {
  id: number | undefined;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  isTestnet: boolean;
}

interface ChainContextValue {
  activeChainId: number | undefined;
  setActiveChainId: (id: number | undefined) => void;
  activeChain: ChainOption;
  supportedChains: ChainOption[];
}

// ─── Chain definitions ────────────────────────────────────────────────────────

export const SUPPORTED_CHAINS: ChainOption[] = [
  {
    id: undefined,
    label: "All Chains",
    shortLabel: "All",
    color: "#6B7280",
    bgColor: "rgba(107,114,128,0.12)",
    isTestnet: false,
  },
  {
    id: 84532,
    label: "Base Sepolia",
    shortLabel: "Base Sep.",
    color: "#0052FF",
    bgColor: "rgba(0,82,255,0.12)",
    isTestnet: true,
  },
  {
    id: 5042002,
    label: "Arc Testnet",
    shortLabel: "Arc",
    color: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.12)",
    isTestnet: true,
  },
  {
    id: 421614,
    label: "Arbitrum Sepolia",
    shortLabel: "Arbitrum",
    color: "#28A0F0",
    bgColor: "rgba(40,160,240,0.12)",
    isTestnet: true,
  },
];

const ALL_CHAINS_OPTION = SUPPORTED_CHAINS[0] as ChainOption;

// Separate storage key from admin/SPV so each app persists independently
const STORAGE_KEY = "piron_app_active_chain";

// ─── Context ──────────────────────────────────────────────────────────────────

const ChainContext = createContext<ChainContextValue>({
  activeChainId: undefined,
  setActiveChainId: () => {},
  activeChain: ALL_CHAINS_OPTION,
  supportedChains: SUPPORTED_CHAINS,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [activeChainId, setActiveChainIdState] = useState<number | undefined>(
    undefined
  );

  // Rehydrate from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed =
          stored === "undefined" ? undefined : parseInt(stored, 10);
        const valid = SUPPORTED_CHAINS.some((c) => c.id === parsed);
        if (valid) setActiveChainIdState(parsed);
      }
    } catch {
      // localStorage unavailable (SSR)
    }
  }, []);

  const setActiveChainId = (id: number | undefined) => {
    setActiveChainIdState(id);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        id === undefined ? "undefined" : String(id)
      );
    } catch {}
  };

  const activeChain =
    SUPPORTED_CHAINS.find((c) => c.id === activeChainId) ?? ALL_CHAINS_OPTION;

  return (
    <ChainContext.Provider
      value={{
        activeChainId,
        setActiveChainId,
        activeChain,
        supportedChains: SUPPORTED_CHAINS,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChainContext() {
  return useContext(ChainContext);
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export function getChainById(chainId: number | undefined): ChainOption {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId) ?? ALL_CHAINS_OPTION;
}
