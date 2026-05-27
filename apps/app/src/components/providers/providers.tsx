import Web3ModalProvider from "./web3modal";
import { PropsWithChildren } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ChainProvider } from "@/lib/context/ChainContext";

export function Providers({ children }: PropsWithChildren) {
  return (
    <Web3ModalProvider>
      <QueryProvider>
        <ChainProvider>{children}</ChainProvider>
      </QueryProvider>
    </Web3ModalProvider>
  );
}
