"use client";

import { motion } from "framer-motion";

const securityFeatures = [
  {
    title: "Segregated SPVs",
    description:
      "Each pool is backed by its own special purpose vehicle. Your funds are legally ring-fenced.",
  },
  {
    title: "Role-based access",
    description:
      "Depositors, operators, and admins have separate permissions. Everyone sees only what they need.",
  },
  {
    title: "On-chain transparency",
    description:
      "Every deposit, allocation, and payout is recorded on-chain. Verify anything, anytime.",
  },
  {
    title: "Multi-jurisdiction ready",
    description:
      "Built for global compliance from day one. Local currency support and jurisdiction filters included.",
  },
];

export function SecuritySection() {
  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-[11px] font-normal uppercase tracking-[0.2em] text-white/40">
              Security & Compliance
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-white">
              Institutional infrastructure.
              <br />
              No institutional minimums.
            </h2>
            <p className="mt-4 max-w-md text-base font-normal leading-relaxed text-white/50">
              The same legal structures, custody solutions, and compliance frameworks 
              that hedge funds require. Available to everyone.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {securityFeatures.map((feature, idx) => (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                >
                  <h3 className="font-semibold tracking-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">
                    {feature.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-6 lg:p-8"
          >
            <p className="mb-2 text-[10px] font-normal uppercase tracking-[0.15em] text-white/40">
              How it works
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-white">
              From wallet to world.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              See how capital flows through the Piron system: from your wallet, through regulated pools, into real-world assets, and back to you.
            </p>

            <div className="mt-8">
              <SystemFlowDiagram />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SystemFlowDiagram() {
  const nodes = [
    { label: "Your Wallet", color: "#00C48C" },
    { label: "Piron Pools", color: "#0ea5e9" },
    { label: "SPV / Custody", color: "white" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex flex-1 items-center">
            <div className="flex h-14 w-full items-center justify-center rounded-lg border border-white/10 px-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-xs text-white/60">{node.label}</span>
              </div>
            </div>
            {i < nodes.length - 1 && (
              <span className="px-2 text-white/20">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 p-4">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00C48C]" />
          Deposits flow into regulated SPVs
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0ea5e9]" />
          SPVs hold real-world instruments
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Returns flow back to your wallet
        </div>
      </div>
    </div>
  );
}
