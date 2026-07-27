"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useUserPositions } from "@/hooks/useUserData";

// Faucet test token per chain — used only to tell whether the visitor has
// already claimed on any supported network. Mirrors the backend faucet's
// per-chain mockUSDC addresses.
const TEST_TOKENS = [
  { chainId: 84532, address: "0x94ac688dEd59cf284274DbD289AC6acfd2d5721C" }, // Base Sepolia
  { chainId: 5042002, address: "0xa8e1Ac7c693bF6e0Aef8a9D4af674F240dE0d466" }, // Arc Testnet
  { chainId: 421614, address: "0x55Cd228ec5A4AB43FA26Bf404Fe9f687918c8f8b" }, // Arbitrum Sepolia
  { chainId: 46630, address: "0xD910E50B04a319e8AF9beeCDCB583864c41b1712" }, // Robinhood Testnet
] as const;
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

  const { data: balances } = useReadContracts({
    contracts: TEST_TOKENS.map((t) => ({
      address: t.address,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: address ? ([address] as const) : undefined,
      chainId: t.chainId,
    })),
    query: { enabled: !!address },
  });
  const hasTokens = (balances ?? []).some(
    (r) => r.status === "success" && typeof r.result === "bigint" && r.result > BigInt(0),
  );

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
      hint: "Get 100,000 free tokens on your preferred network.",
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

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-[#292a30] bg-[#08080a] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.035)]">
      <div className="flex items-center justify-between px-5 pt-5 sm:px-6">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-white">Get started</h2>
          <p className="mt-0.5 text-[12px] text-[#7c7c7c]">
            Three quick steps to your first deposit — {doneCount} of {steps.length} done.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-[11px] text-[#5f5f5f] transition-colors hover:text-[#9a9a9a]"
        >
          Dismiss
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 divide-y divide-[#161618] px-5 pb-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-0 sm:pb-0">
        {steps.map((step, i) => {
          const isCurrent = i === currentIndex;
          return (
            <div
              key={i}
              className="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0 sm:px-6 sm:py-5 sm:first:pt-5 sm:last:pb-5"
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                  step.done
                    ? "bg-[#00c853] text-black"
                    : isCurrent
                      ? "text-white ring-2 ring-[#00c853]/60"
                      : "text-[#666] ring-1 ring-[#2a2a2c]"
                }`}
              >
                {step.done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <div className="min-w-0">
                <p className={`text-[13px] font-medium ${step.done ? "text-[#9a9a9a]" : "text-white"}`}>
                  {step.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#7c7c7c]">{step.hint}</p>
                {step.cta && isCurrent && (
                  <button
                    onClick={step.cta.onClick}
                    className="mt-2.5 inline-flex items-center rounded-lg bg-[#00b64a] px-3.5 py-1.5 text-[11px] font-semibold text-black transition-colors hover:bg-[#00c853]"
                  >
                    {step.cta.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
