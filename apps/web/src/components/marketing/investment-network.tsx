"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  Building,
  Leaf,
  Globe,
  Droplet,
  FileText,
} from "lucide-react";

const investments = [
  {
    title: "Treasury Bills",
    description: "Gov-backed short-term yield instruments",
    icon: Banknote,
  },
  {
    title: "Corporate Bonds",
    description: "Steady income from trusted corporates",
    icon: Building,
  },
  {
    title: "Commercial Papers",
    description: "Short-term fixed-income opportunities",
    icon: FileText,
  },
  {
    title: "Green Bonds",
    description: "Invest in climate-positive projects",
    icon: Leaf,
  },
  {
    title: "Eurobonds",
    description: "Access USD-denominated global bonds",
    icon: Globe,
  },
  {
    title: "Stable Yield Pools",
    description: "Dynamic APY from Piron-managed vaults",
    icon: Droplet,
  },
];

export default function InvestmentNetwork() {
  return (
    <section className="relative bg-black text-white py-24 overflow-hidden">
      {/* Section Header */}
      <div className="max-w-5xl mx-auto text-center mb-24 px-6">
        <h2 className="text-3xl md:text-5xl font-ultra-modern tracking-tight mb-4">
          Your Gateway to Fixed-Income Yield
        </h2>
        <p className="text-gray-400 text-base md:text-lg">
          Access Globally, secure high-quality instruments from Treasury bills
          to corporate and climate bonds.
        </p>
      </div>

      {/* Nodes */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 relative">
        {investments.map((inv, i) => {
          const Icon = inv.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-10 bg-black hover:bg-[#1d3a22] rounded-2xl border border-white/10 p-6 flex flex-col items-start space-y-3 hover:border-white/20 group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.03] border border-white/10">
                <Icon
                  className="w-5 h-5 text-white/50 group-hover:text-white/70"
                  strokeWidth={1.25}
                />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base mb-1">
                  {inv.title}
                </h3>
                <p className="text-gray-400 text-sm leading-snug">
                  {inv.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
