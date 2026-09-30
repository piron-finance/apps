"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { APP_URL } from "@/components/marketing/links";

const products = [
  {
    number: "01",
    label: "Flexible yield",
    prompt: "Keep your options open.",
    description:
      "For money you may need. Earn from a diversified pool of short-duration instruments, with a clear withdrawal route after the minimum hold.",
    features: ["NAV-priced", "Short-duration portfolio", "Flexible withdrawals"],
    accent: "bg-[#167454]",
    chip: "bg-[#e9f3ed] text-[#176044]",
  },
  {
    number: "02",
    label: "Fixed yield",
    prompt: "Know your rate from day one.",
    description:
      "For money you can set aside. Choose a defined term and rate, decide when interest is paid, and see any early-exit cost before you deposit.",
    features: ["Rate set at deposit", "Defined maturity", "Transparent early exit"],
    accent: "bg-[#426a9f]",
    chip: "bg-[#edf2f8] text-[#355b8e]",
  },
  {
    number: "03",
    label: "Term deals",
    prompt: "Choose the opportunity yourself.",
    description:
      "For investments you want to judge one by one. Review the asset, issuer, target return, repayment schedule and documents before committing.",
    features: ["One disclosed opportunity", "Defined use of funds", "Scheduled cash flows"],
    accent: "bg-[#b76b18]",
    chip: "bg-[#f8efe3] text-[#955512]",
  },
] as const;

export function PoolsSection() {
  return (
    <section
      id="products"
      data-header-theme="light"
      className="border-y border-[#e6e2da] bg-[#fffefa] py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <p className="marketing-eyebrow">Three ways to invest</p>
            <h2 className="marketing-heading mt-5 max-w-lg">
              Different money has different jobs.
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="max-w-2xl self-end text-[17px] leading-7 text-[#646b66]"
          >
            Piron is not a single black-box vault. Pick the structure that fits
            what you need from the money: access, certainty, or a specific
            opportunity you understand.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 border-y border-[#dedbd3] lg:grid-cols-3">
          {products.map((product, index) => (
            <motion.article
              key={product.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`relative flex min-h-[500px] flex-col py-8 lg:px-8 lg:py-10 ${
                index > 0
                  ? "border-t border-[#dedbd3] lg:border-l lg:border-t-0"
                  : ""
              } ${index === 0 ? "lg:pr-8" : ""}`}
            >
              <span className={`absolute left-0 top-0 h-[3px] w-14 ${product.accent} lg:left-8`} />

              <div className="flex items-center justify-between">
                <span className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold ${product.chip}`}>
                  {product.label}
                </span>
                <span className="font-mono text-[11px] text-[#a0a49f]">
                  {product.number}
                </span>
              </div>

              <h3 className="mt-12 max-w-sm text-[30px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#1c241f]">
                {product.prompt}
              </h3>
              <p className="mt-5 max-w-sm text-[14px] leading-6 text-[#676e69]">
                {product.description}
              </p>

              <ul className="mt-10 space-y-3 border-t border-[#e7e4de] pt-6">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-[13px] text-[#424b45]"
                  >
                    <Check className="h-3.5 w-3.5 text-[#39705a]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={APP_URL}
                className="group mt-auto inline-flex items-center gap-2 pt-10 text-[13px] font-semibold text-[#1f4e3b]"
              >
                See live products
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.article>
          ))}
        </div>

        <p className="mt-5 text-[11px] leading-5 text-[#888e89]">
          Product availability, terms and withdrawal mechanics vary by pool.
          Returns are not guaranteed and capital is at risk.
        </p>
      </div>
    </section>
  );
}
