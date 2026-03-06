"use client";

export function Sidebar() {
  return (
    <div className="w-[32%] space-y-4">
      <LiquiditySection />
      <MaturitiesSection />
      <ProtocolHealthSection />
    </div>
  );
}

function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-black p-5">
      {children}
    </div>
  );
}

function LiquiditySection() {
  return (
    <SidebarCard>
      <h3 className="text-[14px] font-medium text-white mb-0.5">
        Where the capital sits
      </h3>
      <p className="text-[12px] text-[#666] mb-4">
        TVL by currency. Useful for gauging depth.
      </p>
      <div className="space-y-2.5">
        <SidebarRow label="USD stables" value="72% · $32.5M" />
        <SidebarRow label="CNGN" value="16% · ₦2.0B" />
        <SidebarRow label="Other EM" value="12% · $5.1M" />
      </div>
      <div className="bg-[#0a0a0a] rounded-lg mt-4 p-4 space-y-2.5">
        <SidebarRow label="EM exposure" value="28% of TVL" muted />
        <SidebarRow label="Largest holding" value="USDC 58%" muted />
      </div>
    </SidebarCard>
  );
}

function MaturitiesSection() {
  return (
    <SidebarCard>
      <h3 className="text-[14px] font-medium text-white mb-0.5">
        Coming due
      </h3>
      <p className="text-[12px] text-[#666] mb-4">
        Maturities and payouts over the next two weeks.
      </p>
      <div className="space-y-2.5">
        <SidebarRow label="Maturities" value="4 pools · $3.2M" />
        <SidebarRow label="Coupon sweeps" value="3 runs · $410k" />
      </div>
      <div className="bg-[#0a0a0a] rounded-lg mt-4 p-4 space-y-2.5">
        <SidebarRow label="Today" value="NAV window open" muted />
        <SidebarRow label="Thu" value="2 locked pools mature" muted />
        <SidebarRow label="Next Mon" value="Coupon distribution" muted />
      </div>
    </SidebarCard>
  );
}

function ProtocolHealthSection() {
  return (
    <SidebarCard>
      <h3 className="text-[14px] font-medium text-white mb-0.5">
        System snapshot
      </h3>
      <p className="text-[12px] text-[#666] mb-4">
        Quick read on protocol status.
      </p>
      <div className="space-y-2.5">
        <SidebarRow label="Capital utilization" value="68%" />
        <SidebarRow label="Avg position age" value="23 days" />
        <SidebarRow label="System status" value="Nominal" />
      </div>
      <div className="bg-[#0a0a0a] rounded-lg mt-4 p-4 flex gap-2">
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
          Full analytics
        </button>
        <button className="px-3 py-1.5 text-[11px] text-[#888] border border-[#1a1a1a] rounded-full hover:text-white hover:border-[#333] transition-colors">
          Risk docs
        </button>
      </div>
    </SidebarCard>
  );
}

function SidebarRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between text-[12px]">
      <span className="text-[#888]">{label}</span>
      <span className={muted ? "text-[#666]" : "text-white"}>{value}</span>
    </div>
  );
}
