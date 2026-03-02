"use client";

import { motion } from "framer-motion";

const poolTypes = [
  {
    label: "STABLE YIELD POOLS",
    title: "Rolling liquidity.",
    description:
      "Always-on income from short-term paper. Deposit anytime, exit after a small holding window.",
    features: ["7-day minimum hold", "NAV grows, not your headaches"],
  },
  {
    label: "LOCKED POOLS",
    title: "Pick your clock.",
    description:
      "Fixed-term, fixed-rate. 3, 6, 12 months. Auto-roll or exit with transparent penalties.",
    features: ["Upfront or maturity interest", "Per-position tracking"],
  },
  {
    label: "SINGLE-ASSET POOLS",
    title: "One deal, full story.",
    description:
      "Fund specific invoices, trade finance or corporate credit — with SPV details in plain sight.",
    features: ["Deal-by-deal exposure", "Transparent maturities"],
  },
];

const badges = [
  "NAV native · ERC-4626",
  "On-chain audit trail",
  "KYC-ready rails",
];

export function PoolTypes() {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs sm:text-sm text-gray-500 tracking-widest uppercase mb-4"
            >
              Built for the future of finance
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              Serious credit, single tap.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-gray-400 text-base sm:text-lg"
            >
              Under the hood: SPVs, escrows and managers. On the surface: three
              pool types that just work.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            {badges.map((badge) => (
              <span
                key={badge}
                className="px-3 py-1.5 text-xs sm:text-sm text-gray-400 border border-gray-800 rounded-lg bg-gray-900/50"
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {poolTypes.map((pool, index) => (
            <motion.div
              key={pool.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="group relative bg-[#0a0f0d] border border-[#1a2a24] rounded-2xl p-6 sm:p-8 hover:border-[#00c48c]/30 transition-colors"
            >
              <div className="space-y-4">
                <span className="text-xs text-gray-500 tracking-widest uppercase">
                  {pool.label}
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  {pool.title}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  {pool.description}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800/50 flex flex-wrap gap-2">
                {pool.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1.5 text-xs text-gray-500 border border-gray-800 rounded-lg"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
