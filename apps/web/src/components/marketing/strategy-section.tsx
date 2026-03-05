"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

const strategies = [
  {
    id: "stable",
    type: "Stable Yield",
    name: "Daily Access Pool",
    description: "Park idle capital and earn while you wait. Withdraw anytime after 7 days.",
    details: {
      title: "Instant liquidity, real returns",
      subtitle: "Perfect for treasuries and patient capital",
      description:
        "Your funds flow into diversified short-term instruments like T-bills and commercial paper. NAV updates daily, and you can exit after a brief holding window.",
      features: ["7-day minimum hold", "Daily NAV updates", "No lockup penalties"],
    },
  },
  {
    id: "locked",
    type: "Locked Term",
    name: "Fixed Term Pool",
    description: "Lock in today's rate. Know exactly what you'll earn at maturity.",
    details: {
      title: "Predictable income, guaranteed rate",
      subtitle: "Best for planned expenses and runway extension",
      description:
        "Commit for 3, 6, or 12 months and lock in a fixed rate. Auto-roll at maturity or withdraw. Early exit available with a transparent penalty.",
      features: ["Fixed rate at deposit", "Auto-roll option", "Early exit available"],
    },
  },
  {
    id: "single",
    type: "Single Asset",
    name: "Deal-Specific Pool",
    description: "Fund real trade deals. Higher yield, specific maturity dates.",
    details: {
      title: "Direct exposure, full transparency",
      subtitle: "For those who want to pick their deals",
      description:
        "Each pool funds a specific asset like an invoice, trade finance deal, or corporate credit. You see exactly what backs your investment, with defined payment dates.",
      features: ["Deal-by-deal visibility", "Fixed maturity dates", "SPV-backed security"],
    },
  },
];

export function StrategySection() {
  const [activeStrategy, setActiveStrategy] = useState(strategies[0]);

  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-[11px] font-normal uppercase tracking-[0.2em] text-white/40">
              Choose your strategy
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-white">
              Three ways to earn. One dashboard.
            </h2>
            <p className="mt-3 max-w-lg text-base font-normal leading-relaxed text-white/50">
              Whether you need instant access, fixed returns, or want to pick specific deals, there's a pool for that.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href={APP_URL}
              className="text-sm font-medium text-white/70 underline underline-offset-4 transition-colors hover:text-white"
            >
              View all pools →
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {strategies.map((strategy, idx) => (
              <motion.button
                key={strategy.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => setActiveStrategy(strategy)}
                className={`w-full rounded-xl border p-5 text-left transition-all ${
                  activeStrategy.id === strategy.id
                    ? "border-[#00C48C]/50 bg-[#00C48C]/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="mb-1 text-xs text-white/40">
                  {strategy.type}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  {strategy.name}
                </h3>
                <p className="mt-1 text-sm text-white/50">
                  {strategy.description}
                </p>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStrategy.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-6 lg:p-8"
            >
              <div className="mb-6">
                <p className="mb-1 text-[10px] font-normal uppercase tracking-[0.15em] text-[#00C48C]">
                  {activeStrategy.type}
                </p>
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  {activeStrategy.details.title}
                </h3>
                <p className="mt-1 text-sm text-white/50">
                  {activeStrategy.details.subtitle}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-white/60">
                {activeStrategy.details.description}
              </p>

              <div className="mt-6 space-y-2">
                {activeStrategy.details.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-white/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00C48C]" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href={APP_URL}
                  className="inline-flex rounded-full bg-[#00C48C] px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#00D99A]"
                >
                  Explore pools
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
