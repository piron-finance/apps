"use client";

/**
 * PostHogProvider
 *
 * Wraps children with the PostHog analytics client.
 * Activation: set NEXT_PUBLIC_POSTHOG_KEY in the public app .env.
 * If not set, this component is a transparent pass-through — no PostHog calls
 * are made and the app behaves identically to before.
 *
 * Privacy configuration:
 *   - No autocapture (explicit funnel events only)
 *   - No session recording (DeFi privacy — never record screens)
 *   - Memory-only persistence (no cross-session wallet correlation)
 *   - Proxy via /ingest/* (avoids ad blockers, NextConfig rewrite required)
 *
 * Data sent:
 *   pool_type, chain_id, has_tier (boolean), failure_stage, tx_prefix (first 10 chars)
 * Data never sent:
 *   wallet address, full tx hash, deposit amount, KYC status
 */

import { useEffect, PropsWithChildren } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";

/**
 * Tags the current visitor with is_internal=true when the connected wallet is
 * listed in NEXT_PUBLIC_INTERNAL_WALLETS. The Watchtower audience queries
 * exclude is_internal traffic, so the team's own testing never pollutes the
 * "external user activity" numbers. Registered as a super property, so it
 * rides along on every subsequent event this session.
 */
const INTERNAL_WALLETS = new Set(
  (process.env.NEXT_PUBLIC_INTERNAL_WALLETS ?? "")
    .split(",")
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean),
);

function PostHogInternalTag() {
  const { address } = useAccount();

  useEffect(() => {
    const internal = !!address && INTERNAL_WALLETS.has(address.toLowerCase());
    // register persists the flag on all future events; false clears it on disconnect
    posthog.register({ is_internal: internal });
  }, [address]);

  return null;
}

function PostHogPageView() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog.isFeatureEnabled !== undefined) {
      let url = window.location.origin + pathname;
      if (searchParams?.toString()) url += `?${searchParams.toString()}`;
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: PropsWithChildren) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  useEffect(() => {
    if (!key) return; // PostHog disabled — no-op

    posthog.init(key, {
      api_host:                 "/ingest",            // proxy via Next.js rewrite
      capture_pageview:         false,                // manual via PostHogPageView
      capture_pageleave:        true,
      disable_session_recording: true,               // no screen recording — DeFi privacy
      autocapture:              false,               // explicit events only
      persistence:              "memory",            // no cross-session correlation
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug();
      },
    });
  }, [key]);

  if (!key) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      <PostHogInternalTag />
      {children}
    </PHProvider>
  );
}
