"use client";

import { PixelGrid } from "../fancy/pixel-grid";

export function Hero() {
  return (
    <section
      className="relative bg-black py-40 pb-16 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full">
        <PixelGrid className="w-full h-full" pixelColor="#1A1A1B" />
      </div>
      <div className="relative flex flex-col z-10 items-center px-8 max-w-7xl mx-auto">
        <div className="space-y-6 text-center">
          <h1 className="text-5xl lg:text-8xl font-extrabold text-white leading-tight tracking-tight">
            The Global Money
            <br />
            Market Protocol
          </h1>

          <div className="flex justify-center">
            <p className="text-center text-lg text-neutral-500 leading-relaxed max-w-3xl">
              Access high-quality money market instruments from Lagos to New
              York to Istanbul. Earn transparent yield on Treasury bills,
              Commercial Paper, and cash equivalents, onchain.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4 pt-4">
            <button className="bg-green-400 rounded-sm text-black px-8 py-3 font-semibold transition-all text-lg cursor-pointer">
              Start Earning
            </button>
            <button className="border border-gray-600 rounded-sm text-gray-300 hover:text-white hover:border-gray-400 px-8 py-3 font-semibold transition-all text-lg cursor-pointer">
              Go to Docs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
