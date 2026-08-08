"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAddressUrl } from "@/lib/constants/chains";
import { truncateAddress } from "./formatters";

/** Underlined tab strip. The product page's only navigation. */
export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { id: T; label: string; count?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Fund sections"
      className="-mx-5 overflow-x-auto border-b border-border px-5 sm:mx-0 sm:px-0"
    >
      <div className="flex min-w-max gap-7">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              id={`product-tab-${tab.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`product-panel-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={cn(
                "focus-ring relative -mb-px border-b-2 pb-3 pt-1 text-[13px] font-medium transition-colors",
                selected
                  ? "border-brand text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span
                  data-numeric
                  className="ml-1.5 text-[11px] font-normal text-subtle-foreground"
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SectionHeading({
  title,
  note,
  action,
}: {
  title: string;
  note?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-[14px] font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {note && (
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
            {note}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 self-start">{action}</div>}
    </div>
  );
}

/** Label-over-value fact. Reads as prose, not as a table cell. */
export function Fact({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11.5px] text-subtle-foreground">{label}</dt>
      <dd
        data-numeric
        className="mt-1.5 truncate text-[13.5px] font-medium text-foreground"
      >
        {value}
      </dd>
      {hint && <p className="mt-0.5 text-[11px] text-subtle-foreground">{hint}</p>}
    </div>
  );
}

export function FactGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
      {children}
    </dl>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <p className="text-[13px] text-muted-foreground">{title}</p>
      {body && (
        <p className="mx-auto mt-1.5 max-w-sm text-[11.5px] leading-relaxed text-subtle-foreground">
          {body}
        </p>
      )}
    </div>
  );
}

/** An on-chain address: truncated, copyable, and linked to the explorer. */
export function AddressLine({
  label,
  address,
  chainId,
}: {
  label: string;
  address?: string | null;
  chainId: number;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the explorer link still works */
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-subtle py-2.5 last:border-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      {address ? (
        <span className="flex items-center gap-1.5">
          <a
            href={getAddressUrl(chainId, address)}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1 rounded font-mono text-[12px] text-muted-foreground hover:text-foreground"
          >
            {truncateAddress(address, 4)}
            <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
          </a>
          <button
            onClick={copy}
            aria-label={`Copy ${label} address`}
            className="focus-ring rounded p-1 text-subtle-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="h-3 w-3 text-positive" strokeWidth={2} />
            ) : (
              <Copy className="h-3 w-3" strokeWidth={1.75} />
            )}
          </button>
        </span>
      ) : (
        <span className="text-[12px] text-subtle-foreground">—</span>
      )}
    </div>
  );
}
