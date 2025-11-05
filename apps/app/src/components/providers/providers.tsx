import { ConvexClientProvider } from "./ConvexClientProvider";
import Web3ModalProvider from "./web3modal";
import { UserSync } from "../../lib/user-sync";
import { PropsWithChildren } from "react";
import { QueryProvider } from "@/providers/QueryProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <Web3ModalProvider>
      <ConvexClientProvider>
        <QueryProvider>
          <UserSync />
          {children}
        </QueryProvider>
      </ConvexClientProvider>
    </Web3ModalProvider>
  );
}
