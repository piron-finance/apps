"use client";

import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { getChainName } from "@/lib/constants/chains";
import type { Instrument, ProductInstance } from "@/lib/api/types";
import {
  DASH,
  daysUntil,
  formatBps,
  formatDate,
  formatNumber,
  formatUsd,
} from "./formatters";
import { useDeploymentInstruments, useDeploymentNavHistories } from "./use-deployments";
import { EmptyState, SectionHeading } from "./ui";

const INSTRUMENT_TYPE: Record<string, string> = {
  DISCOUNTED: "Discount instrument",
  INTEREST_BEARING: "Interest-bearing",
};

type ScopedInstrument = Instrument & { chainId: number };

/**
 * What the fund owns. Cash and deployed value are money, so across networks
 * they sum; the instrument register is the concatenation of each deployment's,
 * tagged with the network it sits on.
 */
export function HoldingsSection({
  instances,
  scopeLabel,
  isAll,
}: {
  instances: ProductInstance[];
  scopeLabel: string;
  isAll: boolean;
}) {
  const { streams } = useDeploymentNavHistories(instances, "30d");
  const { instruments, active, matured, isLoading } = useDeploymentInstruments(instances);

  const navPriced = streams.some((s) => s.navType !== "none");

  // Latest snapshot per network, summed — the fund's current balance sheet.
  const composition = useMemo(() => {
    let deployed = 0;
    let cash = 0;
    let fees = 0;
    let found = false;

    for (const stream of streams) {
      const latest = stream.data?.[stream.data.length - 1];
      if (!latest) continue;
      found = true;
      deployed += parseFloat(latest.instrumentValue || "0");
      cash += parseFloat(latest.cashReserves || "0");
      fees += parseFloat(latest.accruedFees || "0");
    }

    const total = deployed + cash;
    if (!found || !(total > 0)) return null;
    return {
      deployed,
      cash,
      fees,
      deployedPct: (deployed / total) * 100,
      cashPct: (cash / total) * 100,
    };
  }, [streams]);

  const totalFaceValue = instruments
    .filter((i) => i.isActive)
    .reduce((sum, i) => sum + parseFloat(i.faceValue || "0"), 0);

  const shareOf = (instrument: Instrument) =>
    totalFaceValue > 0
      ? (parseFloat(instrument.faceValue || "0") / totalFaceValue) * 100
      : null;

  return (
    <div className="space-y-10">
      <section>
        <SectionHeading
          title="Portfolio composition"
          note={
            isAll
              ? `How capital is held across all ${instances.length} networks, summed from each one's latest NAV snapshot.`
              : `How capital is held on ${scopeLabel}, as of the latest NAV snapshot.`
          }
        />

        {composition ? (
          <>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="bg-brand"
                style={{ width: `${composition.deployedPct}%` }}
                aria-hidden
              />
              <div
                className="bg-brand-line"
                style={{ width: `${composition.cashPct}%` }}
                aria-hidden
              />
            </div>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <CompositionStat
                swatch="bg-brand"
                label="Deployed in instruments"
                amount={formatUsd(composition.deployed)}
                share={composition.deployedPct}
              />
              <CompositionStat
                swatch="bg-brand-line"
                label="Cash reserves"
                amount={formatUsd(composition.cash)}
                share={composition.cashPct}
              />
              <div>
                <p className="text-[11.5px] text-subtle-foreground">Accrued fees</p>
                <p data-numeric className="mt-1.5 text-[14px] font-medium text-foreground">
                  {formatUsd(composition.fees)}
                </p>
                <p className="mt-1 text-[11px] text-subtle-foreground">Netted out of NAV</p>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title={!navPriced ? "This fund isn't NAV-priced" : "No NAV snapshot yet"}
            body={
              !navPriced
                ? "Capital is committed to a single deal rather than valued per share, so there's no cash/deployed split to report."
                : "Composition appears once the first on-chain valuation is recorded."
            }
          />
        )}
      </section>

      <section>
        <SectionHeading
          title="Instruments"
          note="The individual securities backing the deployed portion of the fund."
          action={
            instruments.length > 0 ? (
              <span data-numeric className="text-[11.5px] text-subtle-foreground">
                {active} active · {matured} matured
              </span>
            ) : undefined
          }
        />

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : instruments.length === 0 ? (
          <EmptyState
            title={
              isAll
                ? "No instruments recorded on any network"
                : `No instruments recorded on ${scopeLabel}`
            }
            body={
              composition && composition.cash > 0
                ? "Capital is currently held as cash reserves. Instruments appear here once the SPV deploys it."
                : "Instruments appear here once the SPV purchases securities for this fund."
            }
          />
        ) : (
          <>
            {/* Cards on small screens — a seven-column table doesn't survive 375px. */}
            <div className="space-y-3 md:hidden">
              {instruments.map((inst) => (
                <InstrumentCard
                  key={`${inst.chainId}-${inst.id}`}
                  instrument={inst}
                  share={shareOf(inst)}
                  showNetwork={isAll}
                />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-border-subtle text-[11px] text-subtle-foreground">
                    <th className="pb-3 text-left font-normal">Instrument</th>
                    <th className="pb-3 text-left font-normal">Identifier</th>
                    <th className="pb-3 text-left font-normal">Maturity</th>
                    <th className="pb-3 text-right font-normal">Face value</th>
                    <th className="pb-3 text-right font-normal">Coupon</th>
                    <th className="pb-3 text-right font-normal">Rating</th>
                    <th className="pb-3 text-right font-normal">% of portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {instruments.map((inst) => {
                    const days = daysUntil(inst.maturityDate);
                    const share = shareOf(inst);
                    return (
                      <tr
                        key={`${inst.chainId}-${inst.id}`}
                        className="border-b border-border-subtle last:border-0"
                      >
                        <td className="py-3.5">
                          <p className="text-[12.5px] font-medium text-foreground">
                            {inst.issuer ||
                              INSTRUMENT_TYPE[inst.instrumentType] ||
                              inst.instrumentType}
                          </p>
                          <p className="mt-0.5 text-[11px] text-subtle-foreground">
                            {INSTRUMENT_TYPE[inst.instrumentType] ?? inst.instrumentType}
                            {isAll && ` · ${getChainName(inst.chainId)}`}
                            {!inst.isActive && " · matured"}
                          </p>
                        </td>
                        <td className="py-3.5 font-mono text-[12px] text-muted-foreground">
                          {inst.cusip || inst.isin || DASH}
                        </td>
                        <td className="py-3.5">
                          <p data-numeric className="text-[12px] text-foreground">
                            {formatDate(inst.maturityDate)}
                          </p>
                          {inst.isActive && days != null && (
                            <p className="mt-0.5 text-[11px] text-subtle-foreground">
                              {days >= 0 ? `in ${days}d` : `${Math.abs(days)}d overdue`}
                            </p>
                          )}
                        </td>
                        <td
                          data-numeric
                          className="py-3.5 text-right text-[12.5px] font-medium text-foreground"
                        >
                          {formatNumber(inst.faceValue, 2)}
                        </td>
                        <td
                          data-numeric
                          className="py-3.5 text-right text-[12px] text-muted-foreground"
                        >
                          {inst.annualCouponRate != null
                            ? formatBps(inst.annualCouponRate)
                            : DASH}
                        </td>
                        <td className="py-3.5 text-right text-[12px] text-muted-foreground">
                          {inst.rating || DASH}
                        </td>
                        <td
                          data-numeric
                          className="py-3.5 text-right text-[12px] text-muted-foreground"
                        >
                          {share != null ? `${share.toFixed(2)}%` : DASH}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {instruments.some((i) => i.documentUrl) && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
                {instruments
                  .filter((i) => i.documentUrl)
                  .map((i) => (
                    <a
                      key={`${i.chainId}-${i.id}`}
                      href={i.documentUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1.5 text-[11.5px] text-muted-foreground hover:border-border-strong hover:text-foreground"
                    >
                      {i.cusip || i.issuer || `Instrument ${i.instrumentId}`}
                      <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                    </a>
                  ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function CompositionStat({
  swatch,
  label,
  amount,
  share,
}: {
  swatch: string;
  label: string;
  amount: string;
  share: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${swatch}`} aria-hidden />
        <p className="text-[11.5px] text-subtle-foreground">{label}</p>
      </div>
      <p data-numeric className="mt-1.5 text-[14px] font-medium text-foreground">
        {amount}
      </p>
      <p data-numeric className="mt-1 text-[11px] text-subtle-foreground">
        {share.toFixed(1)}%
      </p>
    </div>
  );
}

function InstrumentCard({
  instrument,
  share,
  showNetwork,
}: {
  instrument: ScopedInstrument;
  share: number | null;
  showNetwork: boolean;
}) {
  const days = daysUntil(instrument.maturityDate);
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-sunken p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-medium text-foreground">
            {instrument.issuer ||
              INSTRUMENT_TYPE[instrument.instrumentType] ||
              instrument.instrumentType}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-subtle-foreground">
            {instrument.cusip || instrument.isin || DASH}
            {showNetwork && (
              <span className="font-sans"> · {getChainName(instrument.chainId)}</span>
            )}
          </p>
        </div>
        <span data-numeric className="shrink-0 text-[12.5px] font-medium text-foreground">
          {formatNumber(instrument.faceValue, 2)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span data-numeric>
          Matures {formatDate(instrument.maturityDate)}
          {instrument.isActive && days != null && days >= 0 ? ` · in ${days}d` : ""}
        </span>
        {instrument.annualCouponRate != null && (
          <span data-numeric>{formatBps(instrument.annualCouponRate)} coupon</span>
        )}
        {instrument.rating && <span>{instrument.rating}</span>}
        {share != null && <span data-numeric>{share.toFixed(1)}% of portfolio</span>}
      </div>
    </div>
  );
}
