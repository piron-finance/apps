"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  NETWORKS,
  SELECTABLE_NETWORKS,
  resolveNetwork,
  runtimeOf,
  type ChainRuntime,
  type NetworkMeta,
} from "@/lib/constants/networks";

export interface ChainOption {
  /**
   * EVM chain id, or undefined.
   *
   * Undefined means one of two different things, which is why `networkId` exists: the
   * "All Chains" option, or a network that genuinely has no numeric id. Stellar
   * identifies a network by passphrase and Solana by genesis hash, and the backend made
   * `chainId` nullable rather than invent numbers for them.
   */
  id: number | undefined;
  /** CAIP-2. The identity every runtime can express. Absent only for "All Chains". */
  networkId?: string;
  runtime?: ChainRuntime;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  isTestnet: boolean;
  logo?: string;
  /** False where this app has no wallet connector for the runtime. */
  canSign?: boolean;
}

interface ChainContextValue {
  /** EVM chain id of the active network, or undefined for "All" or a non-EVM network. */
  activeChainId: number | undefined;
  /** The active network's CAIP-2 id, or undefined for "All Chains". */
  activeNetworkId: string | undefined;
  setActiveChainId: (id: number | undefined) => void;
  setActiveNetworkId: (id: string | undefined) => void;
  activeChain: ChainOption;
  supportedChains: ChainOption[];
}

// ─── Chain definitions ────────────────────────────────────────────────────────
//
// Derived from the network registry rather than listed again here.
//
// This was a hand-written array keyed on numeric `id`, which could not express a Stellar
// or Solana network at all — so those pools could never appear in the switcher however
// many of them the backend served. Only the networks Piron actually has pools on are
// offered: a network with nothing deployed returns an empty list, which reads exactly
// like "this network has no pools" and is a different and wrong message.

const ALL_CHAINS_OPTION: ChainOption = {
  id: undefined,
  label: "All Chains",
  shortLabel: "All",
  color: "#6B7280",
  bgColor: "rgba(107,114,128,0.12)",
  isTestnet: false,
};

function toOption(net: NetworkMeta): ChainOption {
  // A translucent wash of the network's own colour, so the badge tint follows the
  // registry rather than being a second place to keep per-chain styling.
  const bgColor = `${net.color}1F`;
  return {
    id: net.chainId ?? undefined,
    networkId: net.networkId,
    runtime: net.runtime,
    label: net.label,
    shortLabel: net.shortLabel,
    color: net.color,
    bgColor,
    isTestnet: net.isTestnet,
    logo: net.logo,
    canSign: net.capabilities.canSign,
  };
}

/** Every network the app can name, including ones with nothing deployed. */
export const SUPPORTED_CHAINS: ChainOption[] = [
  ALL_CHAINS_OPTION,
  ...NETWORKS.map(toOption),
];

/** The networks the switcher offers — those Piron actually has pools on. */
export const SELECTABLE_CHAINS: ChainOption[] = [
  ALL_CHAINS_OPTION,
  ...SELECTABLE_NETWORKS.map(toOption),
];

// The dashboard opens on every chain. A product groups pool instances across
// chains, so chain is a deposit-time detail rather than something that should
// decide what a visitor is allowed to browse. Defaulting to a single chain hid
// most of the catalogue behind a dropdown people had no reason to touch.
//
// Picking a network from the header still filters, and that choice persists.
const DEFAULT_NETWORK_ID: string | undefined = undefined; // All Chains

// Separate storage key from admin/SPV so each app persists independently.
// v4: the stored value is now a CAIP-2 id rather than a numeric chain id, so the old
// keys cannot be read back. v3 held numbers; bumping discards them and lets the
// all-chains default apply rather than leaving a visitor on a value that no longer
// parses. A deliberate choice persists under the new key.
const STORAGE_KEY = "piron_app_active_network_v4";
/** The v3 key, read once so a numeric choice is migrated rather than dropped. */
const LEGACY_STORAGE_KEY = "piron_app_active_chain_v3";

// ─── Context ──────────────────────────────────────────────────────────────────

const ChainContext = createContext<ChainContextValue>({
  activeChainId: undefined,
  activeNetworkId: DEFAULT_NETWORK_ID,
  setActiveChainId: () => {},
  setActiveNetworkId: () => {},
  activeChain: ALL_CHAINS_OPTION,
  supportedChains: SELECTABLE_CHAINS,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ChainProvider({ children }: { children: React.ReactNode }) {
  // networkId is the state, because it is the only identity that can name every network.
  const [activeNetworkId, setActiveNetworkIdState] = useState<string | undefined>(
    DEFAULT_NETWORK_ID
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        if (stored === "undefined") return;
        if (SELECTABLE_NETWORKS.some((n) => n.networkId === stored)) {
          setActiveNetworkIdState(stored);
        }
        return;
      }
      // Migrate a choice made before networks were identified by CAIP-2.
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy && legacy !== "undefined") {
        const net = SELECTABLE_NETWORKS.find((n) => n.chainId === parseInt(legacy, 10));
        if (net) setActiveNetworkIdState(net.networkId);
      }
    } catch {
      // localStorage unavailable (SSR, private mode, blocked site data)
    }
  }, []);

  const setActiveNetworkId = (id: string | undefined) => {
    setActiveNetworkIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id === undefined ? "undefined" : id);
    } catch {
      // The selection still applies for this session; it just will not survive a reload.
    }
  };

  /** Kept for the callers that still pick a network by EVM chain id. */
  const setActiveChainId = (id: number | undefined) => {
    if (id === undefined) return setActiveNetworkId(undefined);
    const net = SELECTABLE_NETWORKS.find((n) => n.chainId === id);
    setActiveNetworkId(net?.networkId);
  };

  const activeChain =
    SUPPORTED_CHAINS.find((c) => c.networkId === activeNetworkId) ?? ALL_CHAINS_OPTION;

  return (
    <ChainContext.Provider
      value={{
        activeChainId: activeChain.id,
        activeNetworkId,
        setActiveChainId,
        setActiveNetworkId,
        activeChain,
        supportedChains: SELECTABLE_CHAINS,
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

/** A network by its CAIP-2 id — the lookup that works for every runtime. */
export function getNetworkById(networkId: string | undefined): ChainOption {
  return SUPPORTED_CHAINS.find((c) => c.networkId === networkId) ?? ALL_CHAINS_OPTION;
}

/**
 * The option for anything carrying either identity.
 *
 * Prefer this over `getChainById`: a record from a Stellar or Solana pool has no
 * `chainId`, so that lookup can only ever answer with the "All Chains" placeholder.
 */
export function getChainFor(record: {
  networkId?: string | null;
  chainId?: number | null;
}): ChainOption {
  const net = resolveNetwork(record);
  return net ? toOption(net) : ALL_CHAINS_OPTION;
}

export { runtimeOf };
