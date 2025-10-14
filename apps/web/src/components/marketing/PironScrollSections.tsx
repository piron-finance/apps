"use client";

import React, { useEffect, useRef, useState } from "react";
import { PoolsIcon } from "../icons/PoolsIcon";
import { ManagedIcon } from "../icons/ManagedIcon";
import { LendingIcon } from "../icons/LendingIcon";
import { motion, AnimatePresence } from "framer-motion";

type SectionKey = "pools" | "managed" | "lending";

const SECTIONS: { key: SectionKey; title: string; subtitle?: string }[] = [
  { key: "pools", title: "POOLS", subtitle: "LIVE NOW" },
  { key: "managed", title: "MANAGED POOLS", subtitle: "LOCKED" },
  { key: "lending", title: "LENDING", subtitle: "BORROW" },
];

/* Humanized (Option 2) middle-column copy */
const COPY: Record<SectionKey, { tagline: string; bullets: string[] }> = {
  pools: {
    tagline: "Flexible Onchain Liquidity",
    bullets: [
      "Earn yield without borders\nPiron Pools make it easy to participate in tokenized yield opportunities around the world. No gated access or manual steps — just connect your wallet and start earning.",
      "Move funds when you need to\nYour deposits stay liquid. You can add, withdraw, or re-allocate at any time, with every action tracked onchain for full transparency.",
      "See how your yield works\nEvery pool shows live performance, asset exposure, and historical returns. You always know what’s driving your earnings.",
    ],
  },
  managed: {
    tagline: "Structured Yield Products",
    bullets: [
      "Designed for consistency\nManaged Pools are curated by professional partners who deploy capital into fixed-income and credit-based strategies.",
      "Lock in and earn more\nCommit your funds for 30 or 90 days and earn higher returns than flexible pools — perfect if you prefer predictable yield.",
      "Hands-off payouts\nRewards are distributed automatically to your wallet. No claiming, no compounding — Piron handles it behind the scenes.",
    ],
  },
  lending: {
    tagline: "Borrow Against Real Yield",
    bullets: [
      "Liquidity without selling\nUse your active pool positions as collateral to borrow instantly, keeping your yield position intact.",
      "Transparent and fair\nBorrowing terms, rates, and collateral ratios are fully visible and enforced by Piron’s smart contracts.",
      "Built-in safety net\nGet real-time margin alerts and automated repayment options that protect your positions from liquidation.",
    ],
  },
};

export default function PironScrollSections() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<SectionKey, HTMLElement | null>>({
    pools: null,
    managed: null,
    lending: null,
  });
  const [active, setActive] = useState<SectionKey>("pools");
  const [isComponentVisible, setIsComponentVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const key = entry.target.getAttribute(
            "data-key"
          ) as SectionKey | null;
          if (!key) return;

          // Only change active state when section is properly centered and visible
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            setActive(key);
          }
        });
      },
      {
        threshold: [0.7, 0.8, 0.9],
        rootMargin: "-10% 0px -10% 0px", // Require section to be well within viewport
      }
    );

    // More precise visibility detection
    const componentObs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const rect = entry.boundingClientRect;
        const windowHeight = window.innerHeight;

        // Show navigation when:
        // 1. Component is intersecting AND
        // 2. The top of the component is above the middle of the screen AND
        // 3. The bottom of the component is below the middle of the screen
        const isInViewportCenter =
          rect.top < windowHeight * 0.5 && rect.bottom > windowHeight * 0.5;

        setIsComponentVisible(entry.isIntersecting && isInViewportCenter);
      },
      { threshold: [0, 0.1, 0.5, 0.9, 1] }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) obs.observe(el);
    });

    if (containerRef.current) {
      componentObs.observe(containerRef.current);
    }

    return () => {
      obs.disconnect();
      componentObs.disconnect();
    };
  }, []);

  return (
    <div className="relative bg-black text-white min-h-screen">
      {/* LEFT fixed nav - only visible when component is in view */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-20 flex flex-col items-center justify-center z-50 pointer-events-auto transition-opacity duration-300 ${
          isComponentVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.key} className="flex flex-col items-center">
              <button
                onClick={() =>
                  sectionRefs.current[s.key]?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                aria-current={active === s.key}
                className="focus:outline-none"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                <span
                  className={`text-xs tracking-widest transition-colors ${active === s.key ? "text-white" : "text-gray-500"}`}
                >
                  {s.title}
                </span>
              </button>

              <div className="mt-2 h-3 w-1">
                <div
                  className={`mx-auto w-1 h-1 rounded-sm transition-all ${active === s.key ? "bg-white scale-100" : "bg-gray-700 scale-75"}`}
                />
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN scroll area */}
      <main
        ref={containerRef}
        className="snap-y snap-mandatory h-screen overflow-y-auto scroll-smooth"
        style={{ height: "100vh" }}
      >
        {SECTIONS.map((s, idx) => (
          <section
            key={s.key}
            ref={(el) => {
              sectionRefs.current[s.key] = el;
            }}
            data-key={s.key}
            className="snap-start h-screen w-full flex items-center"
          >
            <SectionSplit
              index={idx + 1}
              sectionKey={s.key}
              isActive={active === s.key}
              subtitle={s.subtitle}
              RightGraphic={
                s.key === "pools" ? (
                  <PoolsIcon />
                ) : s.key === "managed" ? (
                  <ManagedIcon />
                ) : (
                  <LendingIcon />
                )
              }
            />
          </section>
        ))}
      </main>
    </div>
  );
}

