"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useUserPositions } from "@/hooks/useUserData";

// App is pinned to Arbitrum Sepolia; this is its test token (E20M) — used only to
// tell whether the visitor has already claimed. Mirrors the faucet's token.
const ARBITRUM_CHAIN_ID = 421614;
const TEST_TOKEN = "0x55Cd228ec5A4AB43FA26Bf404Fe9f687918c8f8b" as const;
const DISMISS_KEY = "piron_firstrun_dismissed";

/** Opens the faucet modal (owned by TestTokenAnnouncement) via a window event. */
export function openFaucet() {
  window.dispatchEvent(new Event("piron:open-faucet"));
}

type Step = {
  title: string;
  hint: string;
  done: boolean;
  cta?: { label: string; onClick: () => void };
};

export function FirstRunStepper() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const { data: balance } = useReadContract({
    address: TEST_TOKEN,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: ARBITRUM_CHAIN_ID,
    query: { enabled: !!address },
  });
  const hasTokens = typeof balance === "bigint" && balance > BigInt(0);

  const { data: positions } = useUserPositions(address);
  const active = positions?.analytics?.activePositions ?? 0;
  const activeLocked = positions?.analytics?.activeLockedPositions ?? 0;
  const hasPosition = active + activeLocked > 0;

  const scrollToPools = () =>
    document.getElementById("pools-start")?.scrollIntoView({ behavior: "smooth" });

  const steps: Step[] = [
    {
      title: "Connect your wallet",
      hint: "Sign in to deposit and track your positions.",
      done: isConnected,
      cta: isConnected ? undefined : { label: "Connect", onClick: () => open() },
    },
    {
      title: "Claim test tokens",
      hint: "Get 100,000 free tokens on Arbitrum.",
      done: hasTokens,
      cta: hasTokens ? undefined : { label: "Claim", onClick: openFaucet },
    },
    {
      title: "Make your first deposit",
      hint: "Pick a pool and start earning.",
      done: hasPosition,
      cta: hasPosition ? undefined : { label: "Browse pools", onClick: scrollToPools },
    },
  ];

  const allDone = steps.every((s) => s.done);
  if (dismissed || allDone) return null;

  // The first not-yet-done step is the one we actively prompt.
  const currentIndex = steps.findIndex((s) => !s.done);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="mb-4 rounded-xl border border-[#1a1a1a] bg-[#08090a] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-medium text-white">Get started in 3 steps</h2>
          <p className="text-[12px] text-[#777]">A quick path to your first deposit on testnet.</p>
        </div>
        <button
          onClick={dismiss}
          className="rounded-md px-2 py-1 text-[11px] text-[#666] transition-colors hover:bg-white/5 hover:text-[#aaa]"
        >
          Dismiss
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((step, i) => {
          const isCurrent = i === currentIndex;
          return (
            <div
              key={i}
              className={`rounded-lg border p-3.5 transition-colors ${
                step.done
                  ? "border-[#1a1a1a] bg-[#0a0a0b]"
                  : isCurrent
                    ? "border-[#00c853]/30 bg-[#00c853]/[0.04]"
                    : "border-[#1a1a1a] bg-[#0a0a0b]"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${
                    step.done
                      ? "bg-[#00c853] text-black"
                      : isCurrent
                        ? "border border-[#00c853]/50 text-[#00c853]"
                        : "border border-[#2a2a2a] text-[#777]"
                  }`}
                >
                  {step.done ? (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <p className={`text-[12px] font-medium ${step.done ? "text-[#888]" : "text-white"}`}>
                  {step.title}
                </p>
              </div>
              <p className="text-[11px] leading-relaxed text-[#777]">{step.hint}</p>
              {step.cta && isCurrent && (
                <button
                  onClick={step.cta.onClick}
                  className="mt-3 rounded-lg bg-[#00b64a] px-3 py-1.5 text-[11px] font-semibold text-black transition-colors hover:bg-[#00c853]"
                >
                  {step.cta.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
