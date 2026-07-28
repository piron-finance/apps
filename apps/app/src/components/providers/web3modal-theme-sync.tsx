"use client";

import { useEffect } from "react";
import { useWeb3ModalTheme } from "@web3modal/wagmi/react";
import { useTheme } from "./theme-provider";

/**
 * The wallet modal lives outside our React tree and paints its own chrome, so a
 * light-mode app would otherwise pop a black modal. Keep it in lockstep.
 */
export function Web3ModalThemeSync() {
  const { theme, mounted } = useTheme();
  const { setThemeMode, setThemeVariables } = useWeb3ModalTheme();

  useEffect(() => {
    if (!mounted) return;
    setThemeMode(theme);
    setThemeVariables({
      "--w3m-accent": theme === "dark" ? "#00cf55" : "#0a5f3f",
      "--w3m-border-radius-master": "2px",
      "--w3m-font-family": "var(--font-sans), ui-sans-serif, system-ui",
    });
  }, [theme, mounted, setThemeMode, setThemeVariables]);

  return null;
}