/* ----------------------
   SectionSplit - middle (text) and right (card + svg)
   - isActive controls entry animation (smooth)
   ---------------------- */
function SectionSplit({
  index,
  sectionKey,
  isActive,
  subtitle,
  RightGraphic,
}: {
  index: number;
  sectionKey: SectionKey;
  isActive: boolean;
  subtitle?: string;
  RightGraphic: React.ReactNode;
}) {
  const copy = COPY[sectionKey];

  return (
    <div className="w-full max-w-7xl mx-auto px-8 flex h-full items-center">
      {/* Middle column: copy (center panel of the three-column layout) */}
      <div className="w-1/3 pr-8">
        <div className="mb-4 inline-flex items-center gap-3">
          <div className="text-sm font-medium px-2 py-1 border border-white/10 rounded-sm text-white/80">
            {sectionKey.toUpperCase()}
          </div>
          {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold mb-8">
          {sectionKey === "pools"
            ? "Pools"
            : sectionKey === "managed"
              ? "Managed Pools"
              : "Lending"}
        </h2>

        <div className="space-y-8">
          {copy.bullets.map((text, i) => {
            const [titleLine, bodyLine] = text.split("\n", 2);
            return (
              <div key={i}>
                <div className="text-sm text-gray-400 mb-3">[{i + 1}]</div>
                <p className="text-gray-300 leading-relaxed max-w-md">
                  <strong className="block text-white/90">{titleLine}</strong>
                  <span className="block mt-2 text-gray-300">{bodyLine}</span>
                </p>
                <div className="mt-6 h-px bg-white/6 w-full" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Right column: card + svg (black-toned grid background behind) */}
      <div className="w-2/3 relative">
        {/* grid background */}
        <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none">
          <RightGrid />
        </div>

        {/* animate card in/out smoothly */}
        <div className="h-full flex items-center justify-end pr-8">
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.div
                key={sectionKey}
                initial={{ opacity: 0, y: 20, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                className="bg-[#0b0b0b] border border-white/6 rounded-lg p-6 w-[520px] max-w-full flex gap-6 items-center"
                whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(0,0,0,0.6)" }}
              >
                {/* left: card text */}
                <div className="flex-1">
                  <div className="text-sm text-gray-400 uppercase">
                    {copy.tagline}
                  </div>
                  <div className="text-xl md:text-2xl font-semibold mt-2">
                    Piron{" "}
                    {sectionKey === "pools"
                      ? "Pool"
                      : sectionKey === "managed"
                        ? "Managed Pool"
                        : "Lending"}{" "}
                    Sample
                  </div>
                  <div className="text-gray-400 text-sm mt-2">
                    APY{" "}
                    <span className="text-green-400 font-semibold">2.5%</span> •
                    Deposit USDC
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button className="px-3 py-1 rounded-full bg-violet-600 text-white text-xs">
                      View
                    </button>
                    <button className="px-3 py-1 rounded-md border border-white/8 text-white text-xs">
                      Deposit
                    </button>
                  </div>
                </div>

                {/* right: svg graphic (symbolic) */}
                <div className="w-[170px] h-[110px] flex items-center justify-center opacity-95">
                  {RightGraphic}
                </div>
              </motion.div>
            ) : (
              /* render a muted, smaller card for non-active sections (keeps visual parity) */
              <motion.div
                key={`${sectionKey}-muted`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0b0b0b] border border-white/4 rounded-lg p-6 w-[420px] max-w-full flex gap-6 items-center opacity-60"
              >
                <div className="flex-1">
                  <div className="text-sm text-gray-500 uppercase">
                    {copy.tagline}
                  </div>
                  <div className="text-lg font-semibold mt-2">
                    {sectionKey === "pools"
                      ? "Piron Pool"
                      : sectionKey === "managed"
                        ? "Managed Pool"
                        : "Lending"}
                  </div>
                  <div className="text-gray-500 text-sm mt-2">
                    APY <span className="text-gray-400 font-semibold">—</span>
                  </div>
                </div>
                <div className="w-[120px] h-[80px] flex items-center justify-center opacity-80">
                  {RightGraphic}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ----------------------
   Right-side subtle black-toned grid background
   ---------------------- */
function RightGrid() {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="gridSmall"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path d="M32 0H0V0" fill="none" />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="#070707" />
      {/* vertical + horizontal faint lines */}
      <g opacity="0.06" stroke="#ffffff" strokeWidth="1">
        {Array.from({ length: 40 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 32} y1="0" x2={i * 32} y2="800" />
        ))}
        {Array.from({ length: 30 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 32} x2="1200" y2={i * 32} />
        ))}
      </g>
    </svg>
  );
}
