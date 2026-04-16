"use client";

interface StatCardProps {
  label: string;
  value: string;
  badge?: string;
  subtitle?: string;
}

export function StatCard({ label, value, badge, subtitle }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <p className="text-[10px] text-[#8F9B99] tracking-wider mb-2">{label}</p>
      <div className="mb-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="break-words text-xl font-semibold text-[#F5F7F6] sm:text-2xl">
          {value}
        </span>
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
