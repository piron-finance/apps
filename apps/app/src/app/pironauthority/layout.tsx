"use client";

import { usePathname } from "next/navigation";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminGuard } from "@/components/admin/admin-guard";
import { Wallet } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-40 right-40 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="flex">
          <AdminSidebar />

          <div className="flex-1 ml-64">
            <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
              <div className="flex items-center justify-between px-6 h-16">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold text-white">
                    {pathname === "/pironauthority" && "Piron Authority"}
                    {pathname === "/pironauthority/pools/create" &&
                      "Create New Pool"}
                    {pathname === "/pironauthority/pools" && "Manage Pools"}
                    {pathname === "/pironauthority/analytics" && "Analytics"}
                    {pathname === "/pironauthority/users" && "User Management"}
                    {pathname === "/pironauthority/transactions" &&
                      "Transactions"}
                    {pathname === "/pironauthority/settings" && "Settings"}
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => open()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isConnected
                      ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                      : "Connect Wallet"}
                  </Button>
                </div>
              </div>
            </div>

            <main className="relative z-10">{children}</main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
