"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const chainOptions = [
  {
    id: "base-sepolia",
    name: "Base Sepolia",
    description: "Recommended test network",
  },
  {
    id: "morph-holesky",
    name: "Morph Holesky",
    description: "Morph test network",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    description: "Configured app network",
  },
];

export function TestTokenAnnouncement() {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState(chainOptions[0].id);
  const [recipient, setRecipient] = useState("");
  const [recipientWasEdited, setRecipientWasEdited] = useState(false);

  useEffect(() => {
    if (!recipientWasEdited) {
      setRecipient(address ?? "");
    }
  }, [address, recipientWasEdited]);

  const openClaimModal = () => {
    setIsOpen(true);
    if (address && !recipientWasEdited) {
      setRecipient(address);
    }
  };

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
                Claim free E20M tokens to try deposits and pool actions
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
          aria-labelledby="claim-e20m-title"
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
                      id="claim-e20m-title"
                      className="text-sm font-medium text-white"
                    >
                      Claim test tokens
                    </h2>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-5 text-[#666]">
                    Select a chain and confirm the recipient address.
                    Test tokens have no real-world value.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#666] transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-5 px-5 py-5 sm:px-6">
              {/* Chain selector */}
              <div>
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#555]">
                  Network
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {chainOptions.map((chain) => (
                    <button
                      key={chain.id}
                      type="button"
                      onClick={() => setSelectedChain(chain.id)}
                      className={`rounded-lg border px-3 py-3 text-left transition-all ${
                        selectedChain === chain.id
                          ? "border-[#00c853]/40 bg-[#00c853]/[0.06] text-white"
                          : "border-[#1a1a1a] text-[#888] hover:border-[#333] hover:text-white"
                      }`}
                    >
                      <span className="block text-[12px] font-medium">
                        {chain.name}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-[#555]">
                        {chain.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

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
                  onChange={(event) => {
                    setRecipient(event.target.value);
                    setRecipientWasEdited(true);
                  }}
                  placeholder={
                    isConnected
                      ? "Paste recipient wallet address"
                      : "Connect wallet or paste recipient address"
                  }
                  className="h-11 w-full rounded-lg border border-[#1a1a1a] bg-black px-3 font-mono text-[13px] text-white outline-none transition-colors placeholder:font-sans placeholder:text-[#444] focus:border-[#00c853]/40"
                />
                <p className="mt-2 text-[11px] text-[#555]">
                  {address
                    ? "Your connected wallet is prefilled. You can change it."
                    : "No wallet connected. Paste the address that should receive tokens."}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2.5 border-t border-[#1a1a1a] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-9 rounded-lg border border-[#1a1a1a] px-4 text-[12px] text-[#888] transition-colors hover:border-[#333] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled
                className="h-9 rounded-lg bg-[#1a1a1a] px-4 text-[12px] font-medium text-[#555]"
              >
                Minting setup pending
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
