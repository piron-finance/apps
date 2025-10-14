import { useAccount, useDisconnect, useBalance } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export function useWallet() {
  const { address, isConnected, chain, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  const { data: balance } = useBalance({
    address,
  });

  const connectWallet = () => {
    open();
  };

  const disconnectWallet = () => {
    disconnect();
  };

  return {
    address,
    isConnected,
    chain,
    connector,
    balance,

    connectWallet,
    disconnectWallet,

    isWalletConnected: isConnected,
    walletAddress: address,
    chainId: chain?.id,
    chainName: chain?.name,
    nativeCurrency: chain?.nativeCurrency,
  };
}
