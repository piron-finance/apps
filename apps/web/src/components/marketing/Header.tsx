"use client";
import React from "react";
import { useState } from "react";
import { ComingSoonModal } from "./coming-soon-modal";
import Image from "next/image";
import Link from "next/link";

const navItems = [
  {
    name: "How it works",
    href: "/how-it-works",
  },
  {
    name: "Blog",
    href: "https://mirror.xyz/0x6b202588c79A5cA7D49B09f0Df55dc368bEE777e",
  },
  {
    name: "Docs",
    href: "https://piron.gitbook.io/piron",
  },
];

const Header = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 mx-4 sm:mx-8 lg:mx-36 py-3 sm:py-4 z-50 bg-black/98 backdrop-blur-sm border-b border-gray-900/50">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
          <Image
            src="/pironLogo.png"
            alt="Piron"
            width={120}
            height={100}
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
          <span className="text-base sm:text-lg font-modern text-white">
            Piron Finance
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target="_blank"
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <button
            onClick={() => setShowComingSoon(true)}
            className="bg-[#00c48c] text-black px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm"
          >
            Launch App
          </button>
        </div>

        {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target="_blank"
              className="block text-gray-400 hover:text-white transition-colors text-sm font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={() => {
              setShowComingSoon(true);
              setMobileMenuOpen(false);
            }}
            className="w-full bg-[#00c48c] text-black px-4 py-2 rounded-lg font-semibold text-sm"
          >
            Launch App
          </button>
        </div>
      )}

      <ComingSoonModal open={showComingSoon} onOpenChange={setShowComingSoon} />
    </nav>
  );
};

export default Header;
