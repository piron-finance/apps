"use client";

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* PIRON POOLS */}
          <div>
            <h3 className="text-white font-semibold mb-4">PIRON POOLS</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div>
                Borderless fixed-income platform for global, high-yield bond
                investing.
              </div>
              <div className="text-xs text-gray-500 mt-4">© 2024 Piron</div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div>Institutional</div>
              <div>SPV</div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div>About</div>
              <div>Careers</div>
              <div>Blog</div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <div className="space-y-2 text-sm text-gray-400">
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
