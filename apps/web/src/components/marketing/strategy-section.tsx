"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

const poolExamples = [
  {
    type: "Stable Yield",
    asset: "USDC",
    name: "Global T-Bill Basket",
    description: "Cash-like access for treasuries that still like to sleep.",
    apy: "7.4%",
    apyLabel: "Live APY",
  },
  {
    type: "Locked",
    asset: "USDT",
    name: "180-day Fixed Ladder",
    description: "Stack predictable coupons across half-year rungs.",
    apy: "9.9%",
    apyLabel: "Fixed APY",
  },
  {
    type: "Single-Asset",
    asset: "DAI",
    name: "Trade Finance Strip",
    description: "Direct slices of real invoices with defined end dates.",
    apy: "12.1%",
    apyLabel: "Target APY",
  },
];

export function StrategySection() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12 lg:mb-16">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs sm:text-sm text-gray-500 tracking-widest uppercase mb-4"
            >
              Choose your strategy
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              Dial in yield like a mix board.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-gray-400 text-base sm:text-lg"
            >
              Blend flexible, fixed and deal-specific pools into one portfolio
              that moves at your speed.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href={APP_URL}
              className="text-[#00c48c] hover:text-[#00d49a] text-sm font-medium transition-colors"
            >
              View all live pools →
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {poolExamples.map((pool, index) => (
              <motion.div
                key={pool.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-[#0a0f0d] border border-[#1a2a24] rounded-xl p-5 hover:border-[#00c48c]/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{pool.type}</span>
                      <span>·</span>
                      <span>{pool.asset}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {pool.name}
                    </h3>
                    <p className="text-sm text-gray-400">{pool.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#00c48c]">
                      {pool.apy}
                    </div>
                    <div className="text-xs text-gray-500">{pool.apyLabel}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#0a0f0d] border border-[#1a2a24] rounded-2xl p-6 sm:p-8"
          >
            <div className="mb-6">
              <span className="text-xs text-gray-500 tracking-widest uppercase">
                Portfolio Canvas
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mt-2">
                Move sliders, not spreadsheets.
              </h3>
              <p className="text-gray-400 text-sm mt-2">
                Tell Piron your liquidity needs, horizon and risk appetite. We
                map you to pools that fit — from cash-like to conviction plays.
              </p>
            </div>

            <div className="relative h-48 sm:h-64">
              <PortfolioChart />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PortfolioChart() {
  return (
    <svg viewBox="0 0 400 200" className="w-full h-full">
      <defs>
        <linearGradient
          id="chartGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#00c48c" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00c48c" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g stroke="#1a2a24" strokeWidth="1" opacity="0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="40" y1={40 + i * 35} x2="380" y2={40 + i * 35} />
        ))}
      </g>

      <path
        d="M40,160 Q100,150 140,130 T220,100 T300,70 T380,50"
        stroke="#00c48c"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
        strokeDasharray="5,5"
      />

      <path
        d="M40,155 Q100,145 140,120 T220,90 T300,60 T380,40"
        stroke="#00c48c"
        strokeWidth="2.5"
        fill="none"
      />

      <g>
        <circle cx="140" cy="120" r="6" fill="#0a0f0d" stroke="#00c48c" strokeWidth="2" />
        <circle cx="220" cy="90" r="6" fill="#0a0f0d" stroke="#00c48c" strokeWidth="2" />
        <circle cx="340" cy="50" r="6" fill="#00c48c" />
      </g>

      <g className="text-xs" fill="#666">
        <text x="40" y="185" fontSize="10">
          Low Risk
        </text>
        <text x="340" y="185" fontSize="10">
          Higher Yield
        </text>
      </g>
    </svg>
  );
}
