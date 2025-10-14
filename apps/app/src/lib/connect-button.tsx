"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useDisconnect, useEnsName } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  LogOut,
  ChevronDown,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncateAddress } from "@/lib/utils";
import { useState } from "react";

export function ConnectButton() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  const { data: ensName } = useEnsName({
    address,
  });

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewOnExplorer = () => {
    if (address && chain) {
      const explorerUrl = chain.blockExplorers?.default?.url;
      if (explorerUrl) {
        window.open(`${explorerUrl}/address/${address}`, "_blank");
      }
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={() => open()}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-white/20 hover:border-white/40"
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden md:inline">
            {ensName || truncateAddress(address || "")}
          </span>
          <span className="md:hidden">Wallet</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-slate-900 border-slate-700"
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-white">
            {ensName || "Wallet Connected"}
          </p>
          <p className="text-xs text-slate-400 font-mono">
            {truncateAddress(address || "")}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Network: {chain?.name || "Unknown"}
          </p>
        </div>
        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem
          onClick={handleCopyAddress}
          className="cursor-pointer hover:bg-slate-800"
        >
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleViewOnExplorer}
          className="cursor-pointer hover:bg-slate-800"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem
          onClick={() => disconnect()}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}