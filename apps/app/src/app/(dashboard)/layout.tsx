"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navItems = [
  { name: "Pools", href: "/" },
  { name: "Portfolio", href: "/portfolio" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-3 px-3 py-3 sm:px-6 md:flex-nowrap">
          <div className="flex min-w-0 items-center gap-4 md:gap-16">
            <Link href="/" className="flex min-w-0 items-center">
              <Image src="/pironLogo.png" alt="PIRON" width={38} height={38} />
              <span className="hidden text-sm font-medium tracking-wide text-white sm:inline">
                Piron Finance
              </span>
            </Link>

            <nav className="hidden gap-8 md:flex">
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
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <Link
              href="https://piron.gitbook.io/piron/"
              target="_blank"
              className="text-[11px] text-[#666]"
            >
              Docs
            </Link>
            <Button
              onClick={() => open()}
              className="bg-[#00c853] hover:bg-[#00c853]/90 text-black font-medium px-4 h-7 text-[11px] rounded"
            >
              {isConnected && address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Connect"}
            </Button>
          </div>

          <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto md:hidden">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                    isActive
                      ? "border-[#00c853]/40 bg-[#00c853]/10 text-white"
                      : "border-white/10 text-white/55"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
