"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ConnectButton } from "@/lib/connect-button";

const navigation = [
  { name: "Markets", href: "/" },
  { name: "All Pools", href: "/pools" },
  { name: "Portfolio", href: "/portfolio" },
  {
    name: "Documentation",
    href: "https://piron.gitbook.io/piron",
    target: "_blank",
  },
];

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Logo />

          <nav className="hidden lg:flex items-center space-x-12">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? "text-white hover:text-purple-300 font-medium"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <ConnectButton />

            <button
              className="lg:hidden p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="px-6 py-6 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-white/70 text-lg hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
