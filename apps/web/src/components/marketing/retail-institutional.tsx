"use client";

import { useState } from "react";
import { ComingSoonModal } from "./coming-soon-modal";

export function RetailInstitutional() {
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <>
      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-ultra-modern text-white mb-4">
              Built for Retail and Institutions
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Two pathways to the same economic infrastructure. High-yield pool.
              Choose a flexible pool, or target a
              <br />
              specific instrument with a single-asset pool.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Retail: Flexible Stable Yield */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6">
                Retail: Flexible Stable Yield
              </h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold">
                    1
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">
                      Choose stablecoin
                    </div>
                    <div className="text-gray-400 text-sm">USDC</div>
                    <div className="text-right text-white font-semibold">
                      $99.8-8.1%
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold">
                    2
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">
                      Deposit and start accruing daily yield
                    </div>
                    <div className="text-gray-400 text-sm">min $1,000</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold">
                    3
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">
                      Track 30-day hold and withdraw when eligible
                    </div>
                    <div className="text-gray-400 text-sm">Same flows</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutional: Single-Asset Pools */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6">
                Institutional: Single-Asset Pools
              </h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold">
                    1
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">
                      Filter by geography, maturity, and yield
                    </div>
                    <div className="text-gray-400 text-sm">Summary</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold">
                    2
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">
                      Review instrument details, SPV, and credit ratings
                    </div>
                    <div className="text-gray-400 text-sm">Disclosures</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold">
                    3
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">
                      Fund during the open window and track coupons
                    </div>
                    <div className="text-gray-400 text-sm">Reporting</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ComingSoonModal open={showComingSoon} onOpenChange={setShowComingSoon} />
    </>
  );
}
