"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { apiClient } from "@/lib/api/client";
import { getTransactionUrl, getChainName } from "@/lib/constants/chains";

// Chains the faucet can mint on (must match the backend FAUCET_CHAIN_IDS). The
// modal lets the user pick which one to receive tokens on; the default follows
// the connected wallet's chain when it is one of these.
const FAUCET_CHAINS = [84532, 5042002, 421614, 46630]; // Base Sepolia, Arc Testnet, Arbitrum Sepolia, Robinhood Testnet
const DEFAULT_FAUCET_CHAIN_ID = 421614;

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
  const { address, isConnected, chainId: connectedChainId } = useAccount();

  // The user chooses which supported chain to receive tokens on. Default to the
  // connected wallet's chain when it's a faucet chain, else the first one.
  const [faucetChainId, setFaucetChainId] = useState<number>(
    DEFAULT_FAUCET_CHAIN_ID,
  );

  // Follow the connected wallet's chain when it's a supported faucet chain.
  useEffect(() => {
    if (connectedChainId && FAUCET_CHAINS.includes(connectedChainId)) {
      setFaucetChainId(connectedChainId);
    }
  }, [connectedChainId]);

  const [isOpen, setIsOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [recipientWasEdited, setRecipientWasEdited] = useState(false);
  const [claimState, setClaimState] = useState<ClaimState>({ type: "idle" });

  useEffect(() => {
    if (!recipientWasEdited) {
      setRecipient(address ?? "");
    }
  }, [address, recipientWasEdited]);

  // Cooldown is per-chain — re-check when the target chain changes while open.
  useEffect(() => {
    if (isOpen && recipient.startsWith("0x") && recipient.length === 42) {
      checkStatus(recipient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faucetChainId]);

  async function checkStatus(walletAddress: string) {
    setClaimState({ type: "loading-status" });
    try {
      const { data } = await apiClient.get<ClaimStatus>(
        `/faucet/status/${walletAddress}?chainId=${faucetChainId}`,
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
      const { data } = await apiClient.post<{ txHash: string }>(
        "/faucet/claim",
        {
          walletAddress: recipient,
          chainId: faucetChainId,
        },
      );
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

  // Let other components (e.g. the first-run stepper) open this modal.
  useEffect(() => {
    const handler = () => openClaimModal();
    window.addEventListener("piron:open-faucet", handler);
    return () => window.removeEventListener("piron:open-faucet", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, recipientWasEdited]);

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
      {/* Banner — a warm "testnet notice" that reads as a distinct stratum
          above the canvas without competing with the app's green. */}
      <button
        type="button"
        onClick={openClaimModal}
        className="group block w-full border-b border-border bg-surface-sunken text-left hover:bg-muted"
      >
        <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-5 py-2.5 sm:px-8">
          <span className="shrink-0 rounded-sm border border-warning/30 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-warning">
            Testnet
          </span>
          <p className="min-w-0 truncate text-[12.5px] text-muted-foreground">
            <span className="font-medium text-foreground">
              Claim 100,000 free test tokens
            </span>
            <span className="hidden sm:inline">
              {" "}
              — you&rsquo;ll need them to deposit into any pool.
            </span>
          </p>
          <span className="ml-auto flex shrink-0 items-center gap-1 text-[12.5px] font-medium text-foreground underline decoration-border-strong underline-offset-2 group-hover:decoration-foreground">
            Claim
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/25 p-3 backdrop-blur-md sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-pop">
            {/* Header */}
            <div className="border-b border-border-subtle px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand" />
                    </div>
                    <h2
                      id="claim-modal-title"
                      className="text-[15px] font-semibold tracking-tight text-foreground"
                    >
                      Claim test tokens
                    </h2>
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                    Receive 100,000 test tokens. One claim per wallet every 7 days.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-subtle-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M11 3L3 11M3 3L11 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Success state */}
            {claimState.type === "success" ? (
              <div className="px-5 py-9 sm:px-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      className="text-brand-ink"
                    >
                      <path
                        d="M4 11L9 16L18 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">
                      100,000 test tokens sent
                    </p>
                    <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                      Tokens are on their way to your wallet.
                    </p>
                  </div>
                  {claimState.txHash && (
                    <a
                      href={getTransactionUrl(faucetChainId, claimState.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-brand-ink hover:opacity-70"
                    >
                      {claimState.txHash.slice(0, 12)}…
                      {claimState.txHash.slice(-8)} ↗
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="focus-ring mt-2 h-9 rounded border border-border px-6 text-[12.5px] font-medium text-foreground hover:bg-surface-raised"
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
                    <div className="flex items-start gap-3 rounded border border-warning/25 bg-warning-soft p-3.5">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        className="mt-px shrink-0 text-warning"
                      >
                        <circle
                          cx="7.5"
                          cy="7.5"
                          r="6.5"
                          stroke="currentColor"
                        />
                        <path
                          d="M7.5 4.5V7.5L9.5 9.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                        Already claimed recently. Next claim available in{" "}
                        <span className="font-semibold text-warning">
                          {formatTimeUntil(claimState.nextClaimAt)}
                        </span>
                        .
                      </p>
                    </div>
                  )}

                  {/* Error notice */}
                  {claimState.type === "error" && (
                    <div className="flex items-start gap-3 rounded border border-negative/25 bg-negative-soft p-3.5">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        className="mt-px shrink-0 text-negative"
                      >
                        <circle
                          cx="7.5"
                          cy="7.5"
                          r="6.5"
                          stroke="currentColor"
                        />
                        <path
                          d="M5 5L10 10M10 5L5 10"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p className="text-[12.5px] leading-relaxed text-negative">
                        {claimState.message}
                      </p>
                    </div>
                  )}

                  {/* Recipient */}
                  <div>
                    <label htmlFor="claim-recipient" className="eyebrow mb-2.5 block">
                      Recipient address
                    </label>
                    <input
                      id="claim-recipient"
                      value={recipient}
                      onChange={(e) => {
                        setRecipient(e.target.value);
                        setRecipientWasEdited(true);
                        if (
                          claimState.type !== "idle" &&
                          claimState.type !== "loading-status"
                        ) {
                          setClaimState({ type: "idle" });
                        }
                      }}
                      onBlur={handleRecipientBlur}
                      placeholder={
                        isConnected
                          ? "Wallet address"
                          : "Paste recipient wallet address"
                      }
                      spellCheck={false}
                      className="h-11 w-full rounded border border-input bg-surface px-3.5 font-mono text-[13px] text-foreground outline-none placeholder:font-sans placeholder:text-subtle-foreground focus:border-brand/50 focus:ring-2 focus:ring-ring/25"
                    />
                    <p className="mt-2 text-[11.5px] text-subtle-foreground">
                      {address
                        ? "Your connected wallet is prefilled. You can change it."
                        : "No wallet connected — paste the address to receive tokens."}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between rounded border border-border-subtle bg-surface-sunken px-4 py-3">
                    <span className="text-[12.5px] text-muted-foreground">
                      You will receive
                    </span>
                    <span
                      data-numeric
                      className="text-[13px] font-semibold text-foreground"
                    >
                      100,000 test tokens
                    </span>
                  </div>

                  {/* Network — pick which chain to receive tokens on */}
                  <div className="flex items-center justify-between rounded border border-border-subtle bg-surface-sunken px-4 py-3">
                    <span className="text-[12.5px] text-muted-foreground">
                      Network
                    </span>
                    <select
                      value={faucetChainId}
                      onChange={(e) => setFaucetChainId(Number(e.target.value))}
                      className="focus-ring cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12.5px] font-medium text-foreground"
                    >
                      {FAUCET_CHAINS.map((id) => (
                        <option key={id} value={id}>
                          {getChainName(id)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-2.5 border-t border-border-subtle px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="focus-ring h-9 rounded border border-border px-4 text-[12.5px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={isDisabled}
                    className={`focus-ring h-9 rounded px-5 text-[12.5px] font-semibold ${
                      canSubmit
                        ? "bg-brand text-brand-foreground hover:bg-brand-strong"
                        : "cursor-not-allowed bg-muted text-subtle-foreground"
                    }`}
                  >
                    {claimState.type === "claiming" ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-3.5 w-3.5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
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
