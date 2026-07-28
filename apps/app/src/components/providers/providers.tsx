import Web3ModalProvider from "./web3modal";
import { PropsWithChildren, Suspense } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ChainProvider } from "@/lib/context/ChainContext";
import { PostHogProvider } from "./PostHogProvider";
import { ThemeProvider } from "./theme-provider";
import { Web3ModalThemeSync } from "./web3modal-theme-sync";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <Web3ModalProvider>
        <Web3ModalThemeSync />
        <QueryProvider>
          <ChainProvider>
            {/* PostHog is innermost so wallet context is available to capture hooks */}
            <Suspense>
              <PostHogProvider>{children}</PostHogProvider>
            </Suspense>
          </ChainProvider>
        </QueryProvider>
      </Web3ModalProvider>
    </ThemeProvider>
  );
}
