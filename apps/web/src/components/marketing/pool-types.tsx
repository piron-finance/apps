"use client";

import { motion } from "framer-motion";

const poolTypes = [
  {
    label: "STABLE YIELD",
    title: "Always liquid.",
    description:
      "Withdraw anytime after 7 days. Your capital earns from day one while staying accessible.",
    features: ["7-day holding period", "Daily yield accrual"],
  },
  {
    label: "LOCKED TERM",
    title: "Fixed and done.",
    description:
      "Pick your term: 3, 6, or 12 months. Lock in today's rate and know exactly what you'll earn.",
    features: ["Guaranteed rate", "Auto-roll available"],
  },
  {
    label: "SINGLE ASSET",
    title: "Pick your deal.",
    description:
      "Fund specific invoices or trade deals. See exactly what backs your investment.",
    features: ["Full transparency", "Defined maturities"],
  },
];

const badges = [
  "On-chain audit trail",
  "KYC-ready",
  "Global access",
];

export function PoolTypes() {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-[11px] font-normal uppercase tracking-[0.2em] text-white/40">
              Built for the future of finance
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-white">
              Three pools. Zero complexity.
            </h2>
            <p className="mt-3 max-w-md text-base font-normal leading-relaxed text-white/50">
              Regulated SPVs, professional managers, institutional custody under the hood. 
              On the surface: deposit, earn, withdraw.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2"
          >
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/50"
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {poolTypes.map((pool, idx) => (
            <motion.article
              key={pool.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
            >
              <p className="mb-4 text-[10px] font-normal uppercase tracking-[0.15em] text-white/40">
                {pool.label}
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-white">
                {pool.title}
              </h3>
              <p className="mt-2 text-sm font-normal leading-relaxed text-white/50">
                {pool.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {pool.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
