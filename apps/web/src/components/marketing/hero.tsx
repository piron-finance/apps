"use client";

import Image from "next/image";

export function Hero() {
  return (
    <>
      <section className="relative bg-black py-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-4xlb font-extrabold lg:text-6xl font-ultra-modern text-white mb-6 leading-tight">
                Earn 4-12% APY on
                <br />
                Global Fixed Income
              </h1>

              <p className=" text-gray-400 font-medium font-inter mb-10 leading-relaxed">
                Access government bonds and Commercial Paper from Lagos to
                <br />
                New York to Istanbul. Flexible Stable Yield pools for retail and
                <br />
                single-asset pools for institutions.
              </p>

              <div className="flex items-center space-x-4 mb-8">
                <button
                  onClick={() => {}}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Start Earning
                </button>
                <button className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-6 py-3 rounded-lg font-semibold transition-all">
                  Go to Docs
                </button>
              </div>
            </div>

            <div className="p-2 border border-gray-900 rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1616156027751-fc9a850fdc9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYyMDB8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwZGFzaGJvYXJkJTIwZGFyayUyMHVpfGVufDB8fHx8MTc1OTg0NzU1OHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Piron Finance"
                width={500}
                height={500}
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
