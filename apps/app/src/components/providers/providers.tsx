import Web3ModalProvider from "./web3modal";
import { PropsWithChildren, Suspense } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ChainProvider } from "@/lib/context/ChainContext";
import { PendingTxProvider } from "@/lib/context/PendingTxContext";
import { PostHogProvider } from "./PostHogProvider";
import { ThemeProvider } from "./theme-provider";
import { StellarWalletProvider } from "@/lib/wallets/StellarWalletContext";
import { SolanaWalletProvider } from "@/lib/wallets/SolanaWalletContext";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <Web3ModalProvider>
        {/* One provider per runtime, side by side rather than merged. Each wallet
            ecosystem owns its own connection state — wagmi for EVM, Freighter's
            extension API for Stellar, the wallet-adapter for Solana — and a single
            unified context over the three would mean reimplementing what each already
            does, with a fourth source of truth for which wallet is connected. */}
        <StellarWalletProvider>
          <SolanaWalletProvider>
            <QueryProvider>
              <ChainProvider>
                {/* Optimistic tx ledger — sits above the pages so a pending deposit
                survives navigation between the pool detail and portfolio views. */}
                <PendingTxProvider>
                  {/* PostHog is innermost so wallet context is available to capture hooks */}
                  <Suspense>
                    <PostHogProvider>{children}</PostHogProvider>
                  </Suspense>
                </PendingTxProvider>
              </ChainProvider>
            </QueryProvider>
          </SolanaWalletProvider>
        </StellarWalletProvider>
      </Web3ModalProvider>
    </ThemeProvider>
  );
}
