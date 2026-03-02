"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export function Hero() {
  return (
    <section className="relative pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00c48c]/30 bg-[#00c48c]/5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#00c48c] animate-pulse" />
            <span className="text-[#00c48c] text-sm font-medium tracking-wide">
              TOKENIZED FIXED INCOME FOR HUMANS, NOT HEDGE FUNDS
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-4xl"
          >
            Global yield for people who hate fine print.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed"
          >
            Piron turns boring bonds, bills and credit into three clean pools
            your wallet actually understands.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href={APP_URL}
              className="bg-[#00c48c] hover:bg-[#00d49a] text-black px-8 py-3.5 rounded-full font-semibold text-base transition-all"
            >
              Start earning
            </Link>
            <Link
              href={APP_URL}
              className="text-gray-300 hover:text-white px-8 py-3.5 font-medium text-base transition-colors"
            >
              Browse live pools
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">8,500+</span>
              <span>depositors</span>
            </div>
            <span className="hidden sm:inline text-gray-700">•</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">$45M+</span>
              <span>liquidity routed</span>
            </div>
            <span className="hidden sm:inline text-gray-700">•</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">15+</span>
              <span>markets from Lagos to London</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative w-full max-w-xl aspect-square"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#00c48c]/20 to-transparent blur-3xl" />
            <div className="relative w-full h-full flex items-center justify-center">
              <GlobeVisualization />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function GlobeVisualization() {
  return (
    <div className="relative w-full h-full max-w-md mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <radialGradient id="globeGradient" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#00c48c" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#00c48c" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00c48c" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="200" cy="200" r="150" fill="url(#globeGradient)" />

        <g stroke="#00c48c" strokeWidth="0.5" fill="none" opacity="0.4">
          {[0, 30, 60, 90, 120, 150].map((lat) => (
            <ellipse
              key={`lat-${lat}`}
              cx="200"
              cy="200"
              rx={150 * Math.cos((lat * Math.PI) / 180)}
              ry={150 * Math.cos((lat * Math.PI) / 180) * 0.3}
              transform={`rotate(${lat - 90} 200 200)`}
            />
          ))}
          {[0, 30, 60, 90, 120, 150].map((lon) => (
            <ellipse
              key={`lon-${lon}`}
              cx="200"
              cy="200"
              rx="150"
              ry="45"
              transform={`rotate(${lon} 200 200)`}
            />
          ))}
        </g>

        <g filter="url(#glow)">
          <circle cx="120" cy="140" r="4" fill="#00c48c">
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="280" cy="160" r="4" fill="#00c48c">
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="200" cy="100" r="4" fill="#00c48c">
            <animate
              attributeName="opacity"
              values="1;0.7;1"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="150" cy="220" r="3" fill="#00c48c">
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="260" cy="240" r="3" fill="#00c48c">
            <animate
              attributeName="opacity"
              values="1;0.6;1"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        <g stroke="#00c48c" strokeWidth="1" opacity="0.3">
          <line x1="120" y1="140" x2="200" y2="100">
            <animate
              attributeName="opacity"
              values="0.3;0.6;0.3"
              dur="3s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="200" y1="100" x2="280" y2="160">
            <animate
              attributeName="opacity"
              values="0.6;0.3;0.6"
              dur="3s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="150" y1="220" x2="260" y2="240">
            <animate
              attributeName="opacity"
              values="0.3;0.5;0.3"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </line>
        </g>
      </svg>
    </div>
  );
}
