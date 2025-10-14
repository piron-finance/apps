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
    <section className="bg-black py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-ultra-modern text-white mb-6"
          >
            Global, Seamless.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gray-400 leading-relaxed mb-10 text-lg"
          >
            Your stablecoin transactions adapt to every market with local
            currency, seamless UI, and cross-border logic built in.
          </motion.p>
        </div>

        <motion.div
          className="relative h-[420px] flex items-center justify-center"
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
            className="absolute w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center z-10"
          >
            <span className="text-white font-semibold tracking-widest text-sm">
              PIRON
            </span>
          </motion.div>

          {currencies.map((c, i) => {
            const angle = (i / currencies.length) * 2 * Math.PI;
            const radius = 160;
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
                  className="bg-black border border-white/10 rounded-full w-26 h-26 flex flex-col items-center justify-center text-center backdrop-blur-md hover:bg-white/10 transition-colors"
                  whileHover={{ y: -2 }}
                >
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <div className="text-white font-semibold text-xs">
                    {c.name}
                  </div>
                  <div className="text-gray-400 text-[10px] leading-tight">
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
