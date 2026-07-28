"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light" as const, label: "Light", Icon: Sun },
  { value: "dark" as const, label: "Dark", Icon: Moon },
];

/**
 * A two-position segmented switch rather than a single icon button: the current
 * theme is legible at a glance instead of being implied by the icon shown.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, mounted } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "relative inline-flex items-center rounded-full border border-border bg-surface-sunken p-0.5",
        className,
      )}
    >
      {/* Sliding thumb — hidden until mounted so SSR never shows the wrong side. */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0.5 top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-full bg-surface shadow-card transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          !mounted && "opacity-0",
          theme === "dark" && "translate-x-[calc(100%+2px)]",
        )}
      />
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            onClick={() => setTheme(value)}
            className={cn(
              "focus-ring relative z-10 flex h-7 w-8 items-center justify-center rounded-full transition-colors",
              active
                ? "text-foreground"
                : "text-subtle-foreground hover:text-muted-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
