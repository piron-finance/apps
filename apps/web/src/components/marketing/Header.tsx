"use client";
import React from "react";
import { useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#031b1f]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00c48c]" />
            <span className="text-white font-semibold text-lg">PIRON</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-gray-500 text-sm hidden lg:inline">
              Fixed income, minus the spreadsheets
            </span>
            <Link
              href={APP_URL}
              className="bg-[#00c48c] hover:bg-[#00d49a] text-black px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              Launch app
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-white/5">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-gray-400 hover:text-white transition-colors text-sm py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href={APP_URL}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full bg-[#00c48c] hover:bg-[#00d49a] text-black px-4 py-2.5 rounded-lg font-semibold text-sm text-center transition-colors mt-4"
            >
              Launch app
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
