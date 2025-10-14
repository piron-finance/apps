import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { parseUnits, decodeEventLog } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FACTORY_ABI } from "@/contracts/abis";
import { getContractAddress } from "@/contracts/addresses";

export interface CreatePoolFormData {
  name: string;
  asset: string;
  assetType?: string;
  image?: string;
  description: string;
  chains: string[];
  location?: string;
  investorType?: string;
  tags?: string[];
  minInvestment?: string;
  instrumentType: "DISCOUNTED" | "INTEREST_BEARING";
  targetRaise: string;
  discountRate?: number;
  couponRates?: number[];
  couponDates?: number[];
  epochEndTime: string;
  maturityDate: string;
  issuer: string;
  riskLevel: "Low" | "Medium" | "High";
  spvAddress: string;
  couponPayments?: Array<{ date: string; rate: number }>;
  attachments?: string[];
}

export function useCreatePool() {
  const { address, chain } = useAccount();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poolCreated, setPoolCreated] = useState<string | null>(null);
  const [currentFormData, setCurrentFormData] =
    useState<CreatePoolFormData | null>(null);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const createPoolInDB = useMutation(api.pools.create);

  useEffect(() => {
    if (isSuccess && receipt && publicClient) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, receipt, publicClient, queryClient]);

  const createPool = async (formData: CreatePoolFormData, adminId: string) => {
    setCurrentFormData(formData);
    setCurrentAdminId(adminId);
    if (!address || !chain) {
      throw new Error("Wallet not connected");
    }

    setIsCreating(true);
    setError(null);

    try {
      const factoryAddress = getContractAddress(chain.id, "FACTORY");

      // Get asset decimals dynamically
      let assetDecimals = 6; // Default to 6 (USDC standard)
      if (publicClient && formData.asset) {
        try {
          const decimals = await publicClient.readContract({
            address: formData.asset as `0x${string}`,
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
          });
          assetDecimals = Number(decimals);
          console.log(`Asset decimals detected: ${assetDecimals}`);
        } catch (err) {
          console.warn("Failed to get asset decimals, using default 6:", err);
        }
      }

      const epochEndTime = new Date(formData.epochEndTime).getTime() / 1000;
      const maturityDate = new Date(formData.maturityDate).getTime() / 1000;
      const currentTime = Date.now() / 1000;

      const epochDuration = epochEndTime - currentTime;

      // percentage to basis points (multiply by 100)
      const discountRate = formData.discountRate
        ? Math.floor(formData.discountRate * 100)
        : 0;

      const couponDates =
        formData.instrumentType === "INTEREST_BEARING" &&
        formData.couponPayments
          ? formData.couponPayments.map((payment) =>
              Math.floor(new Date(payment.date).getTime() / 1000)
            )
          : [];

      const couponRates =
        formData.instrumentType === "INTEREST_BEARING" &&
        formData.couponPayments
          ? formData.couponPayments.map(
              (payment) => Math.floor(payment.rate * 100) // Convert to basis points
            )
          : [];

      const spvAddress = formData.spvAddress;

      if (!spvAddress) {
        throw new Error("SPV address is required");
      }

      const poolConfig = {
        asset: formData.asset as `0x${string}`,
        instrumentType: formData.instrumentType === "DISCOUNTED" ? 0 : 1,
        instrumentName: formData.name,
        targetRaise: parseUnits(formData.targetRaise, assetDecimals),
        epochDuration: BigInt(Math.floor(epochDuration)),
        maturityDate: BigInt(Math.floor(maturityDate)),
        discountRate: BigInt(discountRate),
        spvAddress: spvAddress as `0x${string}`,
        couponDates: couponDates.map((date) => BigInt(date)),
        couponRates: couponRates.map((rate) => BigInt(rate)),
      };

      console.log("Creating pool with config:", poolConfig);

      await writeContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "createPool",
        args: [poolConfig],
      });
    } catch (err: unknown) {
      console.error("Error creating pool:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create pool";
      setError(errorMessage);
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const handleSuccessfulTransaction = async () => {
      if (
        isSuccess &&
        receipt &&
        !poolCreated &&
        currentFormData &&
        currentAdminId
      ) {
        try {
          const poolCreatedEvent = receipt.logs.find((log) => {
            try {
              const decoded = decodeEventLog({
                abi: FACTORY_ABI,
                data: log.data,
                topics: log.topics,
              });
              return decoded.eventName === "PoolCreated";
            } catch {
              return false;
            }
          });

          if (poolCreatedEvent) {
            const decoded = decodeEventLog({
              abi: FACTORY_ABI,
              data: poolCreatedEvent.data,
              topics: poolCreatedEvent.topics,
            });

            const eventArgs = decoded.args as {
              pool: string;
              manager: string;
              asset: string;
              instrumentName: string;
              targetRaise: bigint;
              maturityDate: bigint;
            };

            const poolAddress = eventArgs.pool;
            const managerAddress = eventArgs.manager;

            const escrowAddress = (await publicClient!.readContract({
              address: poolAddress as `0x${string}`,
              abi: [
                {
                  type: "function",
                  name: "escrow",
                  inputs: [],
                  outputs: [
                    { name: "", type: "address", internalType: "address" },
                  ],
                  stateMutability: "view",
                },
              ],
              functionName: "escrow",
            })) as string;

            const poolSymbol = (await publicClient!.readContract({
              address: poolAddress as `0x${string}`,
              abi: [
                {
                  type: "function",
                  name: "symbol",
                  inputs: [],
                  outputs: [
                    { name: "", type: "string", internalType: "string" },
                  ],
                  stateMutability: "view",
                },
              ],
              functionName: "symbol",
            })) as string;

            setPoolCreated(poolAddress);

            console.log("Pool created successfully:", {
              poolAddress,
              managerAddress,
              escrowAddress,
            });

            await createPoolInDB({
              adminId: currentAdminId as Parameters<
                typeof createPoolInDB
              >[0]["adminId"],
              contractAddress: poolAddress,
              managerAddress: managerAddress,
              escrowAddress: escrowAddress,
              symbol: poolSymbol,
              name: currentFormData.name,
              issuer: currentFormData.issuer,
              chains: currentFormData.chains,
              image: currentFormData.image || "",
              description: currentFormData.description,
              targetAmount: currentFormData.targetRaise,
              minimumInvestment: currentFormData.minInvestment || "0",
              maturityDate: Math.floor(
                new Date(currentFormData.maturityDate).getTime() / 1000
              ),
              riskLevel: currentFormData.riskLevel.toUpperCase() as
                | "LOW"
                | "MEDIUM"
                | "HIGH",
              instrumentType: currentFormData.instrumentType,
              assetType: currentFormData.assetType || "",
              discountRate: currentFormData.discountRate || 0,
              location: currentFormData.location || "",
              investorType:
                (currentFormData.investorType as
                  | "ACCREDITED"
                  | "RETAIL"
                  | "INSTITUTIONAL") || "RETAIL",
              tags: currentFormData.tags || [],
              couponRates:
                currentFormData.couponPayments?.map((p) => p.rate.toString()) ||
                [],
              couponDates:
                currentFormData.couponPayments?.map((p) =>
                  Math.floor(new Date(p.date).getTime() / 1000)
                ) || [],
              attachments: currentFormData.attachments || [],
              expectedReturn: "0", // Will be calculated by smart contract. we will do this on invested state
              category: "OTHER" as
                | "REAL_ESTATE"
                | "COMMODITIES"
                | "PRIVATE_EQUITY"
                | "VENTURE_CAPITAL"
                | "INFRASTRUCTURE"
                | "OTHER",
            });

            console.log("Pool saved to database successfully");
          } else {
            console.error("PoolCreated event not found in transaction logs");
          }
        } catch (err) {
          console.error("Error processing successful transaction:", err);
        }
      }
    };

    handleSuccessfulTransaction();
  }, [
    isSuccess,
    receipt,
    poolCreated,
    currentFormData,
    currentAdminId,
    createPoolInDB,
    publicClient,
  ]);

  if (isSuccess || error) {
    if (isCreating) {
      setIsCreating(false);
    }
  }

  return {
    createPool,
    isCreating: isCreating || isPending || isConfirming,
    isSuccess,
    error,
    transactionHash: hash,
  };
}
