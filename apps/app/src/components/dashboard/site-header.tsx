"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChainSwitcher } from "@/components/dashboard/chain-switcher";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Markets", href: "/" },
  { name: "Portfolio", href: "/portfolio" },
];

export const DOCS_URL = "https://piron.gitbook.io/piron/";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Nav sits on the header's baseline and marks the current page with a rule. */
function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-ring relative flex h-full items-center px-0.5 text-[13.5px] transition-colors",
        active
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 -bottom-px h-px transition-colors",
          active ? "bg-foreground" : "bg-transparent",
        )}
      />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname() ?? "";
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[52px] max-w-[1320px] items-stretch gap-7 px-5 sm:px-8">
        <Link
          href="/"
          className="focus-ring flex shrink-0 items-center gap-2 self-center rounded"
        >
          <Image
            src="/pironMark.png"
            alt=""
            width={22}
            height={22}
            priority
            className="dark:brightness-[1.9] dark:saturate-[1.1]"
          />
          <span className="text-[15px] font-semibold tracking-title text-foreground">
            Piron
          </span>
        </Link>

        <nav className="hidden items-stretch gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              href={item.href}
              active={isActive(pathname, item.href)}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="focus-ring hidden rounded px-2 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground lg:inline-block"
          >
            Docs
          </Link>

          <ChainSwitcher />
          <ThemeToggle />

          <button
            type="button"
            onClick={() => open()}
            className={cn(
              "focus-ring ml-1 inline-flex h-8 items-center gap-2 rounded px-3 text-[12.5px] font-medium transition-colors",
              isConnected
                ? "border border-border text-foreground hover:border-border-strong hover:bg-muted"
                : "bg-foreground text-background hover:bg-foreground/88",
            )}
          >
            {isConnected && address ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                <span
                  data-numeric
                  className="font-mono text-[12px] tracking-tight"
                >
                  {address.slice(0, 6)}…{address.slice(-4)}
                </span>
              </>
            ) : (
              "Connect"
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav — same underline language, one row down. */}
      <nav className="flex h-10 items-stretch gap-6 border-t border-border-subtle px-5 md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            href={item.href}
            active={isActive(pathname, item.href)}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
