"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { APP_URL } from "@/components/marketing/links";

const products = [
  {
    number: "01",
    type: "Flexible yield",
    headline: "Stay flexible.",
    copy: "A NAV-priced portfolio of treasuries and short-duration instruments. Capital starts working from day one, with withdrawals after the minimum hold.",
    details: [
      ["Best for", "Money you may need"],
      ["Pricing", "NAV, updated daily"],
      ["Liquidity", "After the minimum hold"],
    ],
    accent: "#37aa78",
  },
  {
    number: "02",
    type: "Fixed yield",
    headline: "Lock in the terms.",
    copy: "Choose a fixed rate and term before you deposit. Decide when interest is paid, then withdraw, roll over, or use an offered early exit.",
    details: [
      ["Best for", "Money you can set aside"],
      ["Terms", "Defined at deposit"],
      ["Rate", "Fixed at deposit"],
    ],
    accent: "#7089df",
  },
  {
    number: "03",
    type: "Term deals",
    headline: "Pick the opportunity.",
    copy: "Invest in one named asset or financing opportunity. Review the issuer, use of funds, documents and repayment schedule before you commit.",
    details: [
      ["Best for", "Selective conviction"],
      ["Exposure", "One disclosed deal"],
      ["Cash flows", "Scheduled by the asset"],
    ],
    accent: "#d99552",
  },
] as const;

export function PoolsSection() {
  return (
    <section
      id="products"
      data-header-theme="light"
      className="border-y border-black/[0.07] bg-[#fbfaf7] py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-20"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#737a75]">
              Three ways to invest
            </p>
            <h2 className="mt-5 max-w-3xl text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171b18]">
              Choose what your money needs to do.
            </h2>
          </div>
          <p className="max-w-xl text-[16px] leading-7 text-[#616862]">
            One generic vault cannot serve every goal. Piron gives each kind of
            capital a product structure that matches it.
          </p>
        </motion.div>

        <div className="mt-16 grid border-y border-black/10 lg:grid-cols-3">
          {products.map((product, index) => (
            <motion.article
              key={product.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className={`relative flex min-h-[520px] flex-col py-9 lg:px-8 lg:py-11 ${
                index > 0 ? "border-t border-black/10 lg:border-l lg:border-t-0" : ""
              }`}
            >
              <span
                className="absolute left-0 top-0 h-[3px] w-14 lg:left-8"
                style={{ backgroundColor: product.accent }}
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4f5852]">
                  {product.type}
                </p>
                <span className="font-mono text-[10px] text-black/28">
                  {product.number}
                </span>
              </div>

              <h3 className="mt-12 text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#181d1a]">
                {product.headline}
              </h3>
              <p className="mt-5 max-w-sm text-[14px] leading-6 text-[#666d68]">
                {product.copy}
              </p>

              <dl className="mt-10 divide-y divide-black/[0.07] border-y border-black/[0.07]">
                {product.details.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-5 py-3.5"
                  >
                    <dt className="text-[11px] text-black/42">{label}</dt>
                    <dd className="text-right text-[12px] font-medium text-[#323a35]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <Link
                href={APP_URL}
                className="group mt-auto inline-flex items-center gap-2 pt-10 text-[13px] font-semibold text-[#1c4d38]"
              >
                Explore this product
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.article>
          ))}
        </div>

        <p className="mt-5 text-[10px] leading-5 text-black/38">
          Product availability and terms vary. Returns are not guaranteed and
          capital is at risk.
        </p>
      </div>
    </section>
  );
}
