"use client";

import Link from "next/link";
import Image from "next/image";
import { DOCS_URL } from "@/components/dashboard/site-header";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://piron.finance";

const FOOTER_LINKS = [
  { label: "Docs", href: DOCS_URL },
  { label: "Terms", href: `${SITE_URL}/terms` },
  { label: "Privacy", href: `${SITE_URL}/privacy` },
  { label: "Risk disclosure", href: `${SITE_URL}/risk-disclosure` },
];

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-border bg-surface/60">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/pironMark.png"
                alt=""
                width={24}
                height={24}
                className="dark:brightness-[1.9] dark:saturate-[1.1]"
              />
              <span className="font-display text-[17px] leading-none tracking-tight text-foreground">
                Piron<span className="text-brand-ink">.</span>
              </span>
            </Link>
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
              Access tokenized fixed-income pools with clear terms, onchain
              activity, and wallet-native portfolio tracking.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2.5">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border-subtle pt-6 text-[12px] text-subtle-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Piron Finance.</p>
          <p>
            Not a bank. Returns are not guaranteed and may involve risk of loss.
          </p>
        </div>
      </div>
    </footer>
  );
}
