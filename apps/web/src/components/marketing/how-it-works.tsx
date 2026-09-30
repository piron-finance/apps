"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Explore",
    description:
      "Browse flexible yield, fixed yield and term deals in one market view.",
  },
  {
    number: "02",
    title: "Review",
    description:
      "Compare the rate, term, underlying assets, liquidity and risks.",
  },
  {
    number: "03",
    title: "Invest",
    description:
      "Choose a network, connect your wallet and deposit into the product.",
  },
  {
    number: "04",
    title: "Track",
    description:
      "Keep every position, value, return and transaction in one portfolio.",
  },
] as const;

const operations = ["Subscribe", "Allocate", "Value", "Service", "Redeem"];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      data-header-theme="light"
      className="bg-[#fffefa] py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <p className="marketing-eyebrow">The investor journey</p>
          <h2 className="marketing-heading mt-5">
            From first look to full portfolio.
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-7 text-[#676e69]">
            Piron keeps the experience deliberately simple, while giving you
            enough information to make your own decision at every step.
          </p>
        </motion.div>

        <div className="mt-16 grid border-y border-[#dedbd3] sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className={`relative min-h-[260px] px-0 py-8 sm:px-7 lg:min-h-[290px] lg:px-8 lg:py-10 ${
                index % 2 === 1 ? "sm:border-l sm:border-[#dedbd3]" : ""
              } ${
                index > 1 ? "border-t border-[#dedbd3] lg:border-t-0" : ""
              } ${index > 0 ? "lg:border-l lg:border-[#dedbd3]" : ""}`}
            >
              <span className="font-mono text-[11px] text-[#9aa09b]">
                {step.number}
              </span>
              <h3 className="mt-14 text-[26px] font-semibold tracking-[-0.035em] text-[#1d261f]">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[240px] text-[13px] leading-6 text-[#6d746f]">
                {step.description}
              </p>
              {index < steps.length - 1 ? (
                <ArrowRight className="absolute right-6 top-9 hidden h-4 w-4 text-[#b0b4af] lg:block" />
              ) : null}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.6 }}
          className="mt-24 overflow-hidden rounded-xl border border-[#dad8d1] bg-[#f5f2eb]"
        >
          <div className="grid lg:grid-cols-[0.86fr_1.14fr]">
            <div className="border-b border-[#dad8d1] p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
              <p className="marketing-eyebrow">The system underneath</p>
              <h3 className="mt-5 max-w-lg text-[clamp(2.2rem,4vw,3.8rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1a231d]">
                Simple on the surface. Serious underneath.
              </h3>
              <p className="mt-6 max-w-lg text-[14px] leading-6 text-[#676f69]">
                Piron is the operating layer for global fixed income. The same
                system handles subscriptions, capital allocation, NAV, cash
                flows and redemptions across every product structure.
              </p>
            </div>

            <div className="p-7 sm:p-10 lg:p-14">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="rounded-lg border border-[#d8d8d1] bg-white p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8e948f]">
                    One product family
                  </p>
                  <div className="mt-5 space-y-2.5">
                    {[
                      "Flexible yield",
                      "Fixed yield",
                      "Term deals",
                    ].map((label, index) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 border-b border-[#ece9e3] pb-2.5 last:border-0 last:pb-0"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            index === 0
                              ? "bg-[#167454]"
                              : index === 1
                                ? "bg-[#426a9f]"
                                : "bg-[#b76b18]"
                          }`}
                        />
                        <span className="text-[12px] font-medium text-[#3d4741]">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center text-[#9aa09b]">
                  <ArrowRight className="hidden h-4 w-4 sm:block" />
                  <ArrowDown className="h-4 w-4 sm:hidden" />
                </div>

                <div className="rounded-lg border border-[#174f3b] bg-[#123f30] p-5 text-white shadow-[0_16px_34px_-24px_rgba(18,63,48,0.8)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/46">
                    Piron operating layer
                  </p>
                  <div className="mt-5 space-y-2.5">
                    {operations.map((operation) => (
                      <div
                        key={operation}
                        className="flex items-center justify-between border-b border-white/10 pb-2.5 last:border-0 last:pb-0"
                      >
                        <span className="text-[12px] font-medium text-white/82">
                          {operation}
                        </span>
                        <span className="font-mono text-[9px] text-white/32">
                          ONCHAIN
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#d8d8d1] bg-white/65 px-5 py-4 text-center text-[11px] leading-5 text-[#737a75]">
                Built to support government bills, commercial paper, trade
                finance and selected private deals across markets.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
