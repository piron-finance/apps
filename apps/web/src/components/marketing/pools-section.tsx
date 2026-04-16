"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { APP_URL } from "@/components/marketing/links";

const pools = [
  {
    number: "01",
    label: "Stable Yield",
    name: "Daily Access Pool",
    description:
      "Deposit stablecoins and start earning from day one. Your capital is allocated to Treasury Bills and short-duration instruments. Withdraw freely after a short holding period.",
    features: [
      { key: "Holding period", value: "7 days" },
      { key: "Yield source", value: "T-Bills, commercial paper" },
      { key: "Withdrawals", value: "Flexible, anytime after hold" },
      { key: "Pricing", value: "NAV-based, updated daily" },
    ],
  },
  {
    number: "02",
    label: "Locked Term",
    name: "Fixed Rate Pool",
    description:
      "Lock in a guaranteed rate for 90, 180, or 365 days. Know exactly what you'll earn before you deposit. At maturity, choose to withdraw or roll over into a new term automatically.",
    features: [
      { key: "Lock-in periods", value: "90 / 180 / 365 days" },
      { key: "Your rate", value: "Guaranteed at deposit" },
      { key: "At maturity", value: "Withdraw or auto-renew" },
      { key: "Early exit", value: "Available with a fee" },
    ],
  },
  {
    number: "03",
    label: "Single Asset",
    name: "Deal-Specific Pool",
    description:
      "Back a specific real-world asset: an invoice, trade deal, or bond. See the borrower, the terms, and the payment schedule before you commit a single dollar.",
    features: [
      { key: "Asset type", value: "Invoice, bond, trade deal" },
      { key: "Structure", value: "Ring-fenced, fixed maturity" },
      { key: "Returns", value: "Scheduled payments on-chain" },
      { key: "Minimum", value: "Pool-specific threshold" },
    ],
  },
];

export function PoolsSection() {
  return (
    <section data-header-theme="light" className="bg-surface-warm py-32">
      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-20 max-w-3xl"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-content-tertiary">
            Pool architecture
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-content-primary md:text-5xl lg:text-6xl">
            Three pool types.
            <br />
            Each built for a different mandate.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {pools.map((pool, idx) => (
            <motion.div
              key={pool.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            >
              <span className="text-5xl font-bold leading-none tracking-tight text-content-tertiary/15">
                {pool.number}
              </span>

              <h3 className="mt-5 text-xl font-bold tracking-tight text-content-primary">
                {pool.name}
              </h3>
              <p className="mt-1 text-[13px] font-medium uppercase tracking-[0.15em] text-content-tertiary">
                {pool.label}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-content-secondary">
                {pool.description}
              </p>

              <div className="mt-6 rounded-xl bg-surface-warm p-4">
                <div className="space-y-2.5">
                  {pool.features.map((f) => (
                    <div
                      key={f.key}
                      className="flex items-baseline justify-between gap-4"
                    >
                      <span className="text-xs text-content-tertiary">
                        {f.key}
                      </span>
                      <span className="text-right font-mono text-xs font-semibold text-content-primary">
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={APP_URL}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-content-primary transition-colors hover:text-accent"
              >
                Learn more
                <span aria-hidden="true">&#8594;</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
