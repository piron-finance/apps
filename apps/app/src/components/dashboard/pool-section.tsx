"use client";

import { ReactNode } from "react";

interface PoolSectionProps {
  title: string;
  description: string;
  filters?: ReactNode;
  count?: number;
  children: ReactNode;
}

/**
 * A section is a heading, a line of explanation and a table. No container, no
 * border of its own — the table's own rules do the separating.
 */
export function PoolSection({
  title,
  description,
  filters,
  count,
  children,
}: PoolSectionProps) {
  return (
    <section className="scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 pb-4">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-[18px] font-semibold tracking-title text-foreground">
            {title}
          </h2>
          {count !== undefined && (
            <span data-numeric className="text-[12.5px] text-subtle-foreground">
              {count} {count === 1 ? "pool" : "pools"}
            </span>
          )}
        </div>
        {filters}
      </div>

      <p className="max-w-2xl pb-7 text-[13.5px] leading-relaxed text-muted-foreground">
        {description}
      </p>

      {children}
    </section>
  );
}
