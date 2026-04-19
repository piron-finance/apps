"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Deposit Stablecoins",
    description:
      "Connect your wallet and deposit USDC, USDT, or local stablecoins. No bank account needed.",
  },
  {
    number: "02",
    title: "Select Pool",
    description:
      "Choose from stable yield, locked term, or single-asset pools based on your goals.",
  },
  {
    number: "03",
    title: "Earn Real Yield",
    description:
      "Watch your balance grow. Withdraw freely after the minimum holding period.",
  },
];

export function HowItWorks() {
  return (
    <section data-header-theme="light" className="bg-surface-warm py-32">
      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-20 max-w-2xl"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-content-tertiary">
            Getting started
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-content-primary md:text-5xl lg:text-6xl">
            Start earning in three steps.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 gap-y-8 lg:grid-cols-3">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
                {/* Gradient-faded ghost number */}
                <span className="text-6xl tracking-tight font-bold opacity-45  md:text-7xl">
                  {step.number}
                </span>

      
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-content-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-content-secondary">
                    {step.description}
                  </p>
      
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
