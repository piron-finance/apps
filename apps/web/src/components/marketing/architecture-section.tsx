"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  {
    id: "ringfence",
    label: "Ring-fenced Capital",
    title: "Your capital, legally protected",
    description:
      "Each pool is backed by a dedicated legal entity. Your deposits are completely separated from protocol operations and other pools.",
    bullets: [
      "Bankruptcy remote structure",
      "Per-pool legal isolation",
      "Independent fund administration",
    ],
    tint: "rgba(0, 196, 140, 0.15)",
  },
  {
    id: "custody",
    label: "Custody & Escrow",
    title: "Institutional-grade custody",
    description:
      "Deposits are held in segregated escrow accounts with qualified custodians. No commingling, no shortcuts.",
    bullets: [
      "Qualified custodian partners",
      "Segregated escrow accounts",
      "Multi-signature controls",
    ],
    tint: "rgba(59, 130, 246, 0.15)",
  },
  {
    id: "transparency",
    label: "On-chain Verification",
    title: "Don't trust. Verify.",
    description:
      "Every deposit, allocation, and yield event is recorded on-chain. Full audit trail, accessible to anyone, anytime.",
    bullets: [
      "Real-time on-chain accounting",
      "Public transaction history",
      "Independent audit support",
    ],
    tint: "rgba(139, 92, 246, 0.15)",
  },
  {
    id: "compliance",
    label: "Global Compliance",
    title: "Compliance built in, not bolted on",
    description:
      "KYC verification, jurisdiction-aware access controls, and regulatory reporting are embedded into the protocol from day one.",
    bullets: [
      "Integrated KYC/AML",
      "Jurisdiction-aware pools",
      "Regulatory reporting ready",
    ],
    tint: "rgba(245, 158, 11, 0.15)",
  },
];






export function ArchitectureSection() {
  const [activeTab, setActiveTab] = useState(0);
  const active = tabs[activeTab];

  return (
    <section data-header-theme="dark" className="relative bg-[#0a0a0b] py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,196,140,0.04),transparent)]" />

      <div className="relative mx-auto w-full max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="mb-16 max-w-3xl"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/40">
            Institutional architecture
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Built on trust.
            <br />
            Verified on-chain.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/50">
            Every layer of the protocol is designed around one principle: your
            capital is always protected, always transparent, and always under
            your control.
          </p>
        </motion.div>

        {/* Tabs + Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]"
        >
          {/* Tab list */}
          <div className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-5 py-4 text-left text-sm font-medium transition-all lg:whitespace-normal ${
                  activeTab === idx
                    ? "bg-white/[0.08] text-white"
                    : "bg-transparent text-white/35 hover:bg-white/[0.03] hover:text-white/55"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feature card */}
          <div className="relative min-h-[360px] overflow-hidden rounded-2xl sm:min-h-[400px]">
            <Image
              src="/hero-bg-crater.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id + "-tint"}
                className="absolute inset-0"
                style={{ backgroundColor: active.tint }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="relative flex h-full min-h-[360px] flex-col justify-end p-6 sm:min-h-[400px] sm:p-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {active.title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/60">
                  {active.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {active.bullets.map((bullet) => (
                    <span
                      key={bullet}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/70"
                    >
                      {bullet}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
