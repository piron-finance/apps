"use client";

import Link from "next/link";
import { ArrowRight, Check, MoveUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { APP_URL } from "@/components/marketing/links";

const products = [
  {
    type: "Flexible yield",
    title: "Keep access",
    detail: "NAV-priced",
    note: "For money you may need",
    tone: "brand",
  },
  {
    type: "Fixed yield",
    title: "Lock your rate",
    detail: "90–365 days",
    note: "For money you can set aside",
    tone: "blue",
  },
  {
    type: "Term deal",
    title: "Choose the deal",
    detail: "Defined terms",
    note: "For opportunities you want to assess",
    tone: "amber",
  },
] as const;

export function Hero() {
  return (
    <section
      data-header-theme="light"
      className="relative overflow-hidden bg-[#f8f6f1] pb-16 pt-32 sm:pb-20 sm:pt-40 lg:min-h-[860px] lg:pb-24"
    >
      <div className="marketing-grid pointer-events-none absolute inset-0 opacity-55" />
      <div className="pointer-events-none absolute -right-40 top-4 h-[520px] w-[520px] rounded-full bg-[#dfece4] blur-[120px]" />

      <div className="relative mx-auto grid w-full max-w-[1320px] items-center gap-16 px-5 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-[#d7ddd8] bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#526057] backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#117a55] shadow-[0_0_0_4px_rgba(17,122,85,0.1)]" />
            Live on testnet
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mt-8 max-w-[760px] text-[clamp(3.4rem,7.3vw,6.7rem)] font-semibold leading-[0.91] tracking-[-0.072em] text-[#18201b]"
          >
            Steady is
            <br />a strategy.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 max-w-xl text-[17px] leading-7 text-[#59615c] sm:text-[18px]"
          >
            Choose flexible yield, lock a fixed rate, or back one defined deal.
            Piron brings short-duration, real-world fixed income into one clear,
            wallet-native app.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href={APP_URL}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#0d573e] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0a4632]"
            >
              Explore markets
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#d7d8d3] bg-white/60 px-6 text-sm font-semibold text-[#253029] transition-colors hover:border-[#b9beb9] hover:bg-white"
            >
              See how it works
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[#707872]"
          >
            {["Published terms", "Live NAV", "Wallet-native portfolio"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#167454]" />
                  {item}
                </span>
              ),
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-8 -z-10 rounded-[40px] bg-white/55 blur-2xl" />
          <div className="overflow-hidden rounded-[18px] border border-[#d7d7d0] bg-[#fbfaf7] shadow-[0_28px_80px_-40px_rgba(27,43,34,0.42)]">
            <div className="flex items-center justify-between border-b border-[#e4e2dc] bg-white/70 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0d573e] text-[11px] font-bold tracking-tight text-white">
                  PF
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[#1c251f]">
                    Markets
                  </p>
                  <p className="text-[10px] text-[#7b827d]">
                    Piron Finance · Preview
                  </p>
                </div>
              </div>
              <span className="rounded-sm bg-[#e7f2eb] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#176044]">
                Testnet
              </span>
            </div>

            <div className="grid grid-cols-3 border-b border-[#e4e2dc]">
              {[
                ["Product types", "3"],
                ["Rate formats", "Variable + fixed"],
                ["Portfolio", "One view"],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`min-w-0 px-4 py-5 sm:px-5 ${
                    index > 0 ? "border-l border-[#e7e5df]" : ""
                  }`}
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.11em] text-[#929892]">
                    {label}
                  </p>
                  <p className="mt-2 truncate text-[13px] font-semibold text-[#242d27] sm:text-[15px]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 p-4 sm:p-6">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b928d]">
                    Choose how your money works
                  </p>
                  <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.025em] text-[#1b241e]">
                    One app. Three clear choices.
                  </h2>
                </div>
                <MoveUpRight className="hidden h-4 w-4 text-[#969c97] sm:block" />
              </div>

              {products.map((product) => (
                <div
                  key={product.type}
                  className="group relative overflow-hidden rounded-lg border border-[#e0dfd8] bg-white px-4 py-4 transition-colors hover:border-[#b9c9bf] sm:px-5"
                >
                  <span
                    className={`absolute left-0 top-0 h-full w-[3px] ${
                      product.tone === "brand"
                        ? "bg-[#167454]"
                        : product.tone === "blue"
                          ? "bg-[#3f68a2]"
                          : "bg-[#b46b19]"
                    }`}
                  />
                  <div className="flex items-center justify-between gap-5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#848b86]">
                        {product.type}
                      </p>
                      <p className="mt-1 text-[15px] font-semibold tracking-[-0.015em] text-[#1d261f]">
                        {product.title}
                      </p>
                      <p className="mt-1 text-[11px] text-[#777e79]">
                        {product.note}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[12px] font-semibold text-[#26312a]">
                        {product.detail}
                      </p>
                      <p className="mt-1 text-[10px] text-[#929893]">
                        Published upfront
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-[#e4e2dc] bg-[#f4f2ed] px-5 py-3.5 text-[10px] text-[#777e78] sm:px-6">
              <span>Terms · allocation · liquidity · risk</span>
              <span className="font-medium text-[#315f4b]">All in one place</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
