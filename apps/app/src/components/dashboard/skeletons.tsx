"use client";

import { cn } from "@/lib/utils";

/**
 * Shimmer skeletons used in place of "Loading…" text, so the dashboard reads as
 * instant and intentional while data streams in. Shapes mirror the real content.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "after:absolute after:inset-0 after: after:animate-shimmer",
        "after:bg-gradient-to-r after:from-transparent after:via-foreground/[0.06] after:to-transparent",
        className,
      )}
    />
  );
}

export function PoolCardSkeleton() {
  return (
    <div className="border-b border-border-subtle py-4">
      <div className="mb-5 flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="mb-2.5 h-4 w-2/3" />
      <Skeleton className="mb-5 h-3 w-2/5" />
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-border-subtle">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 bg-surface-sunken p-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-2.5 w-10" />
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function PoolCardSkeletonGrid({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PoolCardSkeleton key={i} />
      ))}
    </>
  );
}

export function SidebarRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
