"use client";

import { useState } from "react";
import { useStellarWallet } from "@/lib/wallets/StellarWalletContext";
import { signAndSubmitStellar } from "@/lib/wallets/submitStellar";
import { buildStellarTestUsdc } from "@/lib/api/endpoints";

/** Circle's testnet USDC, as the Soroban contract a pool holds it through. */
const TESTNET_USDC_CONTRACT = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const SWAP_XLM = "200";

/**
 * Test USDC for a Stellar USDC pool, in one signature.
 *
 * Stellar USDC is a classic asset: a wallet has to add a trustline before it can hold any,
 * and a USDC pool can only pay back an account that has one. So an investor arriving with
 * just XLM from friendbot could not deposit, and the reason ("no trustline") meant nothing
 * to them. This adds the trustline if it is missing and buys test USDC with XLM on the
 * testnet exchange, as one transaction they sign in Freighter. Nothing comes from Piron.
 *
 * Testnet only. On mainnet the trustline step remains and the USDC is the investor's own.
 */
export function StellarTestUsdc({
  pool,
  account,
  hasTrustline,
  onFunded,
}: {
  pool: { networkId?: string | null; assetAddress?: string };
  account: string;
  hasTrustline?: boolean;
  onFunded: () => void;
}) {
  const stellar = useStellarWallet();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (pool.networkId !== "stellar:testnet" || pool.assetAddress !== TESTNET_USDC_CONTRACT) return null;

  const getUsdc = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const { transaction, quote } = await buildStellarTestUsdc({ account, xlm: SWAP_XLM });
      if (transaction.runtime !== "stellar") throw new Error("Unexpected transaction for a Stellar account.");
      await signAndSubmitStellar(stellar, transaction, "swap");
      setMessage({
        ok: true,
        text:
          `Swapped ${Number(quote.sendXlm)} XLM for about ${Number(quote.expectedUsdc).toFixed(2)} USDC` +
          (quote.addsTrustline ? ", and added the USDC trustline." : "."),
      });
      onFunded();
    } catch (e) {
      const text =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (e instanceof Error ? e.message : "The swap did not go through.");
      setMessage({ ok: false, text });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-border-subtle bg-surface-sunken px-3 py-2.5">
      <p className="text-[11.5px] leading-relaxed text-foreground">
        {hasTrustline === false
          ? "This pool is in USDC. Your wallet has to trust USDC before it can hold any. On testnet you can add the trustline and buy test USDC with XLM in one step."
          : "Need test USDC? Swap XLM for it on the Stellar testnet exchange."}
      </p>
      <button
        onClick={getUsdc}
        disabled={busy}
        className="mt-2 rounded-full border border-brand-line px-3 py-1 text-[11px] text-brand-ink hover:bg-brand-soft disabled:opacity-50"
      >
        {busy ? "Sign in Freighter…" : `Get test USDC for ${SWAP_XLM} XLM`}
      </button>
      {message && (
        <p className={`mt-2 text-[11px] ${message.ok ? "text-brand-ink" : "text-negative"}`}>{message.text}</p>
      )}
    </div>
  );
}
