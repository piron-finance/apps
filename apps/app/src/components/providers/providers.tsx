import Web3ModalProvider from "./web3modal";
import { PropsWithChildren, Suspense } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ChainProvider } from "@/lib/context/ChainContext";
import { PendingTxProvider } from "@/lib/context/PendingTxContext";
import { PostHogProvider } from "./PostHogProvider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <Web3ModalProvider>
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
      </Web3ModalProvider>
    </ThemeProvider>
  );
}
