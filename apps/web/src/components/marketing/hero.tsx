"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { APP_URL, DOCS_URL } from "@/components/marketing/links";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-6 pt-16 pb-24 md:pt-22 md:pb-40">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] text-white/50"
          >
            <Image src="/heroIcon.svg" alt="TOKENIZED" width={28} height={28} />
            TOKENIZED FIXED INCOME FOR HUMANS, NOT HEDGE FUNDS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-8 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl"
          >
            Global yield for people who hate
            <br />
            fine print.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-md text-base leading-relaxed text-white/50"
          >
            Access institutional-grade fixed income through simple on-chain
            pools. No minimums, no paperwork, no middlemen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex items-center gap-6"
          >
            <Link
              href={APP_URL}
              className="rounded-full bg-[#00C48C] px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-[#00D99A]"
            >
              Start earning
            </Link>
            <Link
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Browse docs
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
