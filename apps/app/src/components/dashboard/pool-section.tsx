"use client";

import { ReactNode } from "react";

interface PoolSectionProps {
  label: string;
  title: string;
  subtitle: string;
  filters?: ReactNode;
  /** Shown next to the eyebrow, e.g. "4 pools". */
  count?: number;
  children: ReactNode;
}

/**
 * Sections sit directly on the canvas — no card wrapping other cards. The
 * eyebrow / serif title / lede stack does the separating work that a border
 * used to do, which stops the page reading as boxes inside boxes.
 */
export function PoolSection({
  label,
  title,
  subtitle,
  filters,
  count,
  children,
}: PoolSectionProps) {
  return (
    <section className="scroll-mt-24">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5">
            <span className="eyebrow">{label}</span>
            {count !== undefined && count > 0 && (
              <span className="rounded-full bg-surface-sunken px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {count}
              </span>
            )}
          </div>
          <h2 className="mt-2 font-display text-[26px] leading-[1.1] tracking-tight text-foreground sm:text-[30px]">
            {title}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>
        {filters && <div className="shrink-0">{filters}</div>}
      </div>

      {children}
    </section>
  );
}
