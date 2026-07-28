"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectFieldProps = React.ComponentProps<"select"> & {
  /** Rendered inside the control, before the value — e.g. "Asset". */
  prefix?: string;
  wrapperClassName?: string;
};

/**
 * A native `<select>` wearing the design system. Native keeps the mobile
 * picker (and keyboard behaviour) that a custom listbox would have to rebuild.
 */
export function SelectField({
  prefix,
  className,
  wrapperClassName,
  ...props
}: SelectFieldProps) {
  return (
    <div
      className={cn(
        "group relative inline-flex h-7 items-center gap-1.5 rounded border border-border pl-2.5 pr-2 text-[12px] transition-colors focus-within:border-brand/45 hover:border-border-strong",
        wrapperClassName,
      )}
    >
      {prefix && (
        <span className="shrink-0 text-subtle-foreground">{prefix}</span>
      )}
      <select
        className={cn(
          "peer cursor-pointer appearance-none bg-transparent pr-4 font-medium text-foreground outline-none",
          className,
        )}
        {...props}
      />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-subtle-foreground transition-colors group-hover:text-muted-foreground"
        strokeWidth={2}
      />
    </div>
  );
}
