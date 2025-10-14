"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Target,
  Users,
  Settings,
  TrendingUp,
  Shield,
  FileText,
  BarChart3,
  LogOut,
  Plus,
  Home,
} from "lucide-react";

const adminSidebarItems = [
  {
    name: "Dashboard",
    href: "/pironauthority",
    icon: BarChart3,
  },
  {
    name: "Create Pool",
    href: "/pironauthority/pools/create",
    icon: Plus,
  },
  {
    name: "Manage Pools",
    href: "/pironauthority/pools",
    icon: Target,
  },
  {
    name: "Analytics",
    href: "/pironauthority/analytics",
    icon: TrendingUp,
  },
  {
    name: "Users",
    href: "/pironauthority/users",
    icon: Users,
  },
  {
    name: "Transactions",
    href: "/pironauthority/transactions",
    icon: FileText,
  },
];

const bottomItems = [
  {
    name: "Settings",
    href: "/pironauthority/settings",
    icon: Settings,
  },
  {
    name: "Back to App",
    href: "/pools",
    icon: Home,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-slate-950/80 backdrop-blur-xl border-r border-white/5 z-50">
      <div className="flex flex-col h-full">
        <div className="flex items-center space-x-3 p-6 border-b border-white/5">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Admin Panel</span>
            <div className="text-xs text-slate-400">Piron Finance</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {adminSidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
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
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
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
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-slate-400 truncate">
                  admin@piron.finance
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
  );
}
