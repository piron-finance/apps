"use client";

interface StatCardProps {
  label: string;
  value: string;
  badge?: string;
  subtitle?: string;
}

export function StatCard({ label, value, badge, subtitle }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-5">
      <p className="text-[10px] text-[#8F9B99] tracking-wider mb-2">{label}</p>
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl font-semibold text-[#F5F7F6]">{value}</span>
        {badge && (
          <span className="text-[9px] px-2 py-0.5 rounded bg-[#0a2a1a] text-[#00c853]">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[10px] text-[#8F9B99] mt-1">{subtitle}</p>
      )}
    </div>
  );
}
