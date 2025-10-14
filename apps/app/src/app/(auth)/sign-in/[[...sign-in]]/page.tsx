"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">
            Sign in to your Piron Finance account
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-slate-900/50 border border-white/10 backdrop-blur-xl",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10",
              socialButtonsBlockButtonText: "text-white",
              formButtonPrimary: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
              formFieldInput: "bg-slate-800/50 border-slate-600 text-white",
              formFieldLabel: "text-slate-300",
              footerActionLink: "text-purple-400 hover:text-purple-300",
              identityPreviewText: "text-slate-300",
              identityPreviewEditButton: "text-purple-400",
            }
          }}
          redirectUrl="/pools"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}