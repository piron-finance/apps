"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useStellarWallet } from "@/lib/wallets/StellarWalletContext";
import { useSolanaWallet } from "@/lib/wallets/SolanaWalletContext";
import type { ChainRuntime } from "@/lib/constants/networks";

export interface InvestorWallet {
  runtime: ChainRuntime;
  address: string;
}

/**
 * Every wallet the investor currently has connected, across runtimes.
 *
 * The portfolio read `useAccount()` from wagmi, which only ever knows about an EVM
 * wallet — so someone holding a Stellar position through Freighter saw an empty
 * portfolio and a "connect your wallet" prompt while connected. Positions are keyed on
 * the address that holds them, and those addresses come from three different wallets, so
 * the portfolio has to ask about all of them rather than one.
 *
 * Returned as a list rather than a map because every caller wants to iterate: fetch per
 * address, then merge. Stable across renders while the set of connections is unchanged,
 * so it is safe in a dependency array.
 */
export function useInvestorWallets(): InvestorWallet[] {
  const { address: evm } = useAccount();
  const stellar = useStellarWallet();
  const solana = useSolanaWallet();

  return useMemo(() => {
    const wallets: InvestorWallet[] = [];
    if (evm) wallets.push({ runtime: "evm", address: evm });
    if (stellar.address) wallets.push({ runtime: "stellar", address: stellar.address });
    if (solana.address) wallets.push({ runtime: "solana", address: solana.address });
    return wallets;
  }, [evm, stellar.address, solana.address]);
}

/** Whether any wallet at all is connected, for the "connect to see your portfolio" state. */
export function useHasAnyWallet(): boolean {
  return useInvestorWallets().length > 0;
}
