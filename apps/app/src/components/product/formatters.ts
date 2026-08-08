/**
 * Value formatting shared by the product (fund) page sections.
 *
 * Every helper returns an em dash for missing/unparseable input rather than a
 * zero — a fund page must never imply a figure it doesn't have.
 */

const DASH = "—";

function toNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

/** Abbreviated money for headline figures: $2.94M, $1.03K. */
export function formatCompactUsd(value: string | number | null | undefined): string {
  const n = toNumber(value);
  if (n == null) return DASH;
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

/** Full money, grouped: $1,029,984.63. */
export function formatUsd(
  value: string | number | null | undefined,
  digits = 2,
): string {
  const n = toNumber(value);
  if (n == null) return DASH;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

/** Bare number, grouped — for share counts and asset-denominated amounts. */
export function formatNumber(
  value: string | number | null | undefined,
  digits = 2,
): string {
  const n = toNumber(value);
  if (n == null) return DASH;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(
  value: string | number | null | undefined,
  digits = 2,
): string {
  const n = toNumber(value);
  if (n == null) return DASH;
  return `${n.toFixed(digits)}%`;
}

/** Basis points → percent. Instrument coupons are stored in bps. */
export function formatBps(value: number | null | undefined): string {
  if (value == null) return DASH;
  return `${(value / 100).toFixed(2)}%`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return DASH;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return DASH;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Whole days from now until `value`; negative when already past. */
export function daysUntil(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - Date.now()) / 86_400_000);
}

export function truncateAddress(address: string | null | undefined, size = 4): string {
  if (!address) return DASH;
  if (address.length <= size * 2 + 2) return address;
  return `${address.slice(0, size + 2)}…${address.slice(-size)}`;
}

/**
 * Evenly thin a series down to `max` points, always keeping the last one so the
 * chart's right edge stays the true latest value.
 */
export function downsample<T>(points: T[], max: number): T[] {
  if (points.length <= max) return points;
  const step = points.length / max;
  const out: T[] = [];
  for (let i = 0; i < max; i++) out.push(points[Math.floor(i * step)]!);
  const last = points[points.length - 1]!;
  if (out[out.length - 1] !== last) out[out.length - 1] = last;
  return out;
}

export { DASH };
