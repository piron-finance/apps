"use client";

/**
 * Shimmer skeletons used in place of "Loading…" text, so the dashboard reads as
 * instant and intentional while data streams in. Shapes mirror the real content.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[#141416] ${className}`} />;
}

export function PoolCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>
      <Skeleton className="mb-2 h-4 w-2/3" />
      <Skeleton className="mb-3 h-3 w-1/2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
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
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
