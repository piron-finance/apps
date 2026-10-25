"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { APP_URL, DOCS_URL } from "@/components/marketing/links";

export function CTASection() {
  return (
    <section
      data-header-theme="dark"
      className="relative overflow-hidden bg-[#070908] py-28 text-white sm:py-36"
    >
      <Image
        src="/hero-bg-crater.jpg"
        alt=""
        fill
        className="object-cover object-bottom opacity-35"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,7,0.92),rgba(6,8,7,0.55)_52%,rgba(6,8,7,0.84))]" />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/42">
            Piron Finance
          </p>
          <h2 className="mt-6 text-[clamp(3.2rem,7vw,7rem)] font-semibold leading-[0.91] tracking-[-0.07em] text-[#f7f7f2]">
            See what your money can do.
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-[16px] leading-7 text-white/52">
            Explore Piron&apos;s live testnet, compare product terms and see how
            the full investment experience fits together.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={APP_URL}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#111315] transition-colors hover:bg-white/88 sm:w-auto"
            >
              Explore markets
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-white/56 transition-colors hover:text-white"
            >
              Read the docs ↗
            </Link>
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.12em] text-white/28">
            Testnet experience · simulated data
          </p>
        </motion.div>
      </div>
    </section>
  );
}
