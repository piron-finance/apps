"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Connection, Transaction } from "@solana/web3.js";
import { NETWORKS } from "@/lib/constants/networks";

/**
 * Solana wallet connection, through the provider the extension injects.
 *
 * Solana has no single dominant wallet the way Ethereum has MetaMask. The ecosystem's
 * usual answer is `@solana/wallet-adapter-react`, which abstracts over Phantom, Solflare,
 * Backpack and the rest — but it pulls React 19 types and a second copy of
 * `@solana/web3.js` in beside ours, and two copies of web3.js mean a transaction we build
 * is a different TypeScript type from the one its signer accepts. Overriding the versions
 * did not dislodge the nested copies.
 *
 * So this talks to the injected provider directly. Every Solana wallet exposes the same
 * three things on `window` — `connect()`, `publicKey`, `signTransaction()` — which is all
 * a build-then-sign flow needs, and it keeps one copy of web3.js and one React. The cost
 * is that a wallet we have not named here is not offered; the two below cover the
 * overwhelming majority, and adding one is an entry in a list.
 *
 * If this app later needs the long tail of wallets, the adapter is the right answer and
 * the version skew is the thing to fix first.
 */

interface InjectedSolanaProvider {
  publicKey?: { toBase58(): string } | null;
  isConnected?: boolean;
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toBase58(): string } }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  off?(event: string, handler: (...args: unknown[]) => void): void;
}

/** The wallets this app offers, in the order it looks for them. */
const CANDIDATES: Array<{ name: string; read: () => InjectedSolanaProvider | undefined }> = [
  {
    name: "Phantom",
    read: () => (window as never as { phantom?: { solana?: InjectedSolanaProvider } }).phantom?.solana,
  },
  {
    name: "Solflare",
    read: () => (window as never as { solflare?: InjectedSolanaProvider }).solflare,
  },
  {
    // Fallback for any wallet that claims the generic handle.
    name: "Solana wallet",
    read: () => (window as never as { solana?: InjectedSolanaProvider }).solana,
  },
];

export interface SolanaWallet {
  address?: string;
  walletName?: string;
  available: boolean;
  connecting: boolean;
  error?: string;
  connect: () => Promise<string | undefined>;
  disconnect: () => void;
  /** Sign a transaction and submit it, returning the signature. */
  signAndSend: (
    transaction: Transaction,
    blockhash: string,
    lastValidBlockHeight: number
  ) => Promise<string>;
}

const NOT_CONNECTED: SolanaWallet = {
  available: false,
  connecting: false,
  connect: async () => undefined,
  disconnect: () => {},
  signAndSend: async () => {
    throw new Error("No Solana wallet connected.");
  },
};

const SolanaWalletContext = createContext<SolanaWallet>(NOT_CONNECTED);

const STORAGE_KEY = "piron_solana_connected_v1";

function endpoint(): string {
  return NETWORKS.find((n) => n.runtime === "solana")?.rpcUrl ?? "https://api.devnet.solana.com";
}

function detect(): { name: string; provider: InjectedSolanaProvider } | undefined {
  if (typeof window === "undefined") return undefined;
  for (const candidate of CANDIDATES) {
    const provider = candidate.read();
    if (provider?.connect) return { name: candidate.name, provider };
  }
  return undefined;
}

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | undefined>();
  const [walletName, setWalletName] = useState<string | undefined>();
  const [available, setAvailable] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    // Extensions inject on their own schedule, so a single check on mount reports "not
    // installed" for a wallet that appears a tick later. A short poll settles it without
    // holding anything open.
    let cancelled = false;
    let attempts = 0;
    const tick = async () => {
      if (cancelled) return;
      const found = detect();
      if (found) {
        setAvailable(true);
        setWalletName(found.name);
        const optedIn = (() => {
          try {
            return localStorage.getItem(STORAGE_KEY) === "1";
          } catch {
            return false;
          }
        })();
        if (optedIn) {
          try {
            // onlyIfTrusted restores a session the investor already approved without
            // opening the extension on page load.
            const res = await found.provider.connect({ onlyIfTrusted: true });
            if (!cancelled) setAddress(res.publicKey.toBase58());
          } catch {
            // Not trusted yet, or declined. Nothing to report on load.
          }
        }
        return;
      }
      if (++attempts < 10) setTimeout(tick, 300);
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(undefined);
    try {
      const found = detect();
      if (!found) {
        setAvailable(false);
        throw new Error(
          "No Solana wallet found. Install Phantom (phantom.app) or Solflare to deposit on Solana."
        );
      }
      setAvailable(true);
      setWalletName(found.name);
      const res = await found.provider.connect();
      const key = res.publicKey.toBase58();
      setAddress(key);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Holds for this session regardless.
      }
      return key;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect a Solana wallet.");
      return undefined;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    const found = detect();
    void found?.provider.disconnect().catch(() => {
      // Some wallets reject a disconnect they consider already done; the local state
      // below is what the UI reads either way.
    });
    setAddress(undefined);
    setError(undefined);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clean up.
    }
  }, []);

  const signAndSend = useCallback(
    async (transaction: Transaction, blockhash: string, lastValidBlockHeight: number) => {
      const found = detect();
      if (!found || !address) throw new Error("Connect a Solana wallet first.");
      const signed = await found.provider.signTransaction(transaction);
      const connection = new Connection(endpoint(), "confirmed");
      const signature = await connection.sendRawTransaction(signed.serialize());
      const result = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );
      if (result.value.err) {
        throw new Error(`The network rejected the transaction: ${JSON.stringify(result.value.err)}`);
      }
      return signature;
    },
    [address]
  );

  return (
    <SolanaWalletContext.Provider
      value={{ address, walletName, available, connecting, error, connect, disconnect, signAndSend }}
    >
      {children}
    </SolanaWalletContext.Provider>
  );
}

export function useSolanaWallet() {
  return useContext(SolanaWalletContext);
}
