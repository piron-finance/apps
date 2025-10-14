"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

export function CreateFirstAdmin() {
  const { user } = useUser();
  const createAdmin = useMutation(api.admins.createFirstAdmin);
  const [step, setStep] = useState<"form" | "creating" | "success" | "error">(
    "form"
  );
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    name: user?.fullName || "",
    walletAddress: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setStep("creating");
    setError("");

    try {
      await createAdmin({
        clerkId: user.id,
        email: formData.email,
        name: formData.name,
        walletAddress: formData.walletAddress || undefined,
      });

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin");
      setStep("error");
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  if (step === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Super Admin Created!
        </h3>
        <p className="text-slate-400 mb-6">
          Your wallet has been granted super admin privileges. You can now
          access the admin dashboard.
        </p>
        <Button
          onClick={() => {
            // Force a page refresh to re-run all queries
            window.location.href = window.location.pathname;
          }}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        >
          Continue to Dashboard
        </Button>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Admin Creation Failed
        </h3>
        <p className="text-red-400 mb-6">{error}</p>
        <Button
          onClick={() => setStep("form")}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (step === "creating") {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-300">Creating super admin...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Create First Super Admin
        </h2>
        <p className="text-slate-400">
          Set up the initial super admin account for your Piron Finance
          platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-slate-300">
            Admin Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleInputChange("name")}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="e.g., John Smith"
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-slate-300">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="admin@piron.finance"
            required
          />
        </div>

        <div>
          <Label htmlFor="walletAddress" className="text-slate-300">
            Wallet Address (Optional)
          </Label>
          <Input
            id="walletAddress"
            value={formData.walletAddress}
            onChange={handleInputChange("walletAddress")}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="0x1234...abcd"
          />
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">
            🔐 Your Clerk account ({user?.emailAddresses?.[0]?.emailAddress})
            will be granted super admin privileges.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        >
          Create Super Admin
        </Button>
      </form>
    </div>
  );
}
