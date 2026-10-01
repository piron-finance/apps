"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { APP_URL } from "@/components/marketing/links";

export function ProductShowcase() {
  return (
    <section
      id="platform"
      data-header-theme="light"
      className="overflow-hidden bg-[#f4f1eb] py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#747b76]">
              The live product
            </p>
            <h2 className="mt-5 max-w-3xl text-[clamp(3rem,6vw,6.1rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171b18]">
              See the whole investment. Not just the rate.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <p className="max-w-xl text-[16px] leading-7 text-[#5e655f]">
              Compare product structure, rate, NAV, holding period and exit
              terms before you deposit. Every position stays together in your
              portfolio afterwards.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[#5c665f]">
              {["Published terms", "Onchain activity", "Portfolio tracking"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#226f50]" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.14 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="relative mt-16"
        >
          <div className="absolute -inset-16 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(37,93,68,0.15),transparent_62%)]" />
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#0d0f0e] shadow-[0_36px_100px_-46px_rgba(18,29,23,0.6)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/18" />
                <span className="h-2 w-2 rounded-full bg-white/18" />
                <span className="h-2 w-2 rounded-full bg-white/18" />
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/42">
                Piron live testnet · simulated data
              </span>
              <Link
                href={APP_URL}
                aria-label="Open the Piron app"
                className="text-white/46 transition-colors hover:text-white"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <Link href={APP_URL} className="group block bg-[#f9f8f5]">
              <Image
                src="/app-markets-preview.jpg"
                alt="Piron markets testnet showing flexible, fixed and term products"
                width={1280}
                height={720}
                className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.006]"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
