"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

const footerLinks = {
  product: [
    { label: "Pools", href: APP_URL },
    { label: "How it works", href: "/how-it-works" },
    { label: "Institutions", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  legal: [
    { label: "Risk disclosure", href: "#" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-7xl px-6"
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <h3 className="text-xl font-semibold tracking-tight text-white">
              Piron Finance
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Global fixed income made accessible. Simple on-chain pools for 
              emerging markets and serious treasuries.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-white/40">
            © 2025 Piron Finance. Not a bank. Returns are not guaranteed and may
            involve risk of loss.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
