"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type MouseHandlerDataParam,
} from "recharts";
import type { ProductInstance } from "@/lib/api/types";
import {
  aggregateNavSeries,
  returnSinceInception,
  seriesStats,
  weightedNav,
} from "./aggregate";
import { downsample, formatNumber, formatPercent } from "./formatters";
import { useDeploymentNavHistories } from "./use-deployments";
import { EmptyState, SectionHeading } from "./ui";

const PERIODS = { "30D": "30d", "90D": "90d", "1Y": "365d" } as const;
type Period = keyof typeof PERIODS;

const MAX_POINTS = 180;

/**
 * NAV per share over time. Across networks it's the TVL-weighted average of the
 * per-network values, bucketed by day — snapshots land many times a day and at
 * different moments on each chain, so raw points would double-count.
 */
export function PerformanceSection({
  instances,
  scopeLabel,
  isAll,
}: {
  instances: ProductInstance[];
  scopeLabel: string;
  isAll: boolean;
}) {
  const [period, setPeriod] = useState<Period>("30D");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { streams, isLoading } = useDeploymentNavHistories(instances, PERIODS[period]);

  const symbol = instances[0]?.assetSymbol ?? "";
  const currentNav = weightedNav(instances);

  const series = useMemo(
    () => aggregateNavSeries(streams.map((s) => s.data ?? [])),
    [streams],
  );

  const chartData = useMemo(
    () =>
      downsample(
        series.map((p) => ({
          date: new Date(`${p.day}T00:00:00Z`).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }),
          nav: p.nav,
        })),
        MAX_POINTS,
      ),
    [series],
  );

  const stats = useMemo(() => seriesStats(series), [series]);
  const hasHistory = chartData.length >= 2;

  const { minNav, maxNav } = useMemo(() => {
    if (!chartData.length) return { minNav: 0, maxNav: 1 };
    const values = chartData.map((d) => d.nav);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.12 || 0.001;
    return { minNav: min - pad, maxNav: max + pad };
  }, [chartData]);

  const last = chartData[chartData.length - 1]?.nav ?? currentNav;
  const hovered = activeIndex != null ? chartData[activeIndex] : null;
  const displayNav = hovered?.nav ?? last;
  const inception = returnSinceInception(last ?? currentNav);

  const onMove = useCallback((state: MouseHandlerDataParam) => {
    // recharts widens the index to string | number | null depending on axis type.
    const index = Number(state?.activeTooltipIndex);
    setActiveIndex(Number.isInteger(index) ? index : null);
  }, []);
  const onLeave = useCallback(() => setActiveIndex(null), []);

  // SINGLE_ASSET and LOCKED pools have no floating NAV — nothing to plot.
  if (streams.length > 0 && streams.every((s) => s.navType === "none")) return null;

  return (
    <section>
      <SectionHeading
        title="Net asset value"
        note={
          isAll
            ? `TVL-weighted average per-share value across ${instances.length} networks, from daily on-chain snapshots.`
            : `Per-share value on ${scopeLabel}, from daily on-chain snapshots.`
        }
        action={
          <div className="inline-flex items-center gap-0.5 rounded border border-border bg-surface-sunken p-0.5">
            {(Object.keys(PERIODS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`focus-ring rounded-sm px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                  period === p
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          data-numeric
          className="text-[26px] font-semibold leading-none tracking-display text-foreground"
        >
          {displayNav != null ? formatNumber(displayNav, 4) : "—"}
        </span>
        <span className="text-[12.5px] text-muted-foreground">{symbol}</span>
        {stats && (
          <span
            data-numeric
            className={`text-[12.5px] font-medium ${
              stats.periodReturn >= 0 ? "text-positive" : "text-negative"
            }`}
          >
            {stats.periodReturn >= 0 ? "+" : ""}
            {stats.periodReturn.toFixed(2)}%{" "}
            <span className="font-normal text-subtle-foreground">{period}</span>
          </span>
        )}
        {hovered && (
          <span className="text-[11.5px] text-subtle-foreground">{hovered.date}</span>
        )}
      </div>

      <div className="mt-5 h-56">
        {isLoading && !hasHistory ? (
          <div className="h-full animate-pulse rounded-lg bg-muted" />
        ) : !hasHistory ? (
          <EmptyState
            title="Building NAV history"
            body={`The chart fills in as daily snapshots accrue.${
              currentNav ? ` Current NAV is ${formatNumber(currentNav, 4)} ${symbol}.` : ""
            }`}
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            >
              <defs>
                <linearGradient id="productNavGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--chart-grid))" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={{ stroke: "hsl(var(--chart-grid))" }}
                tickLine={false}
                tick={{ fill: "hsl(var(--chart-axis))", fontSize: 10 }}
                interval="preserveStartEnd"
                minTickGap={48}
              />
              <YAxis
                domain={[minNav, maxNav]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--chart-axis))", fontSize: 10 }}
                tickFormatter={(v: number) => v.toFixed(4)}
                width={58}
              />
              <Tooltip
                content={<NavTooltip symbol={symbol} />}
                cursor={{
                  stroke: "hsl(var(--chart-1))",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="nav"
                stroke="hsl(var(--chart-1))"
                strokeWidth={1.75}
                fill="url(#productNavGradient)"
                dot={false}
                isAnimationActive={false}
                activeDot={{
                  r: 4,
                  fill: "hsl(var(--chart-1))",
                  stroke: "hsl(var(--surface))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/*
        Derived from the NAV series above rather than from an API: the backend
        has no performance endpoint (`/pools/:addr/stats` returns raw analytics),
        so these are computed from the same snapshots the chart plots.
      */}
      <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-border-subtle pt-4 sm:grid-cols-4">
        <PerfStat
          label={`Return (${period})`}
          value={stats ? formatPercent(stats.periodReturn, 2) : "—"}
          tone={stats ? (stats.periodReturn >= 0 ? "positive" : "negative") : undefined}
        />
        <PerfStat
          label="Annualised"
          value={stats?.annualised != null ? formatPercent(stats.annualised, 2) : "—"}
          hint={stats ? `over ${stats.days}d` : undefined}
        />
        <PerfStat
          label="Volatility"
          value={stats?.volatility != null ? formatPercent(stats.volatility, 2) : "—"}
          hint="annualised"
        />
        <PerfStat
          label="Since inception"
          value={inception != null ? formatPercent(inception, 2) : "—"}
          tone={inception != null ? (inception >= 0 ? "positive" : "negative") : undefined}
          hint="from par"
        />
      </div>

      <p className="mt-4 text-[11px] text-subtle-foreground">
        Past performance is not a guarantee of future returns.
      </p>
    </section>
  );
}

function PerfStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div>
      <p className="text-[11px] text-subtle-foreground">{label}</p>
      <p
        data-numeric
        className={`mt-1 text-[14px] font-medium ${
          tone === "positive"
            ? "text-positive"
            : tone === "negative"
              ? "text-negative"
              : "text-foreground"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[10.5px] text-subtle-foreground">{hint}</p>}
    </div>
  );
}

function NavTooltip({
  active,
  payload,
  label,
  symbol,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  symbol: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-border bg-surface px-3 py-2 shadow-[var(--shadow-pop)]">
      <p className="text-[10.5px] text-subtle-foreground">{label}</p>
      <p data-numeric className="mt-0.5 text-[12.5px] font-medium text-foreground">
        {formatNumber(payload[0]!.value, 4)} {symbol}
      </p>
    </div>
  );
}
