"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");

export function CTASection() {
  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-8 py-16 text-center md:px-16 md:py-20"
        >
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Start growing your wealth.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-white/50">
            Join thousands of investors earning superior fixed income rates.
          </p>
          <div className="mt-8">
            <Link
              href={APP_URL}
              className="inline-flex rounded-full border border-white/20 bg-white px-8 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              Launch App
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
