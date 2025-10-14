"use client";

import { User, Settings, LogOut } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";

export function UserMenu() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  if (!isSignedIn) {
    return (
      <Link
        href="/sign-in"
        className="px-6 py-3 border border-white/20 hover:border-white/40 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/5 text-white"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {user?.firstName?.charAt(0) ||
              user?.emailAddresses[0]?.emailAddress.charAt(0) ||
              "U"}
          </span>
        </div>
        <span className="hidden lg:block text-white font-medium">
          {user?.firstName || "User"}
        </span>
      </button>

      <div className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <div className="p-4 border-b border-white/10">
          <p className="text-white font-semibold">{user?.fullName}</p>
          <p className="text-white/60 text-sm">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        <div className="py-2">
          <Link
            href="/dashboard/portfolio"
            className="flex items-center space-x-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Portfolio</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center space-x-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
