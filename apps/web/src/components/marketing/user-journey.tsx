"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "Pick your money mood.",
    description:
      "Need flexible? Go Stable Yield. Craving certainty? Choose Locked. Spot a deal you love? Tap Single-Asset.",
  },
  {
    number: 2,
    title: "Deposit once, get shares.",
    description:
      "Approve your stablecoin, send funds, receive ERC-4626 shares. Piron handles NAV, queues and routing.",
  },
  {
    number: 3,
    title: "Watch coupons, not charts.",
    description:
      "Track NAV, holding periods and upcoming coupons in one timeline — from Lagos invoices to U.S. T-bills.",
  },
];

const tabs = ["Wallet connect", "Pool selection", "On-chain receipts"];

export function UserJourney() {
  return (
    <section className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12 lg:mb-16">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs sm:text-sm text-gray-500 tracking-widest uppercase mb-4"
            >
              User Journey
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              From wallet to coupon in three beats.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-gray-400 text-base sm:text-lg"
            >
              No arcane dashboards. No mystery boxes. Just a clear path from
              deposit to real-world yield.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-2"
          >
            {tabs.map((tab, index) => (
              <span
                key={tab}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  index === 0
                    ? "bg-gray-800 text-white"
                    : "text-gray-500 border border-gray-800"
                }`}
              >
                {tab}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="relative bg-[#0a0f0d] border border-[#1a2a24] rounded-2xl p-6 sm:p-8"
            >
              <div className="mb-6">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 text-gray-400 text-sm">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
