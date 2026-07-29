"use client";

import React, { ReactNode } from "react";
import { config } from "@/configs";

import { createWeb3Modal } from "@web3modal/wagmi/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { State, WagmiProvider } from "wagmi";

const queryClient = new QueryClient();
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!projectId) throw new Error("Project ID is not defined");

const modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
  themeMode: "light",
});

/**
 * Push our theme into the wallet modal, which paints its own chrome outside
 * the React tree.
 *
 * This is deliberately imperative. The previous version was a component using
 * `useWeb3ModalTheme()`, which subscribes to the modal's own store: writing to
 * that store from an effect re-rendered the subscriber, which re-ran the
 * effect, which wrote again. The result was an unbounded synchronous React
 * render loop that froze the page on the first state update after mount — so
 * the first click on any menu locked the entire app. Nothing here subscribes.
 */
export function syncWeb3ModalTheme(theme: "light" | "dark") {
  try {
    modal.setThemeMode(theme);
    modal.setThemeVariables({
      "--w3m-accent": theme === "dark" ? "#00cf55" : "#0a5f3f",
      "--w3m-border-radius-master": "2px",
    });
  } catch {
    // The modal may not be ready yet; the next theme change will catch up.
  }
}

export default function Web3ModalProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
