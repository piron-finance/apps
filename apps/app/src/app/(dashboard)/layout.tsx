"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, PieChart, User, LogOut } from "lucide-react";
import { ConnectButton } from "@/lib/connect-button";
import { useUser } from "@clerk/nextjs";
import { useAccount } from "wagmi";
import Image from "next/image";

const sidebarItems = [
  {
    name: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
  },
  {
    name: "Pools",
    href: "/pools",
    icon: Target,
  },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: PieChart,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-40 right-40 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="flex">
        <div className="fixed inset-y-0 left-0 w-64 bg-slate-950/80 backdrop-blur-xl border-r border-white/5 z-50">
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-3 p-6 border-b border-white/5">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <span className="text-white font-bold text-lg">π</span>
              </div>
              <span className="text-xl font-bold text-white">
                Piron Finance
              </span>
            </div>

            <nav className="flex-1 px-4 py-6">
              <div className="space-y-2">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
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
              <div className="space-y-4">
                <div className="flex items-center space-x-3 px-3 py-2">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.firstName || "User"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {isSignedIn && user
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                          "User"
                        : "Guest"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {isSignedIn && user?.primaryEmailAddress?.emailAddress
                        ? user.primaryEmailAddress.emailAddress
                        : isConnected && address
                          ? `${address.slice(0, 6)}...${address.slice(-4)}`
                          : "Not connected"}
                    </p>
                  </div>
                </div>

                {isSignedIn && (
                  <button
                    onClick={() => (window.location.href = "/sign-out")}
                    className="flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg text-sm font-medium transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 ml-64">
          <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center justify-between px-6 h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-white">
                  {pathname === "/overview" && "Dashboard Overview"}
                  {pathname === "/pools" && "Investment Pools"}
                  {pathname.startsWith("/pools/") && "Pool Details"}
                  {pathname === "/portfolio" && "Portfolio"}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <ConnectButton />
              </div>
            </div>
          </div>

          <main className="relative z-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
