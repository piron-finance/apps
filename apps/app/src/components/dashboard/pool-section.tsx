"use client";

import { ReactNode } from "react";

interface PoolSectionProps {
  label: string;
  title: string;
  subtitle: string;
  filters?: ReactNode;
  children: ReactNode;
}

export function PoolSection({
  label,
  title,
  subtitle,
  filters,
  children,
}: PoolSectionProps) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#060607] p-4 sm:p-5">
      <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-[11px] text-[#8F9B99] tracking-wider">{label}</p>
        {filters && <div className="w-full overflow-x-auto sm:w-auto">{filters}</div>}
      </div>
      <h2 className="text-[16px] font-medium text-[#F5F7F6]">{title}</h2>
      <p className="text-[12px] text-[#8F9B99] mt-1">{subtitle}</p>
      {children}
    </div>
  );
}
