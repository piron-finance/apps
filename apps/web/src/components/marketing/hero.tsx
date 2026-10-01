"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { APP_URL } from "@/components/marketing/links";

export function Hero() {
  return (
    <section
      data-header-theme="dark"
      className="relative flex min-h-[760px] items-center overflow-hidden bg-[#08090a] pt-20 text-white lg:min-h-[820px]"
    >
      <Image
        src="/hero-bg-crater.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center opacity-80"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,7,0.42)_0%,rgba(5,6,7,0.08)_42%,rgba(5,6,7,0.84)_100%)]" />
      <div className="hero-grid absolute inset-0 opacity-25" />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/55 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1180px] px-6 pb-20 pt-20 text-center sm:px-8 lg:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/14 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/68 backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#55db9c] shadow-[0_0_14px_rgba(85,219,156,0.8)]" />
          Live on testnet
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08 }}
          className="mx-auto mt-7 max-w-5xl text-[clamp(3.5rem,8.4vw,7.8rem)] font-semibold leading-[0.91] tracking-[-0.075em] text-white"
        >
          Your money shouldn&apos;t
          <br className="hidden sm:block" /> need a moonshot.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="mx-auto mt-7 max-w-2xl text-[16px] leading-7 text-white/62 sm:text-[18px]"
        >
          Put stablecoins to work across global short-duration treasuries,
          fixed-rate products and defined deals—all in one clear app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href={APP_URL}
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#111315] transition-colors hover:bg-white/88 sm:w-auto"
          >
            Explore markets
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#platform"
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/18 bg-white/[0.04] px-7 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-white/32 hover:bg-white/[0.08] sm:w-auto"
          >
            See the product
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto mt-14 grid max-w-2xl grid-cols-3 border-y border-white/10 text-left"
        >
          {[
            ["Flexible yield", "Keep access"],
            ["Fixed yield", "Know the rate"],
            ["Term deals", "Choose the deal"],
          ].map(([label, value], index) => (
            <div
              key={label}
              className={`px-3 py-4 sm:px-6 ${index > 0 ? "border-l border-white/10" : ""}`}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/35">
                {label}
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-white/76 sm:text-[13px]">
                {value}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.a
          href="#platform"
          aria-label="Scroll to product preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mx-auto mt-8 hidden w-fit items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 transition-colors hover:text-white/60 lg:flex"
        >
          See Piron
          <ArrowDown className="h-3.5 w-3.5" />
        </motion.a>
      </div>
    </section>
  );
}
