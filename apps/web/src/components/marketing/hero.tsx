"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { APP_URL, DOCS_URL } from "@/components/marketing/links";

export function Hero() {
  return (
    <section data-header-theme="dark" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0b]">
      {/* Background image */}
      <Image
        src="/hero-bg-crater.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center opacity-70"
        sizes="100vw"
      />

      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/40 via-transparent to-[#0a0a0b]/80" />

      {/* Grid texture on top */}
      <div className="hero-grid absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[13px] font-medium uppercase tracking-[0.25em] text-white/40"
        >
          Tokenized Fixed Income Protocol
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          Where capital meets
          <br />
          real-world yield.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/60"
        >
          Deposit stablecoins into regulated, asset-backed pools. Earn yield from
          Treasury Bills, trade finance, and commercial paper with full
          transparency and no minimums.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link
            href={APP_URL}
            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Launch App
          </Link>
          <Link
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40"
          >
            Documentation
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0b] to-transparent" />
    </section>
  );
}
