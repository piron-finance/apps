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
      title: "Connect a wallet",
      done: isConnected,
      cta: isConnected ? undefined : { label: "Connect", onClick: () => open() },
    },
    {
      title: "Claim test tokens",
      done: hasTokens,
      cta: hasTokens ? undefined : { label: "Claim", onClick: openFaucet },
    },
    {
      title: "Make a deposit",
      done: hasPosition,
      cta: hasPosition
        ? undefined
        : { label: "Browse markets", onClick: scrollToPools },
    },
  ];

  const allDone = steps.every((s) => s.done);
  if (dismissed || allDone) return null;

  const currentIndex = steps.findIndex((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-border py-4">
      <span className="eyebrow">
        Getting started · {doneCount}/{steps.length}
      </span>

      <ol className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {steps.map((step, i) => {
          const isCurrent = i === currentIndex;
          return (
            <li
              key={step.title}
              className={cn(
                "items-center gap-2",
                // On phones only the step you can act on is worth the space.
                isCurrent ? "flex" : "hidden sm:flex",
              )}
            >
              <span
                className={cn(
                  "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  step.done
                    ? "bg-brand text-brand-foreground"
                    : isCurrent
                      ? "border border-brand/60 text-brand-ink"
                      : "border border-border text-subtle-foreground",
                )}
              >
                {step.done ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "text-[12.5px]",
                  step.done
                    ? "text-subtle-foreground line-through decoration-border-strong"
                    : isCurrent
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
              {step.cta && isCurrent && (
                <button
                  onClick={step.cta.onClick}
                  className="focus-ring ml-0.5 rounded px-1.5 py-0.5 text-[12px] font-medium text-brand-ink underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
                >
                  {step.cta.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <button
        onClick={dismiss}
        aria-label="Dismiss getting started"
        className="focus-ring ml-auto flex h-6 w-6 items-center justify-center rounded text-subtle-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
