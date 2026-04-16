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
      data-header-theme="light"
      className="relative overflow-hidden bg-surface-warm pb-24 pt-28 md:pb-32"
    >
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[13px] font-medium uppercase tracking-[0.2em] text-content-tertiary"
        >
          How Piron works
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-content-primary md:text-6xl lg:text-7xl"
        >
          Your money. Real assets.
          <br />
          <span className="text-content-tertiary">Transparent yield.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-content-secondary"
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
            className="text-sm font-medium text-content-secondary transition-colors hover:text-content-primary"
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

        {/* Desktop / Tablet: horizontal steps with arrows */}
        <div className="hidden md:block">
          <div className="grid grid-cols-5 gap-4">
            {flowNodes.map((node, i) => (
              <motion.div
                key={node.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                {/* Arrow connector */}
                {i < flowNodes.length - 1 && (
                  <div className="absolute right-0 top-6 z-10 translate-x-1/2">
                    <svg
                      width="24"
                      height="12"
                      viewBox="0 0 24 12"
                      fill="none"
                    >
                      <line
                        x1="0"
                        y1="6"
                        x2="18"
                        y2="6"
                        stroke="#d1d5db"
                        strokeWidth="1.5"
                      />
                      <polygon points="18,2 24,6 18,10" fill="#d1d5db" />
                    </svg>
                  </div>
                )}

                <div className="rounded-xl border border-gray-100 bg-surface-warm p-5 transition-shadow hover:shadow-md">
                  <span className="text-2xl font-bold tracking-tight text-content-primary/20">
                    {node.step}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-content-primary">
                    {node.label}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-content-secondary">
                    {node.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Return flow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 flex items-center gap-3 rounded-lg border border-accent/15 bg-accent/[0.04] px-5 py-3"
          >
            <svg
              viewBox="0 0 120 12"
              fill="none"
              className="h-3 flex-1 rotate-180"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="6"
                x2="114"
                y2="6"
                stroke="rgba(0,196,140,0.35)"
                strokeWidth="1.5"
              />
              <polygon points="114,2 120,6 114,10" fill="rgba(0,196,140,0.5)" />
            </svg>
            <span className="shrink-0 text-xs font-medium text-accent">
              Yield flows back to depositors on-chain
            </span>
            <svg
              viewBox="0 0 120 12"
              fill="none"
              className="h-3 flex-1 rotate-180"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="6"
                x2="114"
                y2="6"
                stroke="rgba(0,196,140,0.35)"
                strokeWidth="1.5"
              />
              <polygon points="114,2 120,6 114,10" fill="rgba(0,196,140,0.5)" />
            </svg>
          </motion.div>
        </div>

        {/* Mobile: vertical cards with down arrows */}
        <div className="space-y-0 md:hidden">
          {flowNodes.map((node, i) => (
            <motion.div
              key={node.step}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <div className="rounded-xl border border-gray-100 bg-surface-warm p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl font-bold tracking-tight text-content-primary/20">
                    {node.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-content-primary">
                      {node.label}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-content-secondary">
                      {node.sub}
                    </p>
                  </div>
                </div>
              </div>
              {i < flowNodes.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                    <line
                      x1="6"
                      y1="0"
                      x2="6"
                      y2="15"
                      stroke="#d1d5db"
                      strokeWidth="1.5"
                    />
                    <polygon points="2,15 6,20 10,15" fill="#d1d5db" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-4 flex items-center gap-3 rounded-lg border border-accent/15 bg-accent/[0.04] px-4 py-3"
          >
            <svg
              width="12"
              height="20"
              viewBox="0 0 12 20"
              fill="none"
              className="shrink-0 rotate-180"
            >
              <line
                x1="6"
                y1="0"
                x2="6"
                y2="15"
                stroke="rgba(0,196,140,0.4)"
                strokeWidth="1.5"
              />
              <polygon points="2,15 6,20 10,15" fill="rgba(0,196,140,0.5)" />
            </svg>
            <span className="text-xs font-medium text-accent">
              Yield flows back to depositors on-chain
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
    <section data-header-theme="light" className="bg-surface-warm py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-16 max-w-2xl"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-content-tertiary">
            Step by step
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-content-primary md:text-5xl">
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
              className="group rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:p-8"
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[80px_1fr]">
                <span className="text-5xl font-bold leading-none tracking-tighter text-content-primary/15 transition-colors group-hover:text-content-primary/25">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-content-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-content-secondary">
                    {step.description}
                  </p>
                  {step.note && (
                    <p className="mt-3 text-xs italic text-content-tertiary">
                      {step.note}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-surface-warm px-3 py-1 text-xs text-content-tertiary"
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
    <section data-header-theme="light" className="bg-surface-warm py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-content-tertiary">
              Under the hood
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-content-primary md:text-5xl">
              Institutional infrastructure.
              <br />
              <span className="text-content-tertiary">For everyone.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-content-secondary">
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
                    <p className="text-sm font-semibold text-content-primary">
                      {item.title}
                    </p>
                  </div>
                  <p className="pl-3.5 text-xs leading-relaxed text-content-tertiary">
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
                className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-start gap-4">
                  <span className="text-lg font-bold text-content-primary/15">
                    {layer.step}
                  </span>
                  <div>
                    <p className="font-semibold text-content-primary">
                      {layer.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-content-secondary">
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
    q: "Who holds my money?",
    a: "No one. Your stablecoins flow directly from your wallet into an audited smart contract. Piron Finance never takes custody of your funds at any point.",
  },
  {
    q: "What happens if Piron shuts down?",
    a: "Your funds are held in a ring-fenced legal entity that is legally separate from Piron Finance. In the event of insolvency, the entity's assets are not part of Piron's estate. Liquidation follows the documented exit process.",
  },
  {
    q: "How exactly is yield generated?",
    a: "Pool capital is deployed by licensed fund managers into real-world instruments: government T-Bills, money market funds, trade receivables, and corporate credit. Returns flow back to the pool as instruments pay interest or mature, accruing daily to your token balance.",
  },
  {
    q: "Can I lose money?",
    a: "Fixed income instruments carry low but non-zero risk. Default risk is mitigated by using short-duration, high-grade instruments and diversified structures. Piron is not a bank and returns are not guaranteed. Read the risk disclosure before investing.",
  },
  {
    q: "What is pool NAV and why does it change?",
    a: "NAV (Net Asset Value) reflects the total value of a pool's assets divided by the total pool tokens outstanding. It increases daily as the underlying instruments accrue interest. Your pool tokens are always redeemable at current NAV.",
  },
  {
    q: "Are there fees?",
    a: "Yes. Piron charges a management fee that is already reflected in the pool's published net yield. What you see is what you earn. There are no hidden fees. Full fee breakdown is displayed on each pool page before you deposit.",
  },
  {
    q: "What wallets are supported?",
    a: "Any EVM-compatible wallet: MetaMask, WalletConnect, Ledger, Coinbase Wallet, and more. No email or password required.",
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
                className="overflow-hidden rounded-xl border border-gray-100"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between bg-surface-warm px-5 py-4 text-left transition-colors hover:bg-gray-50"
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
                      <p className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-content-secondary">
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
    <section data-header-theme="light" className="bg-surface-warm py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-content-tertiary">
            Ready to start?
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-content-primary md:text-5xl">
            Your idle capital deserves better.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-content-secondary">
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
              className="text-sm font-medium text-content-secondary transition-colors hover:text-content-primary"
            >
              Read the docs &#8594;
            </Link>
          </div>
        </motion.div>
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
