"use client";

import { motion } from "framer-motion";

const currencies = [
  { icon: "💵", name: "USDC", desc: "USD Coin" },
  { icon: "💶", name: "USDT", desc: "Tether" },
  { icon: "🇳🇬", name: "cNGN", desc: "Nigerian Naira" },
  { icon: "🇰🇪", name: "cKES", desc: "Kenyan Shilling" },
];

export function CrossBorder() {
  return (
    <section className="bg-black py-12 sm:py-16 lg:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-ultra-modern text-white mb-4 sm:mb-6"
          >
            Global, Seamless.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm sm:text-base lg:text-lg text-gray-400 leading-relaxed mb-6 sm:mb-10"
          >
            Your stablecoin transactions adapt to every market with local
            currency, seamless UI, and cross-border logic built in.
          </motion.p>
        </div>

        <motion.div
          className="relative h-[280px] sm:h-[350px] lg:h-[420px] flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center z-10"
          >
            <span className="text-white font-semibold tracking-widest text-xs sm:text-sm">
              PIRON
            </span>
          </motion.div>

          {currencies.map((c, i) => {
            const angle = (i / currencies.length) * 2 * Math.PI;
            const getRadius = () => {
              if (typeof window === "undefined") return 160;
              if (window.innerWidth < 640) return 100;
              if (window.innerWidth < 1024) return 130;
              return 160;
            };
            const radius = getRadius();
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  x: x,
                  y: y,
                }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.15 + 0.5,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="absolute flex flex-col items-center justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className="bg-black border border-white/10 rounded-full w-20 h-20 sm:w-24 sm:h-24 lg:w-26 lg:h-26 flex flex-col items-center justify-center text-center backdrop-blur-md hover:bg-white/10 transition-colors p-2"
                  whileHover={{ y: -2 }}
                >
                  <div className="text-lg sm:text-xl lg:text-2xl mb-0.5 sm:mb-1">
                    {c.icon}
                  </div>
                  <div className="text-white font-semibold text-[10px] sm:text-xs">
                    {c.name}
                  </div>
                  <div className="text-gray-400 text-[8px] sm:text-[10px] leading-tight">
                    {c.desc}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
