import Web3ModalProvider from "./web3modal";
import { PropsWithChildren } from "react";
import { QueryProvider } from "@/providers/QueryProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <Web3ModalProvider>
      <QueryProvider>{children}</QueryProvider>
    </Web3ModalProvider>
  );
}
