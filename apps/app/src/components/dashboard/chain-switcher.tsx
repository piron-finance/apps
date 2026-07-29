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
import { useChainContext, SUPPORTED_CHAINS } from "@/lib/context/ChainContext";
import { getChainLogo } from "@/lib/constants/chains";
import { cn } from "@/lib/utils";

/** Chain identity: real logo where we have one, brand-coloured dot where we don't. */
function ChainMark({
  chainId,
  color,
  size = 16,
}: {
  chainId?: number;
  color: string;
  size?: number;
}) {
  const logo = chainId ? getChainLogo(chainId) : undefined;

  if (!chainId) {
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
  const { activeChainId, setActiveChainId, activeChain } = useChainContext();

  return (
    <Menu>
      <MenuTrigger
        className={cn(
          "focus-ring inline-flex h-8 items-center gap-2 rounded px-2 text-[12.5px] font-medium text-foreground hover:bg-muted data-[state=open]:bg-muted",
          className,
        )}
        aria-label={`Network: ${activeChain.label}`}
      >
        <ChainMark chainId={activeChainId} color={activeChain.color} size={15} />
        <span className="hidden sm:inline">{activeChain.shortLabel}</span>
        <ChevronDown
          className="h-3 w-3 text-subtle-foreground"
          strokeWidth={2}
        />
      </MenuTrigger>

      <MenuContent className="w-60">
        <MenuLabel>Network</MenuLabel>
        {SUPPORTED_CHAINS.map((chain) => {
          const selected = chain.id === activeChainId;
          return (
            <MenuItem
              key={chain.label}
              onSelect={() => setActiveChainId(chain.id)}
              className="gap-2.5"
            >
              <ChainMark chainId={chain.id} color={chain.color} size={18} />
              <span className="flex-1 truncate">{chain.label}</span>
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
