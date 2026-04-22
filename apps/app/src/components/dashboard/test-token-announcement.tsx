"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { apiClient } from "@/lib/api/client";

type ClaimStatus =
  | { canClaim: true }
  | { canClaim: false; nextClaimAt: string };

type ClaimState =
  | { type: "idle" }
  | { type: "loading-status" }
  | { type: "ready" }
  | { type: "cooldown"; nextClaimAt: string }
  | { type: "claiming" }
  | { type: "success"; txHash: string }
  | { type: "error"; message: string };

function formatTimeUntil(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return "soon";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function TestTokenAnnouncement() {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [recipientWasEdited, setRecipientWasEdited] = useState(false);
  const [claimState, setClaimState] = useState<ClaimState>({ type: "idle" });

  useEffect(() => {
    if (!recipientWasEdited) {
      setRecipient(address ?? "");
    }
  }, [address, recipientWasEdited]);

  async function checkStatus(walletAddress: string) {
    setClaimState({ type: "loading-status" });
    try {
      const { data } = await apiClient.get<ClaimStatus>(
        `/faucet/status/${walletAddress}`
      );
      if (data.canClaim) {
        setClaimState({ type: "ready" });
      } else {
        setClaimState({ type: "cooldown", nextClaimAt: data.nextClaimAt });
      }
    } catch {
      setClaimState({ type: "ready" });
    }
  }

  async function handleClaim() {
    if (!recipient || claimState.type === "claiming") return;
    setClaimState({ type: "claiming" });
    try {
      const { data } = await apiClient.post<{ txHash: string }>("/faucet/claim", {
        walletAddress: recipient,
      });
      setClaimState({ type: "success", txHash: data.txHash });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong. Please try again.";
      setClaimState({ type: "error", message: msg });
    }
  }

  const openClaimModal = () => {
    setIsOpen(true);
    setClaimState({ type: "idle" });
    const addr = address ?? "";
    if (!recipientWasEdited) setRecipient(addr);
    if (addr) checkStatus(addr);
  };

  function closeModal() {
    setIsOpen(false);
    setClaimState({ type: "idle" });
  }

  function handleRecipientBlur() {
    if (recipient.startsWith("0x") && recipient.length === 42) {
      checkStatus(recipient);
    }
  }

  const isValidAddress = recipient.startsWith("0x") && recipient.length === 42;
  const canSubmit =
    isValidAddress &&
    (claimState.type === "ready" || claimState.type === "error");
  const isDisabled =
    !isValidAddress ||
    claimState.type === "claiming" ||
    claimState.type === "cooldown" ||
    claimState.type === "loading-status" ||
    claimState.type === "idle";

  return (
    <>
      {/* Banner */}
      <div className="border-b border-[#00c853]/10 bg-[#00c853]/[0.04]">
        <div className="flex items-center justify-between gap-4 px-3 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00c853]/15 sm:flex">
              <div className="h-1.5 w-1.5 rounded-full bg-[#00c853]" />
            </div>
            <p className="min-w-0 text-[12px] text-[#999] sm:text-[13px]">
              <span className="font-medium text-white/80">Testnet mode</span>
              <span className="mx-1.5 hidden text-[#333] sm:inline">&middot;</span>
              <span className="hidden sm:inline">
                Claim 100,000 E20M tokens to try deposits and pool actions
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={openClaimModal}
            className="shrink-0 rounded-full bg-[#00c853]/15 px-3.5 py-1.5 text-[11px] font-medium text-[#00c853] transition-colors hover:bg-[#00c853]/25"
          >
            Claim tokens
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0a0a0b] shadow-2xl">
            {/* Header */}
            <div className="border-b border-[#1a1a1a] px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00c853]/15">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#00c853]" />
                    </div>
                    <h2
                      id="claim-modal-title"
                      className="text-sm font-medium text-white"
                    >
                      Claim test tokens
                    </h2>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-5 text-[#666]">
                    Receive 100,000 E20M. One claim per wallet every 7 days.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#666] transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Success state */}
            {claimState.type === "success" ? (
              <div className="px-5 py-8 sm:px-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00c853]/15">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-[#00c853]">
                      <path d="M4 11L9 16L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">100,000 E20M sent</p>
                    <p className="mt-1 text-[12px] text-[#666]">Tokens are on their way to your wallet.</p>
                  </div>
                  {claimState.txHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${claimState.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-[#00c853]/70 transition-colors hover:text-[#00c853]"
                    >
                      {claimState.txHash.slice(0, 12)}…{claimState.txHash.slice(-8)} ↗
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-2 h-9 rounded-lg bg-white/5 px-6 text-[12px] font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Body */}
                <div className="space-y-4 px-5 py-5 sm:px-6">
                  {/* Cooldown notice */}
                  {claimState.type === "cooldown" && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-3.5">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="mt-px shrink-0 text-amber-400">
                        <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" />
                        <path d="M7.5 4.5V7.5L9.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      <p className="text-[12px] leading-5 text-amber-400/80">
                        Already claimed recently. Next claim available in{" "}
                        <span className="font-medium text-amber-400">
                          {formatTimeUntil(claimState.nextClaimAt)}
                        </span>.
                      </p>
                    </div>
                  )}

                  {/* Error notice */}
                  {claimState.type === "error" && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.05] p-3.5">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="mt-px shrink-0 text-red-400">
                        <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" />
                        <path d="M5 5L10 10M10 5L5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      <p className="text-[12px] leading-5 text-red-400/80">{claimState.message}</p>
                    </div>
                  )}

                  {/* Recipient */}
                  <div>
                    <label
                      htmlFor="claim-recipient"
                      className="mb-2.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#555]"
                    >
                      Recipient address
                    </label>
                    <input
                      id="claim-recipient"
                      value={recipient}
                      onChange={(e) => {
                        setRecipient(e.target.value);
                        setRecipientWasEdited(true);
                        if (claimState.type !== "idle" && claimState.type !== "loading-status") {
                          setClaimState({ type: "idle" });
                        }
                      }}
                      onBlur={handleRecipientBlur}
                      placeholder={isConnected ? "Wallet address" : "Paste recipient wallet address"}
                      spellCheck={false}
                      className="h-11 w-full rounded-lg border border-[#1a1a1a] bg-black px-3 font-mono text-[13px] text-white outline-none transition-colors placeholder:font-sans placeholder:text-[#444] focus:border-[#00c853]/40"
                    />
                    <p className="mt-2 text-[11px] text-[#555]">
                      {address
                        ? "Your connected wallet is prefilled. You can change it."
                        : "No wallet connected — paste the address to receive tokens."}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between rounded-lg border border-[#1a1a1a] px-4 py-3">
                    <span className="text-[12px] text-[#666]">You will receive</span>
                    <span className="text-[13px] font-semibold text-white">100,000 E20M</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-2.5 border-t border-[#1a1a1a] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-9 rounded-lg border border-[#1a1a1a] px-4 text-[12px] text-[#888] transition-colors hover:border-[#333] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={isDisabled}
                    className={`h-9 rounded-lg px-5 text-[12px] font-medium transition-colors ${
                      canSubmit
                        ? "bg-[#00c853] text-black hover:bg-[#00e060]"
                        : "cursor-not-allowed bg-[#1a1a1a] text-[#555]"
                    }`}
                  >
                    {claimState.type === "claiming" ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Claiming…
                      </span>
                    ) : claimState.type === "loading-status" ? (
                      "Checking…"
                    ) : claimState.type === "cooldown" ? (
                      `Available in ${formatTimeUntil(claimState.nextClaimAt)}`
                    ) : (
                      "Claim 100k tokens"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
