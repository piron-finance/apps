"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navItems = [
  { name: "Pools", href: "/" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Docs", href: "/docs" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  // const { user } = useUser();
  // const { address } = useAccount();

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-50 bg-black border-b border-white/20">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 flex-1 min-w-0">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center">
                <Image
                  src="/pironLogo.png"
                  alt="Piron"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
              <span className="text-base sm:text-lg font-bold text-white hidden sm:inline">
                Piron Finance
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-[#1a3a2e] text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/5 hidden sm:flex"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              onClick={() => open()}
              className="bg-[#00c48c] hover:bg-[#00d49a] text-black font-semibold px-3 sm:px-4 lg:px-6 text-xs sm:text-sm"
            >
              {isConnected && address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Connect Wallet"}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-white/20 px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#1a3a2e] text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
