"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Check, X } from "lucide-react";
import { useUserPositions } from "@/hooks/useUserData";
import { cn } from "@/lib/utils";

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
    (r) =>
      r.status === "success" &&
      typeof r.result === "bigint" &&
      r.result > BigInt(0),
  );

  const { data: positions } = useUserPositions(address);
  const active = positions?.analytics?.activePositions ?? 0;
  const activeLocked = positions?.analytics?.activeLockedPositions ?? 0;
  const hasPosition = active + activeLocked > 0;

  const scrollToPools = () =>
    document
      .getElementById("pools-start")
      ?.scrollIntoView({ behavior: "smooth" });

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
      cta: hasPosition
        ? undefined
        : { label: "Browse pools", onClick: scrollToPools },
    },
  ];

  const allDone = steps.every((s) => s.done);
  if (dismissed || allDone) return null;

  // The first not-yet-done step is the one we actively prompt.
  const currentIndex = steps.findIndex((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;
  const progress = (doneCount / steps.length) * 100;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="surface-card animate-rise overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <h2 className="font-display text-[22px] leading-none tracking-tight text-foreground">
            Get started
          </h2>
          <p className="mt-2 text-[12.5px] text-muted-foreground">
            Three quick steps to your first deposit —{" "}
            <span className="font-medium text-foreground">
              {doneCount} of {steps.length}
            </span>{" "}
            done.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss getting started"
          className="focus-ring -mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-subtle-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Progress rail */}
      <div className="mx-5 mt-5 h-1 overflow-hidden rounded-full bg-surface-sunken sm:mx-6">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="mt-1 grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {steps.map((step, i) => {
          const isCurrent = i === currentIndex;
          return (
            <li
              key={step.title}
              className={cn(
                "flex items-start gap-3.5 px-5 py-5 sm:px-6",
                isCurrent && "bg-brand-soft/40",
              )}
            >
              <span
                className={cn(
                  "mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                  step.done
                    ? "bg-brand text-brand-foreground"
                    : isCurrent
                      ? "animate-pulse-ring bg-surface text-brand-ink ring-1 ring-brand/50"
                      : "bg-surface-sunken text-subtle-foreground",
                )}
              >
                {step.done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  i + 1
                )}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[13px] font-medium",
                    step.done ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                  {step.hint}
                </p>
                {step.cta && isCurrent && (
                  <button
                    onClick={step.cta.onClick}
                    className="focus-ring mt-3 inline-flex h-7 items-center rounded-full bg-brand px-3.5 text-[11.5px] font-semibold text-brand-foreground transition-colors hover:bg-brand-strong"
                  >
                    {step.cta.label}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
