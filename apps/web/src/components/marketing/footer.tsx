"use client";

import Link from "next/link";

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
    <footer className="border-t border-white/5 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-2">
            <h3 className="text-white text-lg font-semibold mb-3">
              Piron Finance
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Piron turns global fixed income into simple on-chain pools — built
              for emerging markets and serious treasuries.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-gray-600 text-xs text-center">
            © 2025 Piron Finance. Not a bank. Returns are not guaranteed and may
            involve risk of loss.
          </p>
        </div>
      </div>
    </footer>
  );
}
