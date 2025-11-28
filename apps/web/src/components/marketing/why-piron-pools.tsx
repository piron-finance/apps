"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function WhyPironPools() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="bg-black text-white py-12 sm:py-16 lg:py-20 mt-8 sm:mt-12 lg:mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 lg:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight px-4">
            Automates your onchain yield opportunities
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
            No complex jargon, flexible liquidity, and transparent fees,
            delivered through professionally managed SPVs. Less fuss, more
            yield.
          </p>

          <div className="mt-6 sm:mt-8">
            <button
              className="bg-[#00c48c] text-black rounded-full px-5 sm:px-6 py-2.5 sm:py-3 font-medium shadow-sm text-sm sm:text-base"
              aria-label="See how it works"
            >
              See how it works
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-8 sm:gap-y-10 lg:gap-y-12">
            <div className="relative pl-6 sm:pl-8 pr-4 sm:pr-6">
              <div
                aria-hidden
                className="absolute left-2 top-8 bottom-0 w-px"
                style={{ background: "rgba(255,255,255,0.2)" }}
              />

              <div className="absolute left-[-6px] top-4 flex items-center">
                <div className="text-white border border-white rounded-full px-2 ">
                  1
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">
                  Borderless Access
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-prose">
                  Invest globally with local stablecoin rails and real-time FX
                  conversion — onchain, compliant, and programmatically managed.
                </p>

                <div className="mt-6 sm:mt-8 opacity-70">
                  <Image
                    src="/icons/vault-icon.svg"
                    alt="Vault security"
                    width={260}
                    height={120}
                    className="w-full max-w-[200px] sm:max-w-[260px] h-auto"
                  />
                </div>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 pr-4 sm:pr-6">
              <div
                aria-hidden
                className="absolute left-2 top-8 bottom-0 w-px"
                style={{ background: "rgba(255,255,255,0.25)" }}
              />

              <div className="absolute left-[-6px] top-4 flex items-center">
                <div className="text-white border border-white rounded-full px-2 text-sm">
                  2
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">
                  Flexible Liquidity
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-prose">
                  Deposit anytime, withdraw via transparent queues, and move
                  between stablecoin rails with minimal friction.
                </p>

                <div className="mt-6 sm:mt-8 opacity-70">
                  <Image
                    src="/icons/liquidity-pool-icon.svg"
                    alt="Liquidity pool"
                    width={260}
                    height={120}
                    className="w-full max-w-[200px] sm:max-w-[260px] h-auto"
                  />
                </div>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 pr-4 sm:pr-6">
              <div
                aria-hidden
                className="absolute left-2 top-8 bottom-0 w-px"
                style={{ background: "rgba(255,255,255,0.25)" }}
              />

              <div className="absolute left-[-6px] top-4 flex items-center">
                <div className="text-white border border-white rounded-full px-2 text-sm">
                  3
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">
                  Transparent Fees
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-prose">
                  Onchain audit trails and clear fee mechanics ensure
                  predictable yield and no hidden costs.
                </p>

                <div className="mt-6 sm:mt-8 opacity-70">
                  <Image
                    src="/icons/analytics-chart-icon.svg"
                    alt="Analytics chart"
                    width={260}
                    height={120}
                    className="w-full max-w-[200px] sm:max-w-[260px] h-auto"
                  />
                </div>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 pr-4 sm:pr-6 md:col-start-1 md:row-start-2">
              <div
                aria-hidden
                className="absolute left-2 top-8 bottom-0 w-px"
                style={{ background: "rgba(255,255,255,0.25)" }}
              />

              <div className="absolute left-[-6px] top-4 flex items-center">
                <div className="text-white border border-white rounded-full px-2 text-sm">
                  4
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">
                  Institutional-Grade
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-prose">
                  Smart custody, SPV disclosures, and risk controls built for
                  professional allocators.
                </p>

                <div className="mt-6 sm:mt-8 opacity-70">
                  <Image
                    src="/icons/shield-icon.svg"
                    alt="Security shield"
                    width={220}
                    height={120}
                    className="w-full max-w-[200px] sm:max-w-[260px] h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8" />
        </div>
      </div>
    </motion.section>
  );
}
