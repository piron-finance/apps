"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
// import { useUser } from "@clerk/nextjs";
// import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navItems = [
  { name: "Pools", href: "/" },
  { name: "Dashboard", href: "/pools" },
  { name: "Institutions", href: "/portfolio" },
  { name: "Docs", href: "/docs" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // const { user } = useUser();
  // const { address } = useAccount();

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-50 bg-black border-b border-white/10">
        <div className="flex items-center justify-between px-8 h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded flex items-center justify-center">
                <Image
                  src="/pironLogo.png"
                  alt="Piron"
                  width={100}
                  height={100}
                />
              </div>
              <span className="text-lg font-bold text-white">
                Piron Finance
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button className="bg-[#00c48c] hover:bg-[#00d49a] text-black font-semibold px-6">
              Connect Wallet
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
