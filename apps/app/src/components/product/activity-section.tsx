"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { getChainName, getTransactionUrl } from "@/lib/constants/chains";
import type { ProductInstance } from "@/lib/api/types";
import { formatDateTime, formatNumber, truncateAddress } from "./formatters";
import { useDeploymentTransactions } from "./use-deployments";
import { EmptyState, SectionHeading } from "./ui";

const FILTERS = ["all", "deposits", "redemptions"] as const;
type Filter = (typeof FILTERS)[number];

const isDeposit = (type: string) => type === "DEPOSIT" || type === "POSITION_CREATED";
const isRedemption = (type: string) =>
  type === "WITHDRAWAL" || type === "POSITION_REDEEMED" || type === "EARLY_EXIT";

const TYPE_LABEL: Record<string, string> = {
  POSITION_CREATED: "Deposit",
  POSITION_REDEEMED: "Redeem",
  INTEREST_PAYMENT: "Interest",
};

const label = (type: string) =>
  TYPE_LABEL[type] ?? type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ");

/** Subscription and redemption flow, merged across the scoped deployments. */
export function ActivitySection({
  instances,
  scopeLabel,
  isAll,
}: {
  instances: ProductInstance[];
  scopeLabel: string;
  isAll: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const { transactions, isLoading } = useDeploymentTransactions(instances, 25);

  const symbol = instances[0]?.assetSymbol ?? "";
  const rows = transactions.filter((tx) =>
    filter === "all"
      ? true
      : filter === "deposits"
        ? isDeposit(tx.type)
        : isRedemption(tx.type),
  );

  return (
    <section>
      <SectionHeading
        title="Activity"
        note={
          isAll
            ? `Deposits and redemptions across all ${instances.length} networks, newest first.`
            : `Deposits and redemptions on ${scopeLabel}.`
        }
        action={
          <div className="inline-flex items-center gap-0.5 rounded border border-border bg-surface-sunken p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`focus-ring rounded-sm px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      {isLoading && rows.length === 0 ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title={filter === "all" ? "No activity yet" : `No ${filter} in this window`}
          body={
            filter === "all"
              ? "Deposits and redemptions will appear here."
              : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] text-subtle-foreground">
                <th className="pb-3 text-left font-normal">Time</th>
                <th className="pb-3 text-left font-normal">Type</th>
                {isAll && <th className="pb-3 text-left font-normal">Network</th>}
                <th className="pb-3 text-left font-normal">Investor</th>
                <th className="pb-3 text-right font-normal">Amount</th>
                <th className="pb-3 text-right font-normal">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tx) => (
                <tr
                  key={`${tx.chainId}-${tx.id}`}
                  className="border-b border-border-subtle last:border-0"
                >
                  <td data-numeric className="py-3 text-[12px] text-muted-foreground">
                    {formatDateTime(tx.timestamp)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
                        isDeposit(tx.type)
                          ? "bg-positive-soft text-positive"
                          : isRedemption(tx.type)
                            ? "bg-negative-soft text-negative"
                            : "bg-info-soft text-info"
                      }`}
                    >
                      {label(tx.type)}
                    </span>
                  </td>
                  {isAll && (
                    <td className="py-3 text-[12px] text-muted-foreground">
                      {getChainName(tx.chainId)}
                    </td>
                  )}
                  <td className="py-3 font-mono text-[12px] text-muted-foreground">
                    {truncateAddress(tx.userWallet || tx.user?.walletAddress || tx.from)}
                  </td>
                  <td
                    data-numeric
                    className="py-3 text-right text-[12.5px] font-medium text-foreground"
                  >
                    {formatNumber(tx.amount)} {symbol}
                  </td>
                  <td className="py-3 text-right">
                    <a
                      href={getTransactionUrl(tx.chainId, tx.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring inline-flex items-center gap-1 rounded font-mono text-[12px] text-muted-foreground hover:text-foreground"
                    >
                      {truncateAddress(tx.txHash)}
                      <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
