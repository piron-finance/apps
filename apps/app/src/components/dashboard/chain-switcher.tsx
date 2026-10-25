"use client";

import Image from "next/image";
import { Check, ChevronDown, Layers } from "lucide-react";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuTrigger,
} from "@/components/ui/menu";
import { useChainContext, type ChainOption } from "@/lib/context/ChainContext";
import { getChainLogo } from "@/lib/constants/chains";
import { cn } from "@/lib/utils";

/**
 * Network identity: real logo where we have one, brand-coloured dot where we don't.
 *
 * Keyed on the registry's own `logo` rather than `getChainLogo(chainId)`, which is a
 * numeric lookup and so returned nothing for Stellar and Solana — and the `if (!chainId)`
 * below then drew the generic "all networks" icon for a specific network.
 */
function ChainMark({
  chain,
  size = 16,
}: {
  chain: ChainOption;
  size?: number;
}) {
  const { networkId, id: chainId, color } = chain;
  const logo = chain.logo ?? (chainId ? getChainLogo(chainId) : undefined);

  // Only the "All Chains" option has neither identity.
  if (!networkId && !chainId) {
    return (
      <Layers
        className="text-subtle-foreground"
        style={{ width: size, height: size }}
        strokeWidth={2}
      />
    );
  }

  if (logo) {
    return (
      <Image
        src={logo}
        alt=""
        width={size}
        height={size}
        className="rounded-full"
      />
    );
  }

  return (
    <span
      className="inline-block rounded-full ring-1 ring-inset ring-black/10"
      style={{ width: size, height: size, background: color }}
    />
  );
}

/**
 * The chain is global state, so it lives in the app chrome rather than being
 * re-declared on every page that reads it.
 */
export function ChainSwitcher({ className }: { className?: string }) {
  const { activeNetworkId, setActiveNetworkId, activeChain, supportedChains } =
    useChainContext();

  return (
    <Menu>
      <MenuTrigger
        className={cn(
          "focus-ring inline-flex h-8 items-center gap-2 rounded px-2 text-[12.5px] font-medium text-foreground hover:bg-muted data-[state=open]:bg-muted",
          className,
        )}
        aria-label={`Network: ${activeChain.label}`}
      >
        <ChainMark chain={activeChain} size={15} />
        <span className="hidden sm:inline">{activeChain.shortLabel}</span>
        <ChevronDown
          className="h-3 w-3 text-subtle-foreground"
          strokeWidth={2}
        />
      </MenuTrigger>

      <MenuContent className="w-60">
        <MenuLabel>Network</MenuLabel>
        {/* From the context, which offers only the networks Piron has pools on. Keyed on
            CAIP-2: keying on `chain.id` meant Stellar and Solana both matched the "All
            Chains" entry, so selecting either silently showed every network. */}
        {supportedChains.map((chain) => {
          const selected = chain.networkId === activeNetworkId;
          return (
            <MenuItem
              key={chain.networkId ?? "all"}
              onSelect={() => setActiveNetworkId(chain.networkId)}
              className="gap-2.5"
            >
              <ChainMark chain={chain} size={18} />
              <span className="flex-1 truncate">{chain.label}</span>
              {chain.canSign === false && (
                <span
                  className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
                  title="Browse these pools here; depositing needs a wallet we have not shipped yet"
                >
                  View
                </span>
              )}
              {chain.isTestnet && (
                <span className="rounded-full bg-warning-soft px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-warning">
                  Test
                </span>
              )}
              {selected && (
                <Check className="h-3.5 w-3.5 text-brand-ink" strokeWidth={2.5} />
              )}
            </MenuItem>
          );
        })}
      </MenuContent>
    </Menu>
  );
}
