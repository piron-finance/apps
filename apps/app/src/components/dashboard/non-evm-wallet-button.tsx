"use client";

import { useStellarWallet } from "@/lib/wallets/StellarWalletContext";
import { useSolanaWallet } from "@/lib/wallets/SolanaWalletContext";
import { runtimeOf } from "@/lib/constants/networks";
import { cn } from "@/lib/utils";

/**
 * Connect the wallet a non-EVM pool needs, where the investor is blocked by not having it.
 *
 * Deliberately scoped to the pool in front of them rather than offered globally. An
 * investor on a Base pool has no reason to be asked about Freighter, and a header with
 * three connect buttons reads as three things to do rather than one. So this appears
 * beside the deposit control, on the pools where it is the next step.
 *
 * Renders nothing for an EVM pool, or once the right wallet is connected — the deposit
 * control takes over from there.
 */
export function NonEvmWalletButton({
  pool,
  className,
}: {
  pool?: { networkId?: string | null; chainId?: number | null };
  className?: string;
}) {
  const runtime = runtimeOf(pool?.networkId ?? undefined);
  const stellar = useStellarWallet();
  const solana = useSolanaWallet();

  if (!pool || !runtime || runtime === "evm") return null;

  const wallet = runtime === "stellar" ? stellar : solana;
  if (wallet.address) return null;

  const label = (() => {
    if (wallet.connecting) return "Connecting…";
    if (runtime === "stellar") {
      return stellar.available ? "Connect Freighter" : "Install Freighter";
    }
    return solana.available
      ? `Connect ${solana.walletName ?? "wallet"}`
      : "Install Phantom";
  })();

  // Where there is no extension the useful action is to go and get it, so the control
  // becomes a link rather than a button that can only fail.
  const installUrl =
    runtime === "stellar" ? "https://www.freighter.app/" : "https://phantom.app/download";

  if (!wallet.available) {
    return (
      <a
        href={installUrl}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          "focus-ring inline-flex h-9 w-full items-center justify-center rounded-full border border-border px-4 text-[12px] font-medium text-foreground hover:border-border-strong hover:bg-muted",
          className
        )}
      >
        {label}
      </a>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={() => void wallet.connect()}
        disabled={wallet.connecting}
        className="focus-ring inline-flex h-9 w-full items-center justify-center rounded-full bg-foreground px-4 text-[12px] font-medium text-background hover:bg-foreground/88 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {label}
      </button>
      {wallet.error && (
        <p className="text-[11px] leading-relaxed text-negative">{wallet.error}</p>
      )}
    </div>
  );
}
