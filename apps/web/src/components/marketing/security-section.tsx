"use client";

import { motion } from "framer-motion";

const securityFeatures = [
  {
    title: "Role-aware access",
    description:
      "Dedicated views for users, SPV operators and admins — each with scoped permissions.",
  },
  {
    title: "Emergency playbook",
    description:
      "Guardian controls, pause switches and safe unwinds wired in from day one.",
  },
  {
    title: "Global by default",
    description:
      "Lagos, Nairobi, London, New York. Local currencies, jurisdiction filters, real-time FX.",
  },
  {
    title: "Auditable forever",
    description:
      "Every deposit, allocation and coupon payment leaves a clear on-chain trail.",
  },
];

export function SecuritySection() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs sm:text-sm text-gray-500 tracking-widest uppercase mb-4"
            >
              Security & Alignment
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              Rails that compliance teams don&apos;t side-eye.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-gray-400 text-base sm:text-lg"
            >
              SPVs per pool, role-based controls, timelocks and full audit
              trails mean institutions and retail can share the same rails.
            </motion.p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <h3 className="text-white font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#0a0f0d] border border-[#1a2a24] rounded-2xl p-6 sm:p-8"
          >
            <span className="text-xs text-gray-500 tracking-widest uppercase">
              System Snapshot
            </span>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mt-2 mb-2">
              From wallet to world.
            </h3>
            <p className="text-gray-400 text-sm mb-8">
              Visualize how capital moves: wallets → pools → SPVs → instruments
              → back to you.
            </p>

            <SystemFlowDiagram />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SystemFlowDiagram() {
  const nodes = [
    { label: "Wallets", x: 60, y: 40 },
    { label: "Pools", x: 200, y: 40 },
    { label: "SPVs", x: 340, y: 40 },
    { label: "", x: 60, y: 140 },
    { label: "", x: 200, y: 140 },
    { label: "", x: 340, y: 140 },
  ];

  return (
    <div className="relative">
      <svg viewBox="0 0 400 200" className="w-full h-auto">
        <g stroke="#1a2a24" strokeWidth="1">
          <line x1="100" y1="50" x2="160" y2="50" />
          <line x1="240" y1="50" x2="300" y2="50" />
        </g>

        {[60, 200, 340].map((x, i) => (
          <g key={i}>
            <rect
              x={x - 40}
              y={20}
              width="80"
              height="60"
              rx="8"
              fill="transparent"
              stroke="#1a2a24"
              strokeWidth="1"
            />
            <circle cx={x - 20} cy={35} r="4" fill="#00c48c" />
            <rect
              x={x - 40}
              y={100}
              width="80"
              height="60"
              rx="8"
              fill="transparent"
              stroke="#1a2a24"
              strokeWidth="1"
            />
            <line
              x1={x}
              y1="80"
              x2={x}
              y2="100"
              stroke="#1a2a24"
              strokeWidth="1"
            />
          </g>
        ))}

        <text x="60" y="175" fontSize="11" fill="#666" textAnchor="middle">
          Wallets
        </text>
        <text x="200" y="175" fontSize="11" fill="#666" textAnchor="middle">
          Pools
        </text>
        <text x="340" y="175" fontSize="11" fill="#666" textAnchor="middle">
          Instruments
        </text>
      </svg>
    </div>
  );
}
