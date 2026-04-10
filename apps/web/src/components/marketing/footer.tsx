"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";
import { SOCIAL_LINKS } from "@/components/marketing/links";

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socialIcons = {
  x: XIcon,
  linkedin: Linkedin,
};

const footerLinks = {
  product: [
    { label: "How it works", href: "/how-it-works" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Risk disclosure", href: "/risk-disclosure" },
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
            {SOCIAL_LINKS.length > 0 ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {SOCIAL_LINKS.map((link) => {
                  const Icon = socialIcons[link.icon];
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      className="text-white/55 transition-colors hover:text-white"
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  );
                })}
              </div>
            ) : null}
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
            © {new Date().getFullYear()} Piron Finance. Not a bank. Returns are not guaranteed and may
            involve risk of loss.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
