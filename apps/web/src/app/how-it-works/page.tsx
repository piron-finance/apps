"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/footer";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,196,140,0.18) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/50"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#00C48C]" />
          How Piron Works
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          Real yield.
          <br />
          <span className="text-white/30">Demystified.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/50"
        >
          Connect your wallet, deposit stablecoins, and earn yield from
          institutional-grade fixed income — backed by regulated SPVs,
          transparent on-chain, no paperwork.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-5"
        >
          <Link
            href={APP_URL}
            className="rounded-full bg-[#00C48C] px-7 py-3 text-sm font-medium text-black transition-colors hover:bg-[#00D99A]"
          >
            Start earning
          </Link>
          <Link
            href="https://piron.gitbook.io/piron-finance/"
            className="text-sm font-medium text-white/50 transition-colors hover:text-white"
          >
            Read the docs →
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

// ─── Capital Flow ─────────────────────────────────────────────────────────────

const flowNodes = [
  {
    id: "wallet",
    step: "01",
    label: "Your Wallet",
    sub: "Connect any EVM wallet. Approve USDC, USDT, or CNGN. Nothing moves without your signature.",
    color: "#00C48C",
  },
  {
    id: "pool",
    step: "02",
    label: "Piron Pool",
    sub: "Audited smart contract receives your deposit and issues pool tokens representing your share.",
    color: "#0ea5e9",
  },
  {
    id: "spv",
    step: "03",
    label: "Regulated SPV",
    sub: "A ring-fenced legal entity holds and deploys capital. Your funds are legally separate from Piron.",
    color: "#a855f7",
  },
  {
    id: "rwa",
    step: "04",
    label: "Real-World Assets",
    sub: "Licensed fund managers deploy into T-bills, bonds, invoices, and trade finance. Real instruments.",
    color: "#f59e0b",
  },
  {
    id: "yield",
    step: "05",
    label: "Yield to You",
    sub: "Returns stream back on-chain as instruments pay interest or mature. Claim after the hold period.",
    color: "#00C48C",
  },
];

