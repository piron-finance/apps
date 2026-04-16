"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { APP_URL, DOCS_URL } from "@/components/marketing/links";

export function CTASection() {
  return (
    <section data-header-theme="dark" className="relative bg-[#0a0a0b] py-32">


      <div className="relative mx-auto w-full max-w-4xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          Your idle capital deserves better.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-white/50"
        >
          Deposit stablecoins into regulated fixed-income pools. Start earning
          yield backed by real-world assets today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
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
            className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
          >
            Read the docs &#8594;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
