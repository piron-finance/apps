"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/footer";
import { APP_URL, DOCS_URL } from "@/components/marketing/links";

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      data-header-theme="dark"
      className="relative flex min-h-screen items-end overflow-hidden bg-[#0a0a0b]"
    >
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 md:pb-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/40"
        >
          How Piron works
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          Your money. Real assets.
          <br />
          <span className="text-white/40">Transparent yield.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-white/60"
        >
          Connect your wallet, deposit stablecoins, and earn yield backed by
          Treasury Bills, bonds, and trade finance. No bank account, no
          paperwork, no middlemen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <Link
            href={APP_URL}
            className="rounded-full bg-accent px-7 py-3 text-sm font-medium text-accent-text transition-colors hover:bg-accent-hover"
          >
            Start earning
          </Link>
          <Link
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-white/50 transition-colors hover:text-white"
          >
            Read the docs &#8594;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Capital Flow ─────────────────────────────────────────────────────────────

const flowNodes = [
  {
    step: "01",
    label: "Your Wallet",
    sub: "Connect any EVM wallet. Approve USDC, USDT, or CNGN. Nothing moves without your signature.",
  },
  {
    step: "02",
    label: "Smart Contract",
    sub: "An audited on-chain vault receives your deposit and issues pool tokens representing your share.",
  },
  {
    step: "03",
    label: "Segregated Escrow",
    sub: "A ring-fenced legal entity holds and deploys capital. Your funds are legally separated from Piron.",
  },
  {
    step: "04",
    label: "Real-World Assets",
    sub: "Licensed fund managers deploy into T-Bills, bonds, invoices, and trade finance.",
  },
  {
    step: "05",
    label: "Yield to You",
    sub: "Returns flow back on-chain as instruments pay interest or mature. Claim after the hold period.",
  },
];

