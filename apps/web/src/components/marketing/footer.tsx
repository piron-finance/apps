"use client";

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-10 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4">
              PIRON Finance
            </h3>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <div>Global money markets onchain.</div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4">
                © 2025 Piron
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4">
              Product
            </h3>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <div>Institutional</div>
              <div>SPV</div>
            </div>
          </div>

          <div>
            <h3 className="text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4">
              Company
            </h3>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <div>About</div>
              <div>Careers</div>
              <div>Blog</div>
            </div>
          </div>

          <div>
            <h3 className="text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4">
              Resources
            </h3>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <div>Docs</div>
              <div>Security</div>
              <div>Legal</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
