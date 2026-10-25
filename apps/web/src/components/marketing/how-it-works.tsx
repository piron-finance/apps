"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Explore",
    description:
      "Browse flexible, fixed-rate and term products in one market view.",
  },
  {
    number: "02",
    title: "Compare",
    description:
      "Review the assets, rate, holding period, payment schedule and exit terms.",
  },
  {
    number: "03",
    title: "Invest",
    description:
      "Connect your wallet, choose an amount and confirm the transaction onchain.",
  },
  {
    number: "04",
    title: "Track",
    description:
      "Follow position value, cash flows and activity from one portfolio.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      data-header-theme="light"
      className="bg-[#f4f1eb] py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-20"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#737a75]">
              How it works
            </p>
            <h2 className="mt-5 max-w-3xl text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171b18]">
              From first look to full portfolio.
            </h2>
          </div>
          <p className="max-w-xl text-[16px] leading-7 text-[#616862]">
            Piron keeps the decision and the position in the same place, so you
            can understand what you own before and after you invest.
          </p>
        </motion.div>

        <div className="mt-16 grid border-y border-black/10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className={`min-h-[250px] py-8 sm:px-7 lg:min-h-[280px] lg:px-8 lg:py-10 ${
                index % 2 === 1 ? "sm:border-l sm:border-black/10" : ""
              } ${index > 1 ? "border-t border-black/10 lg:border-t-0" : ""} ${
                index > 0 ? "lg:border-l lg:border-black/10" : ""
              }`}
            >
              <span className="font-mono text-[10px] text-black/30">
                {step.number}
              </span>
              <h3 className="mt-14 text-[25px] font-semibold tracking-[-0.04em] text-[#1b201d]">
                {step.title}
              </h3>
              <p className="mt-4 max-w-[250px] text-[13px] leading-6 text-[#68706a]">
                {step.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
