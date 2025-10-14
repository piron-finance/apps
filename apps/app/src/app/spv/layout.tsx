"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  Settings,
  LogOut,
  Home,
  Briefcase,
  Receipt,
} from "lucide-react";

const spvSidebarItems = [
  {
    name: "Dashboard",
    href: "/spv",
    icon: Building2,
  },
  {
    name: "Fund Withdrawals",
    href: "/spv/withdrawals",
    icon: DollarSign,
  },
  {
    name: "Investment Confirmations",
    href: "/spv/investments",
    icon: CheckCircle,
  },
  {
    name: "Coupon Payments",
    href: "/spv/coupons",
    icon: Receipt,
  },
  {
    name: "Pool Maturity",
    href: "/spv/maturity",
    icon: Clock,
  },
  {
    name: "Reports",
    href: "/spv/reports",
    icon: FileText,
  },
];

const bottomItems = [
  {
    name: "Settings",
    href: "/spv/settings",
    icon: Settings,
  },
  {
    name: "Back to App",
    href: "/dashboard/pools",
    icon: Home,
  },
];

export default function SPVLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-40 right-40 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="flex">
        <div className="fixed inset-y-0 left-0 w-64 bg-slate-950/80 backdrop-blur-xl border-r border-white/5 z-50">
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-3 p-6 border-b border-white/5">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  SPV Dashboard
                </span>
                <p className="text-xs text-slate-400">
                  Special Purpose Vehicle
                </p>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6">
              <div className="space-y-2">
                {spvSidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="p-4 border-t border-white/5">
              <div className="space-y-2">
                {bottomItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      SPV Operator
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      spv@piron.finance
                    </p>
                  </div>
                </div>
                <button className="flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg text-sm font-medium transition-colors w-full mt-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 ml-64">
          <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center justify-between px-6 h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-white">
                  {pathname === "/spv" && "SPV Dashboard"}
                  {pathname === "/spv/withdrawals" && "Fund Withdrawals"}
                  {pathname === "/spv/investments" &&
                    "Investment Confirmations"}
                  {pathname === "/spv/coupons" && "Coupon Payments"}
                  {pathname === "/spv/maturity" && "Pool Maturity Processing"}
                  {pathname === "/spv/reports" && "Reports & Analytics"}
                  {pathname === "/spv/settings" && "Settings"}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                  SPV Mode
                </div>
              </div>
            </div>
          </div>

          <main className="relative z-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
