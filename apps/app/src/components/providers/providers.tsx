import { ConvexClientProvider } from "./ConvexClientProvider";
import Web3ModalProvider from "./web3modal";
import { UserSync } from "../../lib/user-sync";
import { PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
  return (
    <Web3ModalProvider>
      <ConvexClientProvider>
        <UserSync />
        {children}
      </ConvexClientProvider>
    </Web3ModalProvider>
  );
}
