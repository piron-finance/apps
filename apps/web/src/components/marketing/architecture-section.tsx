"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";

const tabs = [
  {
    id: "terms",
    label: "Terms",
    eyebrow: "Decision 01",
    title: "Know the return—and the conditions.",
    description:
      "Rate type, minimum, term and payment timing sit together, so the headline number never appears without the rules behind it.",
    rows: [
      ["Rate format", "Variable or fixed"],
      ["Term", "Published per product"],
      ["Payments", "Upfront, periodic or maturity"],
    ],
  },
  {
    id: "allocation",
    label: "Allocation",
    eyebrow: "Decision 02",
    title: "See what is doing the work.",
    description:
      "Review the underlying assets, portfolio allocation and latest valuation instead of relying on a vague yield label.",
    rows: [
      ["Underlying assets", "Named and described"],
      ["Allocation", "Visible by instrument"],
      ["Valuation", "NAV tracked over time"],
    ],
  },
  {
    id: "liquidity",
    label: "Liquidity",
    eyebrow: "Decision 03",
    title: "Understand how you get out.",
    description:
      "Holding periods, maturity dates, withdrawal mechanics and any early-exit cost are visible before you commit capital.",
    rows: [
      ["Access", "Product-specific"],
      ["Withdrawal", "Terms shown upfront"],
      ["Early exit", "Cost disclosed when offered"],
    ],
  },
  {
    id: "records",
    label: "Records",
    eyebrow: "After you invest",
    title: "Keep the full position in view.",
    description:
      "Position value, return, product documents and onchain activity stay attached to the investment in your portfolio.",
    rows: [
      ["Position", "Value and return"],
      ["Activity", "Onchain transaction history"],
      ["Documents", "Kept with the product"],
    ],
  },
] as const;

export function ArchitectureSection() {
  const [activeTab, setActiveTab] = useState(0);
  const active = tabs[activeTab];

  return (
    <section
      id="why-piron"
      data-header-theme="dark"
      className="relative overflow-hidden bg-[#101713] py-24 text-white sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(44,128,91,0.2),transparent_34%)]" />
      <div className="marketing-dark-grid pointer-events-none absolute inset-0 opacity-35" />

      <div className="relative mx-auto w-full max-w-[1320px] px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#83a092]">
              Clarity by design
            </p>
            <h2 className="mt-5 text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-[#f4f2ec]">
              Know what you own. Before you invest.
            </h2>
          </div>
          <p className="max-w-2xl self-end text-[17px] leading-7 text-white/55">
            Serious finance should not require blind trust. Piron brings the
            decision-critical facts into one product view, so you can compare
            the trade-off—not decode the wrapper.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 lg:grid-cols-[280px_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`group flex min-w-[152px] items-center justify-between rounded-md border px-4 py-3.5 text-left text-[13px] font-medium transition-all lg:min-w-0 ${
                  activeTab === index
                    ? "border-white/20 bg-white/[0.09] text-white"
                    : "border-transparent text-white/42 hover:border-white/[0.08] hover:text-white/70"
                }`}
              >
                {tab.label}
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-opacity ${
                    activeTab === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="overflow-hidden rounded-xl border border-white/10 bg-[#f8f6f1] text-[#1c251f] shadow-[0_30px_90px_-45px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center justify-between border-b border-[#dedcd5] px-5 py-4 sm:px-7">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[#167454]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#69716b]">
                  Product detail
                </span>
              </div>
              <span className="text-[11px] text-[#8a908b]">What Piron shows</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24 }}
                className="grid min-h-[410px] lg:grid-cols-[1.05fr_0.95fr]"
              >
                <div className="flex flex-col justify-between p-6 sm:p-9 lg:p-12">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#738078]">
                      {active.eyebrow}
                    </p>
                    <h3 className="mt-4 max-w-xl text-[30px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[38px]">
                      {active.title}
                    </h3>
                    <p className="mt-5 max-w-xl text-[14px] leading-6 text-[#68706a]">
                      {active.description}
                    </p>
                  </div>
                  <p className="mt-10 flex items-center gap-2 text-[12px] font-medium text-[#2f624c]">
                    <Check className="h-4 w-4" />
                    Visible before deposit
                  </p>
                </div>

                <div className="border-t border-[#dedcd5] bg-white/55 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-9">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8a918c]">
                    At a glance
                  </p>
                  <dl className="mt-6 divide-y divide-[#e2e0da] border-y border-[#e2e0da]">
                    {active.rows.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-6 py-5"
                      >
                        <dt className="text-[12px] text-[#838984]">{label}</dt>
                        <dd className="text-right text-[13px] font-medium text-[#27312a]">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-7 rounded-md border border-[#dce5df] bg-[#eef4f0] p-4">
                    <p className="text-[11px] font-semibold text-[#2f604b]">
                      The important part
                    </p>
                    <p className="mt-1.5 text-[11px] leading-5 text-[#647169]">
                      The terms and risks travel with the product—not just the
                      marketing headline.
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
