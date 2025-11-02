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
  return (
    <nav className="sticky top-0 mx-36 py-4 z-50 bg-black/98 backdrop-blur-sm border-b border-gray-900/50 ">
      <div className="flex justify-between">
        <Link href="/" className="flex items-center space-x-1">
          <Image
            src="/pironLogo.png"
            alt="Piron"
            width={120}
            height={100}
            className="w-10 h-10"
          />
          <span className="text-lg font-modern text-white">Piron Finance</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target="_blank"
              className="text-neutral-500 hover:text-white transition-colors text-sm font-medium"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => setShowComingSoon(true)}
            className="bg-green-400 rounded-sm text-black px-4 py-2.5 font-semibold  text-xs"
          >
            Launch App
          </button>
        </div>
      </div>

      <ComingSoonModal open={showComingSoon} onOpenChange={setShowComingSoon} />
    </nav>
  );
};

export default Header;
