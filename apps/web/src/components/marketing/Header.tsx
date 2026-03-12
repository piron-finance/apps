"use client";

import Image from "next/image";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

const navItems = [
  { name: "Overview", href: "#" },
  { name: "Pools", href: APP_URL },
  { name: "How it works", href: "/how-it-works" },
  { name: "Institutions", href: "#" },
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-b from-black/20 to-transparent border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/pironLogo.png" alt="PIRON" width={38} height={38} />
          <span className="text-sm font-medium tracking-wide text-white">
            Piron Finance
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <span className="text-xs text-white/40">Real yield, real simple</span>
          <Link
            href={APP_URL}
            className="rounded-full bg-[#00C48C] px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-[#00D99A]"
          >
            Launch app
          </Link>
        </div>

        <Link
          href={APP_URL}
          className="rounded-full bg-[#00C48C] px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-[#00D99A] md:hidden"
        >
          Launch app
        </Link>
      </div>
    </header>
  );
};

export default Header;
