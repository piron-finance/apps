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
    <section className="py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center text-4xl font-bold tracking-tight text-white"
        >
          How it works
        </motion.h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="text-left"
            >
              <span className="text-6xl font-bold tracking-tight text-white/10 md:text-7xl">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
