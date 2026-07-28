"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Wallet } from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChainSwitcher } from "@/components/dashboard/chain-switcher";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Pools", href: "/" },
  { name: "Portfolio", href: "/portfolio" },
];

export const DOCS_URL = "https://piron.gitbook.io/piron/";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "";
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="focus-ring flex shrink-0 items-center gap-2 rounded-lg"
        >
          <Image
            src="/pironMark.png"
            alt=""
            width={26}
            height={26}
            priority
            className="dark:brightness-[1.9] dark:saturate-[1.1]"
          />
          <span className="font-display text-[19px] leading-none tracking-tight text-foreground">
            Piron
            <span className="text-brand-ink">.</span>
          </span>
        </Link>

        {/* Primary nav — segmented, desktop */}
        <nav className="ml-2 hidden items-center gap-0.5 rounded-full border border-border bg-surface-sunken p-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-surface text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="focus-ring hidden rounded-lg px-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground lg:inline"
          >
            Docs
          </Link>

          <ChainSwitcher />
          <ThemeToggle className="hidden sm:inline-flex" />

          <button
            type="button"
            onClick={() => open()}
            className={cn(
              "focus-ring inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[12px] font-semibold transition-colors sm:px-4 sm:text-[13px]",
              isConnected
                ? "border border-border bg-surface text-foreground shadow-card hover:border-border-strong hover:bg-surface-raised"
                : "bg-brand text-brand-foreground shadow-card hover:bg-brand-strong",
            )}
          >
            {isConnected && address ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                <span className="font-mono text-[12px] tracking-tight">
                  {address.slice(0, 6)}…{address.slice(-4)}
                </span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" strokeWidth={2} />
                Connect
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary nav — mobile */}
      <nav className="flex items-center gap-1 border-t border-border-subtle px-4 py-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                active
                  ? "bg-brand-soft text-brand-ink"
                  : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          );
        })}
        <ThemeToggle className="ml-auto sm:hidden" />
      </nav>
    </header>
  );
}
