"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { APP_URL, DOCS_URL } from "@/components/marketing/links";

export function CTASection() {
  return (
    <section
      data-header-theme="dark"
      className="relative overflow-hidden bg-[#0e1712] py-24 sm:py-32"
    >
      <div className="marketing-dark-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-[#195c42]/30 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-[1320px] px-5 sm:px-8">
        <div className="grid items-end gap-10 border-y border-white/10 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#789789]">
              Piron Finance
            </p>
            <h2 className="mt-5 max-w-3xl text-[clamp(3rem,6.7vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#f4f2eb]">
              Start small.
              <br />Know what you own.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="lg:pb-2"
          >
            <p className="max-w-md text-[16px] leading-7 text-white/54">
              Explore flexible yield, fixed-rate products and fully disclosed
              term deals in the live Piron testnet.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={APP_URL}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#f4f2eb] px-6 text-sm font-semibold text-[#132019] transition-colors hover:bg-white"
              >
                Explore the testnet
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 px-6 text-sm font-semibold text-white/72 transition-colors hover:border-white/30 hover:text-white"
              >
                Read the docs
              </Link>
            </div>
          </motion.div>
        </div>

        <p className="mt-6 max-w-2xl text-[10px] leading-5 text-white/30">
          Piron is currently in testnet. Products involve risk, returns are not
          guaranteed, and testnet balances do not represent customer assets or
          live capital.
        </p>
      </div>
    </section>
  );
}