function CapitalFlow() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
            The full picture
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            From wallet to yield.
            <br />
            <span className="text-white/30">Five steps.</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/50">
            Your capital takes a transparent, verifiable journey — from your
            wallet through on-chain contracts, regulated entities, and real
            instruments — before returning as yield.
          </p>
        </motion.div>

        {/* Desktop: horizontal flow */}
        <div className="relative hidden md:block">
          <div className="absolute top-[2.625rem] left-[7%] right-[7%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="grid grid-cols-5 gap-4">
            {flowNodes.map((node, i) => (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => setActive(active === node.id ? null : node.id)}
                className="group flex flex-col items-center text-center"
              >
                <div
                  className="relative z-10 mb-4 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border text-sm font-bold transition-all duration-300"
                  style={{
                    borderColor:
                      active === node.id
                        ? node.color
                        : "rgba(255,255,255,0.1)",
                    backgroundColor:
                      active === node.id
                        ? `${node.color}18`
                        : "rgba(255,255,255,0.02)",
                    color:
                      active === node.id
                        ? node.color
                        : "rgba(255,255,255,0.3)",
                    boxShadow:
                      active === node.id
                        ? `0 0 24px ${node.color}28`
                        : "none",
                  }}
                >
                  {node.step}
                </div>
                <p className="text-sm font-semibold text-white">{node.label}</p>
                <AnimatePresence>
                  {active === node.id && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="text-xs leading-relaxed text-white/40"
                    >
                      {node.sub}
                    </motion.p>
                  )}
                </AnimatePresence>
                {active !== node.id && (
                  <p className="mt-1 text-[11px] text-white/25 transition-colors group-hover:text-white/40">
                    tap to expand
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Mobile: vertical cards */}
        <div className="space-y-3 md:hidden">
          {flowNodes.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${node.color}18`,
                  color: node.color,
                  border: `1px solid ${node.color}40`,
                }}
              >
                {node.step}
              </div>
              <div>
                <p className="font-semibold text-white">{node.label}</p>
                <p className="mt-1 text-sm text-white/40">{node.sub}</p>
              </div>
            </motion.div>
          ))}
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
    note: "KYC may be required for certain pools or jurisdictions. You'll be prompted if needed.",
    tags: ["MetaMask", "WalletConnect", "Ledger", "Coinbase Wallet"],
  },
  {
    number: "02",
    title: "Pick your pool",
    description:
      "Browse live pools by type, yield, duration, and underlying asset class. Each pool page shows real-time NAV, current APY, maturity date, and full allocation breakdown.",
    note: "Stable Yield pools are open 24/7. Locked Term and Single Asset pools have defined deposit windows.",
    tags: ["Stable Yield", "Locked Term", "Single Asset"],
  },
  {
    number: "03",
    title: "Deposit stablecoins",
    description:
      "Approve and send USDC, USDT, or CNGN to the pool contract in a single transaction. You receive pool tokens immediately — representing your proportional share of the pool's assets.",
    note: "Funds flow directly to the audited pool contract. Piron never holds your money.",
    tags: ["USDC", "USDT", "CNGN"],
  },
  {
    number: "04",
    title: "Earn — then withdraw",
    description:
      "Yield accrues to your pool token balance daily, reflected in NAV updates. After the minimum holding period, submit a withdrawal request. For Locked Term pools, wait for maturity or early exit with a transparent penalty.",
    note: "Every deposit, accrual, and withdrawal is recorded on-chain and verifiable.",
    tags: ["Daily accrual", "7-day hold", "On-chain receipts"],
  },
];

function StepByStep() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
            Step by step
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-white">
            No jargon.
            <br />
            <span className="text-white/30">Just the process.</span>
          </h2>
        </motion.div>

        <div className="space-y-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.03] lg:grid-cols-[100px_1fr]"
            >
              <div className="flex items-start pt-1">
                <span className="text-6xl font-bold leading-none tracking-tighter text-white/[0.07] transition-colors duration-300 group-hover:text-white/[0.13]">
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
                  {step.description}
                </p>
                {step.note && (
                  <p className="mt-3 text-xs italic text-white/25">
                    {step.note}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40"
                    >
                      {tag}
                    </span>
                  ))}
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
      "Deposit any amount and earn yield from diversified short-term instruments like T-bills and money market funds. NAV updates daily. Withdraw after 7 days — no penalty, no lockup.",
    ideal: "Idle capital, corporate treasuries, retail savers",
    features: [
      { label: "Min. hold", value: "7 days" },
      { label: "Yield type", value: "Variable, daily" },
      { label: "Backing", value: "T-bills, MMFs" },
      { label: "Exit penalty", value: "None after 7d" },
    ],
    color: "#00C48C",
  },
  {
    id: "locked",
    type: "Locked Term",
    tagline: "Fix your rate.",
    headline: "Guaranteed return at maturity.",
    description:
      "Commit your capital for 3, 6, or 12 months and lock in today's rate. Choose interest upfront or at maturity. Auto-roll when the term ends. Early exit available with a transparent, pre-disclosed penalty.",
    ideal: "Planned expenses, runway extension, treasury laddering",
    features: [
      { label: "Term options", value: "3, 6, 12 mo." },
      { label: "Yield type", value: "Fixed at deposit" },
      { label: "Interest", value: "Upfront or maturity" },
      { label: "Early exit", value: "With penalty" },
    ],
    color: "#0ea5e9",
  },
  {
    id: "single",
    type: "Single Asset",
    tagline: "Pick the deal.",
    headline: "Defined maturity. Full transparency.",
    description:
      "Each pool funds a specific real-world deal — an invoice, trade finance transaction, or corporate credit. You see exactly what backs your investment: the borrower, the term, the rate, and the payment date.",
    ideal: "Sophisticated investors, higher-yield seekers, deal-focused capital",
    features: [
      { label: "Maturity", value: "Per deal" },
      { label: "Yield type", value: "Fixed, deal-set" },
      { label: "Backing", value: "Single instrument" },
      { label: "Transparency", value: "Full deal view" },
    ],
    color: "#a855f7",
  },
];

function PoolTypesSection() {
  const [active, setActive] = useState("stable");
  const pool = pools.find((p) => p.id === active)!;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
            Choose your strategy
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-white">
            Three pools.
            <br />
            <span className="text-white/30">One dashboard.</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/50">
            Whether you need instant access, fixed returns, or want to pick
            specific deals — there is a pool built for that.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Selector */}
          <div className="flex flex-row gap-3 lg:flex-col">
            {pools.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => setActive(p.id)}
                className={`flex-1 rounded-xl border p-4 text-left transition-all lg:p-5 ${
                  active === p.id
                    ? "border-white/20 bg-white/[0.05]"
                    : "border-white/10 bg-white/[0.01] hover:border-white/15"
                }`}
              >
                <div
                  className="mb-1 text-[10px] uppercase tracking-[0.15em] transition-colors"
                  style={{
                    color:
                      active === p.id ? p.color : "rgba(255,255,255,0.25)",
                  }}
                >
                  {p.type}
                </div>
                <p className="text-sm font-semibold text-white">{p.tagline}</p>
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
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:p-8"
            >
              <div
                className="mb-1 text-[10px] uppercase tracking-[0.15em]"
                style={{ color: pool.color }}
              >
                {pool.type}
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {pool.headline}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
                {pool.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {pool.features.map((f) => (
                  <div
                    key={f.label}
                    className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3"
                  >
                    <p className="text-[10px] text-white/35">{f.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                  Ideal for
                </p>
                <p className="mt-1 text-sm text-white/55">{pool.ideal}</p>
              </div>

              <div className="mt-7">
                <Link
                  href={APP_URL}
                  className="inline-flex rounded-full px-6 py-2.5 text-sm font-medium text-black transition-all hover:opacity-90"
                  style={{ backgroundColor: pool.color }}
                >
                  Explore {pool.type} pools →
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
    color: "#00C48C",
  },
  {
    step: "02",
    title: "Smart contracts",
    description:
      "Audited on-chain logic handles deposits, NAV accounting, and withdrawal queues. Open source.",
    color: "#0ea5e9",
  },
  {
    step: "03",
    title: "Regulated SPV",
    description:
      "A ring-fenced special purpose vehicle holds capital and owns the instruments. Legally separated from Piron Finance.",
    color: "#a855f7",
  },
  {
    step: "04",
    title: "Licensed fund manager",
    description:
      "Regulated professionals source, underwrite, and manage the underlying assets. Due diligence on every deal.",
    color: "#f59e0b",
  },
  {
    step: "05",
    title: "Real-world instruments",
    description:
      "T-bills, bonds, trade receivables, commercial paper. Actual yield-bearing assets with defined maturities.",
    color: "#ef4444",
  },
];

function Infrastructure() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
              Under the hood
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-white">
              Institutional
              <br />
              infrastructure.
              <br />
              <span className="text-white/30">For everyone.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/50">
              Piron never holds your money. Capital flows through an auditable
              stack of smart contracts, legal entities, and licensed
              professionals — giving you the same protections hedge funds pay
              millions to access.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-5">
              {[
                {
                  title: "SPV ring-fenced",
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
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00C48C]" />
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                  </div>
                  <p className="pl-3.5 text-xs leading-relaxed text-white/35">
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
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.035]"
              >
                <div
                  className="h-9 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                <div className="min-w-0">
                  <p
                    className="mb-0.5 text-[10px] uppercase tracking-[0.12em]"
                    style={{ color: `${layer.color}80` }}
                  >
                    Layer {layer.step}
                  </p>
                  <p className="font-semibold text-white">{layer.title}</p>
                  <p className="text-xs leading-relaxed text-white/40">
                    {layer.description}
                  </p>
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
    a: "Your funds are held in an SPV that is legally ring-fenced from Piron Finance. In the event of insolvency, the SPV's assets are not part of Piron's estate. Liquidation follows the SPV's documented exit process.",
  },
  {
    q: "How exactly is yield generated?",
    a: "Pool capital is deployed by licensed fund managers into real-world instruments: government T-bills, money market funds, trade receivables, and corporate credit. Returns flow back to the pool as instruments pay interest or mature — accruing daily to your token balance.",
  },
  {
    q: "Can I lose money?",
    a: "Fixed income instruments carry low but non-zero risk. Default risk is mitigated by using short-duration, high-grade instruments and diversified SPVs. Piron is not a bank and returns are not guaranteed. Read the risk disclosure before investing.",
  },
  {
    q: "What is pool NAV and why does it change?",
    a: "NAV (Net Asset Value) reflects the total value of a pool's assets divided by the total pool tokens outstanding. It increases daily as the underlying instruments accrue interest. Your pool tokens are always redeemable at current NAV.",
  },
  {
    q: "Are there fees?",
    a: "Yes. Piron charges a management fee that is already reflected in the pool's published net yield — what you see is what you earn. There are no hidden fees. Full fee breakdown is displayed on each pool page before you deposit.",
  },
  {
    q: "What wallets are supported?",
    a: "Any EVM-compatible wallet: MetaMask, WalletConnect, Ledger, Coinbase Wallet, and more. No email or password required — just connect and start.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_2fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
              Questions
            </p>
            <h2 className="text-4xl font-semibold leading-snug tracking-tight text-white">
              The ones
              <br />
              everyone
              <br />
              <span className="text-white/30">asks first.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/40">
              Still have questions?{" "}
              <a
                href="https://piron.gitbook.io/piron-finance/"
                className="text-white/60 underline underline-offset-4 transition-colors hover:text-white"
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
                className="overflow-hidden rounded-xl border border-white/10"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between bg-white/[0.02] px-5 py-4 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <span className="pr-6 text-sm font-medium text-white">
                    {faq.q}
                  </span>
                  <span
                    className="shrink-0 text-lg font-light text-white/30 transition-transform duration-200"
                    style={{
                      transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
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
                      <p className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-white/50">
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
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] px-8 py-20 text-center md:px-16 md:py-24"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 120%, rgba(0,196,140,0.14) 0%, transparent 60%)",
            }}
          />
          <p className="relative mb-4 text-[11px] uppercase tracking-[0.2em] text-[#00C48C]">
            Ready to start?
          </p>
          <h2 className="relative text-4xl font-bold tracking-tight text-white md:text-5xl">
            Your idle capital
            <br />
            deserves better.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-base text-white/50">
            No bank. No broker. No middleman. Just your wallet, a pool, and
            real yield — verifiable on-chain.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              href={APP_URL}
              className="rounded-full bg-[#00C48C] px-8 py-3 text-sm font-medium text-black transition-colors hover:bg-[#00D99A]"
            >
              Launch the app
            </Link>
            <Link
              href="https://piron.gitbook.io/piron-finance/"
              className="text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              Read the docs →
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
    <div
      className="relative min-h-screen w-full"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 90, 90, 0.35) 0%, transparent 50%),
          black
        `,
      }}
    >
      <Header />
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
