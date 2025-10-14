"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CreateFirstAdmin } from "./create-first-admin";
import { Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isSignedIn, user } = useUser();

  const adminCheck = useQuery(
    api.admins.checkAdminByEmail,
    isSignedIn && user?.emailAddresses?.[0]?.emailAddress
      ? { email: user.emailAddresses[0].emailAddress }
      : "skip"
  );

  const totalAdmins = useQuery(api.admins.getAllAdmins, {});

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Admin Access Required
          </h2>
          <p className="text-slate-400 mb-6">
            Sign in with your admin account to access the Piron Authority
            dashboard.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-red-500/50 text-red-300 hover:bg-red-500/10"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (adminCheck === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (totalAdmins && totalAdmins.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
        <CreateFirstAdmin />
      </div>
    );
  }

  return <>{children}</>;
}
