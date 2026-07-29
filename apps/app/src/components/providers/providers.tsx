import Web3ModalProvider from "./web3modal";
import { PropsWithChildren, Suspense } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ChainProvider } from "@/lib/context/ChainContext";
import { PostHogProvider } from "./PostHogProvider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <Web3ModalProvider>
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
