"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

const clarity = [
  {
    number: "01",
    title: "The terms",
    copy: "Rate type, minimum, duration and payment schedule—together, before deposit.",
  },
  {
    number: "02",
    title: "The assets",
    copy: "What the product holds, how capital is allocated and how value is measured.",
  },
  {
    number: "03",
    title: "The exit",
    copy: "Holding periods, maturity, withdrawal mechanics and any early-exit cost.",
  },
  {
    number: "04",
    title: "The record",
    copy: "Position value, NAV history and onchain transactions, kept in one place.",
  },
] as const;

const lifecycle = ["Subscribe", "Allocate", "Value", "Service", "Redeem"];

export function ArchitectureSection() {
  return (
    <section
      data-header-theme="dark"
      className="relative overflow-hidden bg-[#090b0a] py-24 text-white sm:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_14%,rgba(25,119,76,0.18),transparent_34%)]" />
      <div className="hero-grid absolute inset-0 opacity-[0.12]" />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-20"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6f9180]">
              Clarity, not fine print
            </p>
            <h2 className="mt-5 max-w-4xl text-[clamp(3rem,6.4vw,6.5rem)] font-semibold leading-[0.91] tracking-[-0.07em] text-[#f4f4ef]">
              Nothing important hides behind the headline rate.
            </h2>
          </div>
          <p className="max-w-xl text-[16px] leading-7 text-white/48">
            Every Piron product is built to make the trade-off visible. What
            earns the return, when you can leave, and what happens next should
            never be a guessing game.
          </p>
        </motion.div>

        <div className="mt-16 grid border-y border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {clarity.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className={`min-h-[280px] py-8 sm:px-7 lg:min-h-[310px] lg:px-8 lg:py-10 ${
                index % 2 === 1 ? "sm:border-l sm:border-white/10" : ""
              } ${index > 1 ? "border-t border-white/10 lg:border-t-0" : ""} ${
                index > 0 ? "lg:border-l lg:border-white/10" : ""
              }`}
            >
              <span className="font-mono text-[10px] text-white/26">
                {item.number}
              </span>
              <h3 className="mt-16 text-[24px] font-semibold tracking-[-0.035em] text-white/90">
                {item.title}
              </h3>
              <p className="mt-4 max-w-[250px] text-[13px] leading-6 text-white/42">
                {item.copy}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mt-24 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur"
        >
          <div className="grid lg:grid-cols-[0.75fr_1.25fr]">
            <div className="border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/32">
                The operating layer
              </p>
              <h3 className="mt-5 max-w-md text-[38px] font-semibold leading-[1] tracking-[-0.055em] text-white/90 sm:text-[48px]">
                One system. The full investment lifecycle.
              </h3>
              <p className="mt-5 max-w-md text-[13px] leading-6 text-white/40">
                Investors access products in the app. Issuers and administrators
                launch, value, service and settle them through the same operating
                layer.
              </p>
            </div>

            <div className="p-7 sm:p-10 lg:p-12">
              <div className="grid gap-2 sm:grid-cols-5 sm:items-center">
                {lifecycle.map((step, index) => (
                  <div key={step} className="relative flex items-center gap-2 sm:block">
                    <div className="flex min-h-20 flex-1 items-center rounded-lg border border-white/10 bg-black/20 px-4 sm:min-h-24">
                      <div>
                        <Check className="h-3.5 w-3.5 text-[#55ce94]" />
                        <p className="mt-3 text-[12px] font-medium text-white/72">
                          {step}
                        </p>
                      </div>
                    </div>
                    {index < lifecycle.length - 1 ? (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 rotate-90 text-white/18 sm:absolute sm:-right-[11px] sm:top-1/2 sm:z-10 sm:-translate-y-1/2 sm:rotate-0" />
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-8 text-[11px] leading-5 text-white/30">
                One programmable workflow connects subscription, allocation,
                NAV, cash flows, servicing and redemption.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
