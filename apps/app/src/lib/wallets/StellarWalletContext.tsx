"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

/**
 * Freighter, the Stellar browser wallet.
 *
 * Freighter is to Stellar what MetaMask is to Ethereum: an extension that holds the
 * investor's keys and signs on request. It is the wallet the Stellar ecosystem actually
 * uses, and it is the reason a Stellar deposit can be made from a browser at all — the
 * backend builds the transaction, the extension signs it, nothing ever sees a secret key.
 *
 * It differs from an EVM wallet in three ways that shape this file:
 *
 *   - **It signs XDR, not calldata.** The backend returns a base64 transaction envelope
 *     and the network passphrase it was built for; Freighter signs that envelope whole.
 *   - **The passphrase is the network identity.** There is no numeric chain id to switch
 *     to. Signing with the wrong passphrase produces a signature the network rejects, so
 *     the passphrase travels with the transaction and is checked against the wallet's.
 *   - **A prepared Soroban envelope expires.** EVM calldata is good forever; a simulated
 *     Soroban transaction carries time bounds of a few minutes. So the flow is build,
 *     sign and submit promptly rather than build now and sign later.
 */

export interface StellarWallet {
  /** G… address of the connected account, or undefined. */
  address?: string;
  /** The network passphrase Freighter is currently set to. */
  networkPassphrase?: string;
  /** False when the extension is not installed. */
  available: boolean;
  connecting: boolean;
  error?: string;
  connect: () => Promise<string | undefined>;
  disconnect: () => void;
  /**
   * Sign a base64 XDR envelope and return the signed one.
   *
   * Takes the passphrase the envelope was built for rather than reading it from the
   * wallet: a mismatch has to be an error, not something quietly signed for the wrong
   * network. Freighter is asked to sign for that passphrase and refuses if it disagrees.
   */
  signXdr: (xdr: string, networkPassphrase: string) => Promise<string>;
}

const NOT_CONNECTED: StellarWallet = {
  available: false,
  connecting: false,
  connect: async () => undefined,
  disconnect: () => {},
  signXdr: async () => {
    throw new Error("No Stellar wallet connected.");
  },
};

const StellarWalletContext = createContext<StellarWallet>(NOT_CONNECTED);

/** Where the choice to stay connected is remembered, per browser. */
const STORAGE_KEY = "piron_stellar_connected_v1";

export function StellarWalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | undefined>();
  const [networkPassphrase, setNetworkPassphrase] = useState<string | undefined>();
  const [available, setAvailable] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Freighter injects asynchronously, so a synchronous check on first render reports
  // "not installed" for a wallet that is about to appear. Every call in its API is a
  // promise for the same reason.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const installed = await isConnected();
        if (cancelled) return;
        setAvailable(Boolean(installed?.isConnected));
        if (!installed?.isConnected) return;

        // Reconnect silently only if this browser both opted in and still has the
        // permission. Calling requestAccess here instead would pop the extension open
        // on page load, which is a prompt nobody asked for.
        const optedIn = (() => {
          try {
            return localStorage.getItem(STORAGE_KEY) === "1";
          } catch {
            return false;
          }
        })();
        if (!optedIn) return;
        const allowed = await isAllowed();
        if (cancelled || !allowed?.isAllowed) return;
        const [addr, net] = await Promise.all([getAddress(), getNetwork()]);
        if (cancelled) return;
        if (addr?.address) setAddress(addr.address);
        if (net?.networkPassphrase) setNetworkPassphrase(net.networkPassphrase);
      } catch {
        // Treated as "no wallet". Freighter's API rejects rather than returning a flag
        // in several cases, and none of them should break the page.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(undefined);
    try {
      const installed = await isConnected();
      if (!installed?.isConnected) {
        setAvailable(false);
        throw new Error(
          "Freighter is not installed. It is the Stellar wallet extension, available at freighter.app."
        );
      }
      setAvailable(true);
      const granted = await requestAccess();
      if (granted?.error) throw new Error(String(granted.error));
      if (!granted?.address) throw new Error("Freighter did not return an account.");
      const net = await getNetwork();
      setAddress(granted.address);
      setNetworkPassphrase(net?.networkPassphrase);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // The connection still holds for this session.
      }
      return granted.address;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect to Freighter.");
      return undefined;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // Freighter has no revoke API — an extension grants access to a site, and only the
    // extension can take it back. So this forgets the account locally, which is what
    // "disconnect" means everywhere else, and stops the silent reconnect above.
    setAddress(undefined);
    setNetworkPassphrase(undefined);
    setError(undefined);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clean up.
    }
  }, []);

  const signXdr = useCallback(
    async (xdr: string, passphrase: string) => {
      if (!address) throw new Error("Connect a Stellar wallet first.");
      const signed = await signTransaction(xdr, {
        networkPassphrase: passphrase,
        address,
      });
      if (signed?.error) throw new Error(String(signed.error));
      const envelope = signed?.signedTxXdr;
      if (!envelope) throw new Error("Freighter returned no signed transaction.");
      return envelope;
    },
    [address]
  );

  return (
    <StellarWalletContext.Provider
      value={{ address, networkPassphrase, available, connecting, error, connect, disconnect, signXdr }}
    >
      {children}
    </StellarWalletContext.Provider>
  );
}

export function useStellarWallet() {
  return useContext(StellarWalletContext);
}
