"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { APP_URL, DOCS_URL } from "@/components/marketing/links";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const navItems = [
  { name: "Overview", href: "/" },
  { name: "How it works", href: "/how-it-works" },
  { name: "Blog", href: "/blog" },
  { name: "Docs", href: DOCS_URL },
];

const Header = ({ transparent = false }: { transparent?: boolean }) => {
  const [scrolled, setScrolled] = useState(!transparent);
  const [overDark, setOverDark] = useState(transparent);

  const checkSection = useCallback(() => {
    const sections = document.querySelectorAll("[data-header-theme]");
    const headerBottom = 64;

    const arr = Array.from(sections);
    for (let i = arr.length - 1; i >= 0; i--) {
      const rect = arr[i].getBoundingClientRect();
      if (rect.top <= headerBottom) {
        setOverDark(arr[i].getAttribute("data-header-theme") === "dark");
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      checkSection();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    checkSection();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent, checkSection]);

  const isDark = overDark;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? isDark
            ? "border-b border-white/[0.06] bg-[#0a0a0b]/90 backdrop-blur-xl"
            : "border-b border-border bg-surface-primary/90 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/pironLogo.png" alt="PIRON" width={38} height={38} />
          <span
            className={`text-sm font-medium tracking-wide transition-colors duration-300 ${
              isDark ? "text-white" : "text-content-primary"
            }`}
          >
            Piron Finance
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm transition-colors duration-300 ${
                isDark
                  ? "text-white/60 hover:text-white"
                  : "text-content-secondary hover:text-content-primary"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center md:flex">
          <Link
            href={APP_URL}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
              isDark
                ? "bg-white text-black hover:bg-white/90"
                : "bg-accent text-accent-text hover:bg-accent-hover"
            }`}
          >
            Launch app
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300 ${
                  isDark
                    ? "border-white/20 text-white/60"
                    : "border-border text-content-secondary"
                }`}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-border bg-surface-primary"
            >
              <SheetHeader>
                <SheetTitle className="text-content-primary">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.name}>
                    <Link
                      href={item.href}
                      className="rounded-lg px-3 py-2.5 text-sm text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary"
                    >
                      {item.name}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto px-4 pb-6">
                <SheetClose asChild>
                  <Link
                    href={APP_URL}
                    className="flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-text transition-colors hover:bg-accent-hover"
                  >
                    Launch app
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