function CapitalFlow() {
  return (
    <section data-header-theme="light" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-16 max-w-2xl"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-content-tertiary">
            The full picture
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-content-primary md:text-5xl">
            From wallet to yield.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-content-secondary">
            Your capital takes a transparent, verifiable journey through
            on-chain contracts, regulated entities, and real instruments.
          </p>
        </motion.div>

        {/* Desktop: horizontal with dotted connectors */}
        <div className="hidden md:block">
          <div className="grid grid-cols-5 gap-0">
            {flowNodes.map((node, i) => (
              <motion.div
                key={node.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Dotted line + arrow to next node */}
                {i < flowNodes.length - 1 && (
                  <div className="absolute left-[calc(50%+28px)] right-[calc(-50%+28px)] top-[22px] flex items-center">
                    <div className="h-0 flex-1 border-t-2 border-dashed border-border" />
                    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="shrink-0 -ml-px">
                      <path d="M1 1L6 6L1 11" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* Node circle */}
                <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-white">
                  <span className="text-xs font-bold text-content-primary">
                    {node.step}
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-semibold text-content-primary">
                  {node.label}
                </h3>
                <p className="mt-1.5 max-w-[180px] text-xs leading-relaxed text-content-secondary">
                  {node.sub}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Return flow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-10 flex items-center gap-4"
          >
            <div className="flex flex-1 items-center">
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="shrink-0 rotate-180 -mr-px">
                <path d="M1 1L6 6L1 11" stroke="rgba(0,196,140,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="h-0 flex-1 border-t-2 border-dashed border-accent/30" />
            </div>
            <span className="shrink-0 text-xs font-medium text-accent">
              Yield flows back to depositors on-chain
            </span>
            <div className="flex flex-1 items-center">
              <div className="h-0 flex-1 border-t-2 border-dashed border-accent/30" />
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="shrink-0 rotate-180 -ml-px">
                <path d="M1 1L6 6L1 11" stroke="rgba(0,196,140,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Mobile: vertical with dotted connectors */}
        <div className="md:hidden">
          {flowNodes.map((node, i) => (
            <motion.div
              key={node.step}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="relative"
            >
              <div className="flex items-start gap-4 py-4">
                {/* Node circle */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-white">
                  <span className="text-[11px] font-bold text-content-primary">
                    {node.step}
                  </span>
                </div>
                <div className="min-w-0 pt-1">
                  <h3 className="text-sm font-semibold text-content-primary">
                    {node.label}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-content-secondary">
                    {node.sub}
                  </p>
                </div>
              </div>

              {/* Dotted line + chevron down */}
              {i < flowNodes.length - 1 && (
                <div className="flex flex-col items-center py-0.5" style={{ marginLeft: 18 }}>
                  <div className="h-4 w-0 border-l-2 border-dashed border-border" />
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="-mt-px">
                    <path d="M1 1L6 6L11 1" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}

          {/* Return flow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 flex items-center gap-3"
          >
            <div className="flex items-center">
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="shrink-0 rotate-180">
                <path d="M1 1L6 6L1 11" stroke="rgba(0,196,140,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="h-0 w-8 border-t-2 border-dashed border-accent/30" />
            </div>
            <span className="text-xs font-medium text-accent">
              Yield flows back on-chain
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Step by Step ─────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Connect your wallet",
    description:
      "Use MetaMask, WalletConnect, Ledger, or any EVM-compatible wallet. No email, no account creation, no password. Your keys, your capital.",
    note: "KYC may be required for certain pools or jurisdictions.",
    tags: ["MetaMask", "WalletConnect", "Ledger", "Coinbase Wallet"],
  },
  {
    number: "02",
    title: "Pick your pool",
    description:
      "Browse live pools by type, yield, duration, and asset class. Each pool page shows real-time NAV, current APY, maturity date, and full allocation breakdown.",
    note: "Stable Yield pools are open 24/7. Locked Term and Single Asset pools have defined deposit windows.",
    tags: ["Stable Yield", "Locked Term", "Single Asset"],
  },
  {
    number: "03",
    title: "Deposit stablecoins",
    description:
      "Approve and send USDC, USDT, or CNGN to the pool contract in a single transaction. You receive pool tokens immediately representing your proportional share of the pool.",
    note: "Funds flow directly to the audited pool contract. Piron never holds your money.",
    tags: ["USDC", "USDT", "CNGN"],
  },
  {
    number: "04",
    title: "Earn, then withdraw",
    description:
      "Yield accrues to your pool token balance daily, reflected in NAV updates. After the minimum holding period, submit a withdrawal request. For Locked Term pools, wait for maturity or early exit with a transparent penalty.",
    note: "Every deposit, accrual, and withdrawal is recorded on-chain.",
    tags: ["Daily accrual", "7-day hold", "On-chain receipts"],
  },
];

function StepByStep() {
  return (
    <section data-header-theme="dark" className="bg-[#0a0a0b] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-16 max-w-2xl"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/40">
            Step by step
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            No jargon. Just the process.
          </h2>
        </motion.div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.05] md:p-8"
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[80px_1fr]">
                <span className="text-5xl font-bold leading-none tracking-tighter text-white/10 transition-colors group-hover:text-white/20">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
                    {step.description}
                  </p>
                  {step.note && (
                    <p className="mt-3 text-xs italic text-white/30">
                      {step.note}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pool Types ───────────────────────────────────────────────────────────────

const pools = [
  {
    id: "stable",
    type: "Stable Yield",
    tagline: "Park and earn.",
    headline: "Daily liquidity. Real returns.",
    description:
      "Deposit any amount and earn yield from diversified short-term instruments like T-Bills and money market funds. NAV updates daily. Withdraw after 7 days with no penalty.",
    ideal: "Idle capital, corporate treasuries, retail savers",
    features: [
      { label: "Min. hold", value: "7 days" },
      { label: "Yield type", value: "Variable, daily" },
      { label: "Backing", value: "T-Bills, MMFs" },
      { label: "Exit penalty", value: "None after 7d" },
    ],
  },
  {
    id: "locked",
    type: "Locked Term",
    tagline: "Fix your rate.",
    headline: "Guaranteed return at maturity.",
    description:
      "Commit capital for 3, 6, or 12 months and lock in today's rate. Choose interest upfront or at maturity. Auto-roll when the term ends. Early exit available with a transparent, pre-disclosed penalty.",
    ideal: "Planned expenses, runway extension, treasury laddering",
    features: [
      { label: "Term options", value: "3, 6, 12 mo." },
      { label: "Yield type", value: "Fixed at deposit" },
      { label: "Interest", value: "Upfront or maturity" },
      { label: "Early exit", value: "With penalty" },
    ],
  },
  {
    id: "single",
    type: "Single Asset",
    tagline: "Pick the deal.",
    headline: "Defined maturity. Full transparency.",
    description:
      "Each pool funds a specific real-world deal: an invoice, trade finance transaction, or corporate credit. You see exactly what backs your investment, the borrower, the term, the rate, and the payment date.",
    ideal: "Sophisticated investors, higher-yield seekers, deal-focused capital",
    features: [
      { label: "Maturity", value: "Per deal" },
      { label: "Yield type", value: "Fixed, deal-set" },
      { label: "Backing", value: "Single instrument" },
      { label: "Transparency", value: "Full deal view" },
    ],
  },
];

function PoolTypesSection() {
  const [active, setActive] = useState("stable");
  const pool = pools.find((p) => p.id === active)!;

  return (
    <section data-header-theme="light" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-2xl"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-content-tertiary">
            Choose your strategy
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-content-primary md:text-5xl">
            Three pools. One dashboard.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-content-secondary">
            Whether you need instant access, fixed returns, or want to pick
            specific deals, there is a pool built for that.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Selector */}
          <div className="flex flex-row gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {pools.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => setActive(p.id)}
                className={`shrink-0 flex-1 rounded-xl p-4 text-left transition-all lg:flex-none lg:p-5 ${
                  active === p.id
                    ? "bg-surface-warm shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                    : "bg-transparent hover:bg-surface-warm/50"
                }`}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-content-tertiary">
                  {p.type}
                </p>
                <p className="mt-1 text-sm font-semibold text-content-primary">
                  {p.tagline}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
              className="rounded-2xl bg-surface-warm p-6 md:p-8"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-content-tertiary">
                {pool.type}
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-content-primary">
                {pool.headline}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-content-secondary">
                {pool.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {pool.features.map((f) => (
                  <div
                    key={f.label}
                    className="rounded-xl bg-white px-3 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-content-tertiary">
                      {f.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-content-primary">
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <p className="text-[10px] uppercase tracking-wider text-content-tertiary">
                  Ideal for
                </p>
                <p className="mt-1 text-sm text-content-secondary">
                  {pool.ideal}
                </p>
              </div>

              <div className="mt-7">
                <Link
                  href={APP_URL}
                  className="inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-text transition-colors hover:bg-accent-hover"
                >
                  Explore {pool.type} pools &#8594;
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ─── Infrastructure ────────────────────────────────────────────────────────────

const layers = [
  {
    step: "01",
    title: "Your wallet",
    description:
      "Non-custodial at every step. You sign every transaction. Nothing moves without your approval.",
  },
  {
    step: "02",
    title: "Smart contracts",
    description:
      "Audited on-chain logic handles deposits, NAV accounting, and withdrawal queues. Open source.",
  },
  {
    step: "03",
    title: "Ring-fenced legal entity",
    description:
      "A dedicated legal entity holds capital and owns the instruments. Legally separated from Piron Finance.",
  },
  {
    step: "04",
    title: "Licensed fund manager",
    description:
      "Regulated professionals source, underwrite, and manage the underlying assets.",
  },
  {
    step: "05",
    title: "Real-world instruments",
    description:
      "T-Bills, bonds, trade receivables, commercial paper. Actual yield-bearing assets with defined maturities.",
  },
];

function Infrastructure() {
  return (
    <section data-header-theme="dark" className="bg-[#0a0a0b] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/40">
              Under the hood
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Institutional infrastructure.
              <br />
              <span className="text-white/40">For everyone.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/60">
              Piron never holds your money. Capital flows through an auditable
              stack of smart contracts, legal entities, and licensed
              professionals, giving you the same protections hedge funds pay
              millions to access.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Ring-fenced capital",
                  desc: "Funds legally separated from Piron Finance",
                },
                {
                  title: "Non-custodial",
                  desc: "Your keys, your capital, always",
                },
                {
                  title: "On-chain auditable",
                  desc: "Every transaction verifiable, forever",
                },
                {
                  title: "KYC / AML ready",
                  desc: "Compliance built in from day one",
                },
              ].map((item) => (
                <div key={item.title}>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                  </div>
                  <p className="pl-3.5 text-xs leading-relaxed text-white/40">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stack diagram */}
          <div className="space-y-2">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.step}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: i * 0.09 }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
              >
                <div className="flex items-start gap-4">
                  <span className="text-lg font-bold text-white/15">
                    {layer.step}
                  </span>
                  <div>
                    <p className="font-semibold text-white">
                      {layer.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                      {layer.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "Is Piron a bank?",
    a: "No. Piron is a protocol that connects depositors to regulated fixed-income pools. We do not take deposits in the banking sense, do not lend on our own balance sheet, and are not covered by deposit insurance. Your capital is deployed into real instruments through licensed fund managers and held in ring-fenced legal entities.",
  },
  {
    q: "Who has custody of my funds?",
    a: "At no point does Piron hold your money. Stablecoins move directly from your wallet into an audited smart contract. From there, capital is allocated to segregated escrow accounts managed by qualified custodians. You retain full control until you sign a deposit transaction, and you can verify the location of funds on-chain at any time.",
  },
  {
    q: "How is my capital protected if something goes wrong?",
    a: "Every pool is backed by a dedicated, ring-fenced legal entity that is completely separate from Piron Finance. This means pool assets cannot be used to settle Piron's obligations. If the protocol were to cease operations, the legal entity continues to hold and administer the underlying assets on behalf of depositors until maturity or orderly wind-down.",
  },
  {
    q: "Where does the yield come from?",
    a: "Yield is generated from real-world fixed-income instruments: government Treasury Bills, money market funds, trade receivables, and short-duration corporate credit. Licensed fund managers source and underwrite every position. Returns accrue daily to your pool token balance as the underlying instruments pay interest or mature.",
  },
  {
    q: "What are the risks?",
    a: "Fixed-income instruments are lower risk but not risk-free. Key risks include credit default (a borrower fails to pay), interest rate movements, and liquidity constraints during stressed markets. Piron mitigates these through diversification, short duration bias, and institutional-grade underwriting. However, returns are never guaranteed. Read our risk disclosure before depositing.",
  },
  {
    q: "How do withdrawals work?",
    a: "For Stable Yield pools, you can withdraw freely after a 7-day holding period. Locked Term pools pay out at maturity, with an optional early exit at a transparent, pre-disclosed penalty. Single Asset pools follow the payment schedule of the underlying deal. All withdrawal requests and settlements are processed and recorded on-chain.",
  },
  {
    q: "What does NAV mean and how is it calculated?",
    a: "NAV stands for Net Asset Value. It represents the total value of a pool's holdings divided by the number of pool tokens outstanding. As the underlying instruments earn interest, NAV increases. Your pool tokens are always redeemable at the current NAV, so you can see exactly what your position is worth at any time.",
  },
  {
    q: "What fees does Piron charge?",
    a: "Piron charges a management fee that is already factored into the net yield shown on each pool page. The rate you see is the rate you earn. There are no hidden charges, entry fees, or surprise deductions. A full fee breakdown is available on every pool page before you deposit.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section data-header-theme="light" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-content-tertiary">
              Questions
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-snug tracking-tight text-content-primary">
              The ones everyone
              <br />
              <span className="text-content-tertiary">asks first.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-content-tertiary">
              Still have questions?{" "}
              <a
                href={DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className="text-content-secondary underline underline-offset-4 transition-colors hover:text-content-primary"
              >
                Read the docs
              </a>
            </p>
          </motion.div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="overflow-hidden rounded-xl border border-border"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between bg-surface-warm px-5 py-4 text-left transition-colors hover:bg-surface-warm"
                >
                  <span className="pr-6 text-sm font-medium text-content-primary">
                    {faq.q}
                  </span>
                  <span
                    className="shrink-0 text-lg font-light text-content-tertiary transition-transform duration-200"
                    style={{
                      transform:
                        open === i ? "rotate(45deg)" : "rotate(0deg)",
                      display: "inline-block",
                    }}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-content-secondary">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section data-header-theme="dark" className="bg-[#0a0a0b] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-16 text-center md:p-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,196,140,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,196,140,0.04),transparent_60%)]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/40">
              Ready to start?
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Your idle capital deserves better.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/60">
              No bank. No broker. No middleman. Just your wallet, a pool, and
              real yield, verifiable on-chain.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={APP_URL}
                className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-accent-text transition-colors hover:bg-accent-hover"
              >
                Launch the app
              </Link>
              <Link
                href={DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-white/50 transition-colors hover:text-white"
              >
                Read the docs &#8594;
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen w-full">
      <Header transparent />
      <div className="relative overflow-x-hidden">
        <Hero />
        <CapitalFlow />
        <StepByStep />
        <PoolTypesSection />
        <Infrastructure />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
