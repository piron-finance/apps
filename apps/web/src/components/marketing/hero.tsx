"use client";

export function Hero() {
  return (
    <section
      className="relative bg-black py-20 sm:py-32 lg:py-40 pb-12 sm:pb-16 overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(255,255,255,0.09) 1px, transparent 0),
          linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.03) 49%, rgba(255,255,255,0.03) 51%, transparent 52%),
          linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.03) 49%, rgba(255,255,255,0.03) 51%, transparent 52%)
        `,
        backgroundSize: "20px 20px, 40px 40px, 40px 40px",
      }}
    >
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-4 sm:space-y-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight px-4">
            The Global Money Market
            <br />
            Protocol
          </h1>

          <div className="flex justify-center px-4">
            <p className="text-center text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-3xl">
              Access high-quality money market instruments from Lagos to New
              York to Istanbul. Earn transparent yield on Treasury bills,
              Commercial Paper, and cash equivalents, onchain.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 px-4 w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all text-base sm:text-lg">
              Start Earning
            </button>
            <button className="w-full sm:w-auto border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all text-base sm:text-lg">
              Go to Docs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
