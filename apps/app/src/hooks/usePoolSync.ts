import { useCallback } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LIQUIDITY_POOL_ABI } from "@/contracts/abis";
import { Pool } from "@/types";
import { Id } from "../../convex/_generated/dataModel";

export function usePoolSync(pool: Pool) {
  const syncWithOnchain = useMutation(api.pools.syncWithOnchain);

  // Get pool asset address for decimal detection
  const { data: assetAddress } = useReadContract({
    address: pool.contractAddress as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "asset",
    query: {
      enabled: !!pool.contractAddress,
    },
  });

  // Get asset decimals
  const { data: assetDecimals } = useReadContract({
    address: assetAddress as `0x${string}`,
    abi: [
      {
        type: "function",
        name: "decimals",
        inputs: [],
        outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
        stateMutability: "view",
      },
    ],
    functionName: "decimals",
    query: {
      enabled: !!assetAddress,
    },
  });

  // Get onchain total assets (total raised)
  const { data: totalAssets, refetch: refetchTotalAssets } = useReadContract({
    address: pool.contractAddress as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "totalAssets",
    query: {
      enabled: !!pool.contractAddress,
    },
  });

  // Get total supply (shares)
  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: pool.contractAddress as `0x${string}`,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "totalSupply",
    query: {
      enabled: !!pool.contractAddress,
    },
  });

  // Sync database with onchain values
  const syncPoolData = useCallback(async () => {
    try {
      // Refresh onchain data
      await Promise.all([refetchTotalAssets(), refetchTotalSupply()]);

      if (!totalAssets || !pool._id) {
        console.warn("Missing data for pool sync:", {
          totalAssets,
          poolId: pool._id,
        });
        return false;
      }

      const decimals = assetDecimals || 6; // Default to 6 if not available
      const onchainTotalRaised = formatUnits(totalAssets, decimals);

      // For now, we'll estimate total investors by counting unique deposit transactions
      // In a more sophisticated setup, this could be read from a contract or calculated differently
      const estimatedInvestors = pool.totalInvestors || 0;

      console.log("🔄 Syncing pool data:", {
        poolId: pool._id,
        contractAddress: pool.contractAddress,
        onchainTotalRaised,
        currentDbTotalRaised: pool.totalRaised,
        decimals,
      });

      await syncWithOnchain({
        poolId: pool._id as Id<"pools">,
        totalRaised: onchainTotalRaised,
        totalInvestors: estimatedInvestors,
        actualInvested: totalSupply
          ? formatUnits(totalSupply, decimals)
          : undefined,
      });

      console.log("✅ Pool data synced successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to sync pool data:", error);
      return false;
    }
  }, [
    pool._id,
    pool.contractAddress,
    pool.totalRaised,
    pool.totalInvestors,
    totalAssets,
    totalSupply,
    assetDecimals,
    syncWithOnchain,
    refetchTotalAssets,
    refetchTotalSupply,
  ]);

  return {
    syncPoolData,
    onchainTotalRaised: totalAssets
      ? formatUnits(totalAssets, assetDecimals || 6)
      : "0",
    onchainTotalSupply: totalSupply
      ? formatUnits(totalSupply, assetDecimals || 6)
      : "0",
    isOnchainDataAvailable: !!totalAssets && !!assetDecimals,
  };
}
