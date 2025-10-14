import { useAccount, useReadContract } from "wagmi";

import {
  FACTORY_ABI,
  LIQUIDITY_POOL_ABI,
  REGISTRY_ABI,
} from "@/contracts/abis";
import { getContractAddress } from "@/contracts/addresses";
import { Pool } from "@/types";

///////////////////// REGISTRY CONTRACT /////////////////////
export function useRegistryContract() {
  const { chain } = useAccount();

  const registryAddress = chain
    ? getContractAddress(chain.id, "REGISTRY")
    : undefined;

  const {
    data: activePools,
    isLoading: isLoadingActivePools,
    refetch: refetchActivePools,
  } = useReadContract({
    address: registryAddress,
    abi: REGISTRY_ABI,
    functionName: "getActivePools",
    query: {
      enabled: !!registryAddress,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const {
    data: allPools,
    isLoading: isLoadingAllPools,
    refetch: refetchAllPools,
  } = useReadContract({
    address: registryAddress,
    abi: REGISTRY_ABI,
    functionName: "getAllPools",
    query: {
      enabled: !!registryAddress,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const {
    data: poolsByType,
    isLoading: isLoadingPoolsByType,
    refetch: refetchPoolsByType,
  } = useReadContract({
    address: registryAddress,
    abi: REGISTRY_ABI,
    functionName: "getPoolsByType",
    args: ["DISCOUNTED"], // String parameter as per the actual ABI
    query: {
      enabled: !!registryAddress,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const refetchAll = async () => {
    await Promise.all([
      refetchActivePools(),
      refetchAllPools(),
      refetchPoolsByType(),
    ]);
  };

  return {
    activePools: (activePools as string[]) || [],
    allPools: (allPools as string[]) || [],
    poolsByType: (poolsByType as string[]) || [],
    isLoadingActivePools:
      isLoadingActivePools || isLoadingAllPools || isLoadingPoolsByType,
    refetch: refetchAll,
  };
}

///////////////////// POOL CONTRACT /////////////////////

export function usePoolContract(poolAddress?: `0x${string}`) {
  const { data: totalAssets, isLoading: isLoadingTotalAssets } =
    useReadContract({
      address: poolAddress,
      abi: LIQUIDITY_POOL_ABI,
      functionName: "totalAssets",
      query: {
        enabled: !!poolAddress,
      },
    });

  const { data: totalSupply, isLoading: isLoadingTotalSupply } =
    useReadContract({
      address: poolAddress,
      abi: LIQUIDITY_POOL_ABI,
      functionName: "totalSupply",
      query: {
        enabled: !!poolAddress,
      },
    });

  const { data: isMatured, isLoading: isLoadingMatured } = useReadContract({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: "isMatured",
    query: {
      enabled: !!poolAddress,
    },
  });

  const { data: isInFundingPeriod, isLoading: isLoadingFunding } =
    useReadContract({
      address: poolAddress,
      abi: LIQUIDITY_POOL_ABI,
      functionName: "isInFundingPeriod",
      query: {
        enabled: !!poolAddress,
      },
    });

  return {
    totalAssets: totalAssets as bigint | undefined,
    totalSupply: totalSupply as bigint | undefined,
    isMatured: isMatured as boolean | undefined,
    isInFundingPeriod: isInFundingPeriod as boolean | undefined,
    isLoading:
      isLoadingTotalAssets ||
      isLoadingTotalSupply ||
      isLoadingMatured ||
      isLoadingFunding,
  };
}

export function useMultiplePoolContracts() {
  return {
    pools: [] as Pool[],
    isLoading: false,
  };
}

///////////////////// FACTORY CONTRACT /////////////////////

export function useFactoryContract() {
  const { chain } = useAccount();

  const factoryAddress = chain
    ? getContractAddress(chain.id, "FACTORY")
    : undefined;

  const {
    data: poolCount,
    isLoading: isLoadingPoolCount,
    refetch,
  } = useReadContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: "totalPoolsCreated",
    query: {
      enabled: !!factoryAddress,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  return {
    poolCount: poolCount ? Number(poolCount) : 0,
    isLoadingPoolCount,
    refetch,
  };
}
