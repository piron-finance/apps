"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

/**
 * One button, one job. A two-position switch made the theme look like a
 * product setting; it is a viewing preference.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${next} theme` : "Switch theme"}
      title={mounted ? `Switch to ${next} theme` : "Switch theme"}
      className={cn(
        "focus-ring relative flex h-8 w-8 items-center justify-center rounded text-subtle-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {/* Both icons render; opacity crossfades so nothing shifts on toggle. */}
      <Sun
        className={cn(
          "absolute h-[15px] w-[15px] transition-opacity duration-200",
          mounted && theme === "light" ? "opacity-100" : "opacity-0",
        )}
        strokeWidth={1.8}
      />
      <Moon
        className={cn(
          "absolute h-[15px] w-[15px] transition-opacity duration-200",
          mounted && theme === "dark" ? "opacity-100" : "opacity-0",
        )}
        strokeWidth={1.8}
      />
    </button>
  );
}
