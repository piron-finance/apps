/**
 * Cross-deployment maths.
 *
 * A product runs independently on N networks, so every figure on the fund page
 * is either a **sum** (money: TVL, cash, deployed, investors) or a **TVL-weighted
 * average** (per-unit rates: NAV per share, APY). Scoping to one network is just
 * the same maths over an array of one — callers never branch.
 */

import type { NAVHistoryPoint, Pool, ProductInstance } from "@/lib/api/types";

/** `"all"` = every deployment; a number scopes to that chain. */
export type ChainScope = number | "all";

const num = (v: string | number | null | undefined): number => {
  const n = typeof v === "number" ? v : parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
};

export function sumTvl(instances: ProductInstance[]): number {
  return instances.reduce((s, i) => s + num(i.tvl), 0);
}

/**
 * TVL-weighted NAV per share. Shares aren't fungible across chains, so this is
 * a portfolio-level average, not a redeemable price — label it as such.
 */
export function weightedNav(instances: ProductInstance[]): number | null {
  const withNav = instances.filter((i) => i.navPerShare != null);
  if (!withNav.length) return null;
  const totalTvl = withNav.reduce((s, i) => s + num(i.tvl), 0);
  if (totalTvl > 0) {
    return withNav.reduce((s, i) => s + num(i.navPerShare) * num(i.tvl), 0) / totalTvl;
  }
  return withNav.reduce((s, i) => s + num(i.navPerShare), 0) / withNav.length;
}

/** TVL-weighted APY, matching how the backend blends `aggregates.blendedApy`. */
export function weightedApy(instances: ProductInstance[]): number | null {
  const withApy = instances.filter((i) => i.apy != null);
  if (!withApy.length) return null;
  const totalTvl = withApy.reduce((s, i) => s + num(i.tvl), 0);
  if (totalTvl > 0) {
    return withApy.reduce((s, i) => s + (i.apy as number) * num(i.tvl), 0) / totalTvl;
  }
  return withApy.reduce((s, i) => s + (i.apy as number), 0) / withApy.length;
}

/** Investor counts are per-pool; the grand total is their sum. */
export function totalInvestors(pools: Pool[]): number | null {
  const counts = pools
    .map((p) => p.analytics?.uniqueInvestors)
    .filter((n): n is number => typeof n === "number");
  if (!counts.length) return null;
  return counts.reduce((s, n) => s + n, 0);
}

/** One minimum if every network agrees, otherwise the range. */
export function minimumInvestment(
  instances: ProductInstance[],
): { min: number; max: number; symbol: string } | null {
  if (!instances.length) return null;
  const values = instances.map((i) => num(i.minInvestment));
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    symbol: instances[0]!.assetSymbol,
  };
}

// ── NAV series ────────────────────────────────────────────────────────────────

export interface NavSeriesPoint {
  /** YYYY-MM-DD */
  day: string;
  nav: number;
}

/**
 * Collapse per-network snapshot streams into one daily series.
 *
 * Snapshots land many times a day and at different moments on each chain, so we
 * take each network's last snapshot per day, forward-fill networks that didn't
 * report that day, and weight by each one's total NAV. A network contributes
 * only from its own first snapshot onward — never back-filled to par.
 */
export function aggregateNavSeries(
  streams: NAVHistoryPoint[][],
): NavSeriesPoint[] {
  const perChain = streams.map((points) => {
    const byDay = new Map<string, { nav: number; weight: number }>();
    for (const p of points) {
      const day = new Date(p.timestamp).toISOString().slice(0, 10);
      // Later snapshot on the same day wins.
      byDay.set(day, { nav: num(p.navPerShare), weight: num(p.totalNAV) });
    }
    return byDay;
  });

  const days = [...new Set(perChain.flatMap((m) => [...m.keys()]))].sort();
  const carried: ({ nav: number; weight: number } | null)[] = perChain.map(() => null);
  const out: NavSeriesPoint[] = [];

  for (const day of days) {
    let weighted = 0;
    let weight = 0;
    let simple = 0;
    let seen = 0;

    perChain.forEach((byDay, idx) => {
      const value = byDay.get(day) ?? carried[idx];
      if (!value) return;
      carried[idx] = value;
      weighted += value.nav * value.weight;
      weight += value.weight;
      simple += value.nav;
      seen += 1;
    });

    if (!seen) continue;
    out.push({ day, nav: weight > 0 ? weighted / weight : simple / seen });
  }

  return out;
}

export interface SeriesStats {
  /** Return across the window, percent. */
  periodReturn: number;
  /** That return annualised, percent. Null when the window is too short. */
  annualised: number | null;
  /** Annualised standard deviation of daily returns, percent. */
  volatility: number | null;
  /** Span the stats cover. */
  days: number;
}

export function seriesStats(points: NavSeriesPoint[]): SeriesStats | null {
  if (points.length < 2) return null;

  const first = points[0]!;
  const last = points[points.length - 1]!;
  if (!(first.nav > 0)) return null;

  const days = Math.max(
    1,
    Math.round(
      (new Date(last.day).getTime() - new Date(first.day).getTime()) / 86_400_000,
    ),
  );

  const growth = last.nav / first.nav;
  const periodReturn = (growth - 1) * 100;
  const annualised = days >= 7 ? (Math.pow(growth, 365 / days) - 1) * 100 : null;

  const returns: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!.nav;
    if (prev > 0) returns.push(Math.log(points[i]!.nav / prev));
  }

  let volatility: number | null = null;
  if (returns.length >= 2) {
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance =
      returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (returns.length - 1);
    volatility = Math.sqrt(variance) * Math.sqrt(365) * 100;
  }

  return { periodReturn, annualised, volatility, days };
}

/**
 * Return since the fund opened. NAV-priced pools launch at par, so the current
 * per-share value is itself the cumulative return.
 */
export function returnSinceInception(nav: number | null): number | null {
  if (nav == null || !(nav > 0)) return null;
  return (nav - 1) * 100;
}
