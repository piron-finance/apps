"use client";

import { useState } from "react";
import { ComingSoonModal } from "./coming-soon-modal";
import { motion } from "framer-motion";

export function GetStarted() {
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="bg-black py-12 sm:py-16 lg:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-ultra-modern text-white mb-3 sm:mb-4 px-4">
              Get Started in Minutes
            </h2>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed px-4 max-w-2xl mx-auto">
              Connect your wallet. Choose a pool. Done. Easy. Earn NAV and
              coupon payouts and finished automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 px-4">
            <button
              onClick={() => setShowComingSoon(true)}
              className="w-full sm:w-auto bg-[#01563e] hover:bg-[#01563e]/80 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all"
            >
              Start Earning
            </button>
            <button className="w-full sm:w-auto border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all">
              View Documentation
            </button>
          </div>
        </div>
      </motion.section>

      <ComingSoonModal open={showComingSoon} onOpenChange={setShowComingSoon} />
    </>
  );
}
