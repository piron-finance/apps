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
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-b from-black/20 to-transparent border-b border-white/10">
        <div className=" flex h-16 items-center justify-between  px-6">
          <div className="flex items-center gap-16">
            <Link href="/" className="flex items-center">
              <Image src="/pironLogo.png" alt="PIRON" width={38} height={38} />
              <span className="text-sm font-medium tracking-wide text-white">
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

          <div className="flex items-center gap-4">
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
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
