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
  positive: "bg-positive-soft text-positive",
  negative: "bg-negative-soft text-negative",
  neutral: "bg-muted text-muted-foreground",
} as const;

/**
 * A single figure. Used standalone (portfolio) and as the cell of
 * `<OverviewStrip>` on the pools dashboard.
 */
export function StatCard({
  label,
  value,
  badge,
  badgeTone = "positive",
  subtitle,
  className,
}: StatCardProps) {
  return (
    <div className={cn("surface-card p-5", className)}>
      <Stat
        label={label}
        value={value}
        badge={badge}
        badgeTone={badgeTone}
        subtitle={subtitle}
      />
    </div>
  );
}

/** The bare figure, without a surface of its own. */
export function Stat({
  label,
  value,
  badge,
  badgeTone = "positive",
  subtitle,
}: Omit<StatCardProps, "className">) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span
          data-numeric
          className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-foreground"
        >
          {value}
        </span>
        {badge && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
              badgeTones[badgeTone],
            )}
          >
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Four platform figures read as one instrument, divided by hairlines, rather
 * than four disconnected boxes floating on the canvas.
 */
export function OverviewStrip({ items }: { items: StatCardProps[] }) {
  return (
    <div className="surface-card grid grid-cols-1 gap-px overflow-hidden bg-border-subtle sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-surface p-5 sm:p-6">
          <Stat {...item} />
        </div>
      ))}
    </div>
  );
}
