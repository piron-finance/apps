"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { syncWeb3ModalTheme } from "./web3modal";

/** What the user picked. "system" follows the OS. */
export type ThemePreference = "light" | "dark" | "system";
/** What is actually painted. */
export type Theme = "light" | "dark";

/** Kept in sync with the inline bootstrap script in `app/layout.tsx`. */
// v2: the original key stranded anyone who had tried dark before the theme
// control was reliably clickable. Bumping it discards those values so every
// visitor lands on the light default once, and genuine choices persist after.
export const THEME_STORAGE_KEY = "piron-theme-v2";
/** Light, explicitly — not "system". A finance dashboard should open bright. */
export const DEFAULT_THEME: ThemePreference = "light";

type ThemeContextValue = {
  /** The user's choice, including "system". */
  preference: ThemePreference;
  /** The theme actually applied right now. */
  theme: Theme;
  setPreference: (preference: ThemePreference) => void;
  /** False until the client has read the persisted value — use it to avoid SSR mismatches. */
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): Theme {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolve(preference: ThemePreference): Theme {
  return preference === "system" ? systemTheme() : preference;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  syncWeb3ModalTheme(theme);
}

function readStored(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "light" || stored === "system"
      ? stored
      : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(DEFAULT_THEME);
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // The inline script has already put the right class on <html>; this syncs
  // React state to it so the control renders the correct selection.
  useEffect(() => {
    const stored = readStored();
    setPreferenceState(stored);
    const next = resolve(stored);
    setThemeState(next);
    applyTheme(next);
    setMounted(true);
  }, []);

  // Track the OS setting, but only act on it while the preference is "system".
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readStored() !== "system") return;
      const next = systemTheme();
      setThemeState(next);
      applyTheme(next);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Follow the preference when it is changed in another tab.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const stored = readStored();
      setPreferenceState(stored);
      const next = resolve(stored);
      setThemeState(next);
      applyTheme(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    const resolved = resolve(next);
    setThemeState(resolved);
    applyTheme(resolved);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing — the theme still applies for this session.
    }
  }, []);

  const value = useMemo(
    () => ({ preference, theme, setPreference, mounted }),
    [preference, theme, setPreference, mounted],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
