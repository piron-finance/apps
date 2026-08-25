"use client";

import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  useTheme,
  type ThemePreference,
} from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { preference, theme, setPreference, mounted } = useTheme();

  // Before mount the stored preference is unknown; show the painted theme.
  const TriggerIcon = !mounted
    ? Sun
    : (OPTIONS.find((o) => o.value === preference)?.Icon ??
      (theme === "dark" ? Moon : Sun));

  return (
    <Menu>
      <MenuTrigger
        aria-label="Theme"
        className={cn(
          "focus-ring inline-flex h-8 items-center gap-1 rounded px-2 text-subtle-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground",
          className,
        )}
      >
        <TriggerIcon className="h-[15px] w-[15px]" strokeWidth={1.8} />
        <ChevronDown className="h-3 w-3" strokeWidth={2} />
      </MenuTrigger>

      <MenuContent className="w-44">
        <MenuLabel>Theme</MenuLabel>
        {OPTIONS.map(({ value, label, Icon }) => {
          const selected = mounted && preference === value;
          return (
            <MenuItem
              key={value}
              onSelect={() => setPreference(value)}
              className="gap-2.5"
            >
              <Icon
                className="h-3.5 w-3.5 text-muted-foreground"
                strokeWidth={1.8}
              />
              <span className="flex-1">{label}</span>
              {selected && (
                <Check
                  className="h-3.5 w-3.5 text-brand-ink"
                  strokeWidth={2.5}
                />
              )}
            </MenuItem>
          );
        })}
      </MenuContent>
    </Menu>
  );
}
