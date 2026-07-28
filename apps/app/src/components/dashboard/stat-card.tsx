"use client";

import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  badge?: string;
  /** Signals the badge tone. Defaults to positive. */
  badgeTone?: "positive" | "negative" | "neutral";
  subtitle?: string;
  className?: string;
}

const badgeTones = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-subtle-foreground",
} as const;

/** The bare figure: label above, value, footnote below. */
export function Stat({
  label,
  value,
  badge,
  badgeTone = "positive",
  subtitle,
  className,
}: StatCardProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="eyebrow">{label}</p>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span
          data-numeric
          className="text-[25px] font-semibold leading-none tracking-display text-foreground"
        >
          {value}
        </span>
        {badge && (
          <span
            data-numeric
            className={cn("text-[12px] font-medium", badgeTones[badgeTone])}
          >
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 truncate text-[12px] text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Headline figures, ruled top and bottom and divided by hairlines. Deliberately
 * not a card — these are the page's own numbers, not a widget sitting on it.
 */
export function MetricRow({ items }: { items: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-2 border-y border-border lg:grid-cols-4">
      {items.map((item, i) => {
        // Two columns below lg, four at lg. A cell gets a left rule unless it
        // starts its row, and a top rule only when it wraps onto a second row.
        const startsMobileRow = i % 2 === 0;
        const startsWideRow = i === 0;
        return (
          <div
            key={item.label}
            className={cn(
              "py-5 lg:py-6",
              startsMobileRow ? "pr-5" : "pl-5",
              !startsMobileRow && "border-l border-border-subtle",
              i > 1 && "border-t border-border-subtle",
              // At four-up, only the first cell is flush and rule-free.
              "lg:border-t-0",
              startsWideRow
                ? "lg:pl-0 lg:pr-5"
                : "lg:border-l lg:border-border-subtle lg:pl-5 lg:pr-5",
            )}
          >
            <Stat {...item} />
          </div>
        );
      })}
    </div>
  );
}

/** Kept for callers that still want a single bordered figure. */
export function StatCard({ className, ...props }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border border-border p-5", className)}>
      <Stat {...props} />
    </div>
  );
}

/** @deprecated use `MetricRow` */
export const OverviewStrip = MetricRow;
