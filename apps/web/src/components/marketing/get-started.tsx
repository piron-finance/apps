"use client";

import { useState } from "react";
import { ComingSoonModal } from "./coming-soon-modal";

export function GetStarted() {
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <>
      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-ultra-modern text-white mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Connect your wallet. Choose a pool. Done. Easy. Earn NAV and
              coupon payouts and finished
              <br />
              automatically.
            </p>
          </div>

          <div className="flex justify-center items-center space-x-6">
            <button
              onClick={() => setShowComingSoon(true)}
              className="bg-[#01563e] hover:bg-[#01563e]/80 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            >
              Start Earning
            </button>
            <button className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-8 py-4 rounded-lg font-semibold text-lg transition-all">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      <ComingSoonModal open={showComingSoon} onOpenChange={setShowComingSoon} />
    </>
  );
}
