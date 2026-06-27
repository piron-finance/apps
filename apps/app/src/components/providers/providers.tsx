import Web3ModalProvider from "./web3modal";
import { PropsWithChildren, Suspense } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ChainProvider } from "@/lib/context/ChainContext";
import { PostHogProvider } from "./PostHogProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
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
  );
}
