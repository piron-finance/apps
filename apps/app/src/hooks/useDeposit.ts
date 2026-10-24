import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import ERC20_ABI from "@/contracts/abis/IERC20.json";
import LIQUIDITY_POOL_ABI from "@/contracts/abis/LiquidityPool.json";
import STABLE_YIELD_POOL_ABI from "@/contracts/abis/StableYieldPool.json";
import LOCKED_POOL_ABI from "@/contracts/abis/LockedPool.json";
import { Pool } from "@/lib/api/types";
import {
  buildDepositTransaction,
  buildLockedDepositTransaction,
  confirmDepositTransaction,
} from "@/lib/api/endpoints";
import { useInvalidateAfterMutation } from "@/hooks/useQueryInvalidation";
import { usePendingTx } from "@/lib/context/PendingTxContext";
import { canSignFor, networkLabel } from "../lib/constants/networks";
import { useNonEvmDeposit } from "./useNonEvmDeposit";

interface UseDepositReturn {
  /** Set when this app cannot take a deposit for the pool's network. */
  depositUnavailableReason?: string;
  deposit: (amount: string, tierIndex?: number, interestPayment?: "UPFRONT" | "AT_MATURITY") => Promise<`0x${string}`>;
  approve: (amount: string) => Promise<`0x${string}`>;
  approveAndDeposit: (amount: string) => Promise<void>;
  needsApproval: (amount: string) => boolean;
  hasInsufficientBalance: (amount: string) => boolean;
  exceedsMaxDeposit: (amount: string) => boolean;
  poolNotAcceptingDeposits: () => boolean;
  getUserBalance: () => string;
  getMaxDepositAmount: () => string;
  reset: () => void;
  refetchAllowance: () => Promise<any>;
  refetchBalance: () => Promise<any>;


  isApproving: boolean;
  isApprovalSuccess: boolean;
  isConfirming: boolean;
  isPending: boolean;
  isDepositing: boolean;
  isSuccess: boolean;
  isLoading: boolean;


  error: null;
  shares: string | null;
  transactionHash: `0x${string}` | undefined;
  approvalTxHash: `0x${string}` | undefined;
  balance: string | undefined;
  balanceRaw: bigint | undefined;
}

export function useDeposit(pool?: Pool): UseDepositReturn {
  const { address, chainId: walletChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const invalidateAfterMutation = useInvalidateAfterMutation();
  const { add: addPendingTx, markMined } = usePendingTx();

  // A product's instances live on different chains, so the wallet may be on the
  // wrong one when the user picks a network to invest on. wagmi's switchChainAsync
  // prompts wallet_switchEthereumChain and auto-adds the chain (wallet_addEthereumChain)
  // from the wagmi config if the wallet doesn't have it yet. Without this the write
  // throws ChainMismatchError. For Arc/Robinhood the RPC the wallet saves is the
  // backend proxy, so no provider key ends up in a user's wallet.
  /**
   * Put the wallet on the pool's chain, refusing when there is no chain to put it on.
   *
   * `switchChainAsync({ chainId: pool.chainId as any })` ran unguarded, and `as any` is
   * what let it compile: off EVM `chainId` is null, `84532 !== null` is true, so the app
   * asked the wallet to switch to null and the wallet threw. An investor clicking Deposit
   * on a Stellar pool got an opaque wallet failure rather than being told this app cannot
   * sign for that network yet.
   */
  /**
   * Whether this pool is signed by a non-EVM wallet.
   *
   * Read off the chain id rather than the runtime string: `chainId === null` is what the
   * backend's CHECK constraint guarantees for every non-EVM pool, whereas `runtime` is
   * optional on the response and absent from an older backend.
   */
  const isNonEvm = Boolean(pool) && (pool!.chainId === null || pool!.chainId === undefined);
  const nonEvm = useNonEvmDeposit(isNonEvm ? pool : undefined);

  const ensureChain = async (): Promise<number> => {
    if (!pool) throw new Error("Pool not loaded");
    if (!canSignFor(pool)) {
      throw new Error(
        `${networkLabel(pool)} deposits are not available in this app yet. The pool is ` +
          "live and its figures are real, but signing for this network needs a wallet " +
          "connection we have not shipped — so nothing can be submitted from here.",
      );
    }
    if (pool.chainId === null || pool.chainId === undefined) {
      throw new Error(
        `This pool has no EVM chain id, so a deposit cannot be targeted. (${networkLabel(pool)})`,
      );
    }
    if (walletChainId !== pool.chainId) {
      await switchChainAsync({ chainId: pool.chainId as never });
    }
    return pool.chainId;
  };

  /**
   * Whether this app can take a deposit for this pool at all.
   *
   * Exposed so the panel can disable the control with a reason instead of letting an
   * investor find out by clicking. A disabled button that explains itself is a different
   * experience from one that fails.
   */
  const depositUnavailableReason = !pool
    ? undefined
    : !canSignFor(pool)
      ? `Deposits on ${networkLabel(pool)} are not available in this app yet.`
      : // Off EVM the blocker is no longer "this app cannot sign for the network" but
        // "no wallet for that network is connected", which is something the investor can
        // actually fix — so the message says which wallet.
        isNonEvm
        ? nonEvm.needsWalletReason
        : undefined;
  const [depositTxHash, setDepositTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [approvalTxHash, setApprovalTxHash] = useState<
    `0x${string}` | undefined
  >();


  const poolABI =
    pool?.poolType === "STABLE_YIELD"
      ? STABLE_YIELD_POOL_ABI
      : pool?.poolType === "LOCKED"
      ? LOCKED_POOL_ABI
      : LIQUIDITY_POOL_ABI;


  const { writeContractAsync } = useWriteContract();

  const {
    data: balance,
    refetch: refetchBalance,
    error: balanceError,
  } = useReadContract({
    address: pool?.assetAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: pool?.chainId as any,
    query: {
      enabled: Boolean(address && pool?.assetAddress && pool?.chainId),
    },
  });

  // A failed balance read (e.g. an RPC 429/over-quota) otherwise renders as a
  // silent "0 balance" → "Insufficient balance". Surface it so it's diagnosable.
  useEffect(() => {
    if (balanceError) {
      // eslint-disable-next-line no-console
      console.warn(
        `[useDeposit] balance read failed on chain ${pool?.chainId} for ${pool?.assetAddress}:`,
        balanceError.message
      );
    }
  }, [balanceError]); // eslint-disable-line react-hooks/exhaustive-deps


  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: pool?.assetAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      address && pool
        ? [address, pool.poolAddress as `0x${string}`]
        : undefined,
    chainId: pool?.chainId as any,
    query: {
      enabled: Boolean(
        address && pool?.assetAddress && pool?.poolAddress && pool?.chainId
      ),
    },
  });

  // Check on-chain max deposit capacity (ERC-4626)
  const { data: maxDepositOnChain } = useReadContract({
    address: pool?.poolAddress as `0x${string}`,
    abi: poolABI,
    functionName: "maxDeposit",
    args: address ? [address] : undefined,
    chainId: pool?.chainId as any,
    query: {
      enabled: Boolean(address && pool?.poolAddress && pool?.chainId && pool?.poolType !== "LOCKED"),
    },
  });


  const { isLoading: isApproving, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approvalTxHash,
    });

  const {
    isLoading: isConfirming,
    isSuccess: isDepositSuccess,
    data: depositReceipt,
  } = useWaitForTransactionReceipt({
    hash: depositTxHash,
  });

  // The receipt is on-chain within a couple of seconds, but the backend only
  // learns about it on its next indexer poll (12s in BURST, 60s in NORMAL).
  // Hand it the hash directly so it writes the Transaction row now, then
  // invalidate — so the very next refetch already carries the confirmed record
  // instead of returning pre-deposit state for another minute.
  useEffect(() => {
    if (!isDepositSuccess || !address || !pool?.poolAddress || !depositTxHash) return;
    markMined(depositTxHash);
    confirmDepositTransaction(depositTxHash, pool.chainId ?? undefined, pool.networkId)
      .catch((err) => {
        // Non-fatal: the indexer still picks the deposit up on its own. The
        // optimistic row stays on screen until then.
        console.warn("[useDeposit] confirm push failed, falling back to indexer:", err?.message);
      })
      .finally(() => invalidateAfterMutation(address, pool.poolAddress));
  }, [isDepositSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const needsApproval = (amount: string): boolean => {
    // Neither non-EVM runtime has an allowance. Soroban carries the token transfer's
    // authorisation in the same transaction's auth entries, and an SPL transfer is
    // authorised by the signature that authorises the instruction — so there is nothing
    // to approve, and returning true here would gate the deposit behind a step that can
    // never complete.
    if (isNonEvm) return false;
    if (!pool || !allowance) return true;

    try {
      const amountBigInt = parseUnits(amount, pool.assetDecimals);
      return (allowance as bigint) < amountBigInt;
    } catch {
      return true;
    }
  };

  const hasInsufficientBalance = (amount: string): boolean => {
    // The balance read below is an ERC20 call, so off EVM it is always undefined and the
    // `!balance` guard would report every amount as unaffordable. The contract checks the
    // balance when the transfer runs, so an over-deposit fails there with a real reason
    // rather than being pre-empted by a figure we never fetched.
    if (isNonEvm) return false;
    if (!pool || !balance) return true;

    try {
      const amountBigInt = parseUnits(amount, pool.assetDecimals);
      return (balance as bigint) < amountBigInt;
    } catch {
      return true;
    }
  };

  const exceedsMaxDeposit = (amount: string): boolean => {
    if (!pool || maxDepositOnChain === undefined || pool.poolType === "LOCKED") return false;
    try {
      const amountBigInt = parseUnits(amount, pool.assetDecimals);
      return amountBigInt > (maxDepositOnChain as bigint);
    } catch {
      return false;
    }
  };

  const poolNotAcceptingDeposits = (): boolean => {
    if (!pool || maxDepositOnChain === undefined || pool.poolType === "LOCKED") return false;
    return (maxDepositOnChain as bigint) === BigInt(0);
  };

  const getUserBalance = (): string => {
    if (!pool || !balance) return "0";
    return formatUnits(balance as bigint, pool.assetDecimals);
  };

  const getMaxDepositAmount = (): string => {
    if (pool?.poolType !== "LOCKED" && maxDepositOnChain !== undefined && balance !== undefined) {
      const maxOnChain = maxDepositOnChain as bigint;
      const bal = balance as bigint;
      const effective = maxOnChain < bal ? maxOnChain : bal;
      return formatUnits(effective, pool!.assetDecimals);
    }
    return getUserBalance();
  };

  const approve = async (amount: string) => {
    if (!pool || !address) {
      throw new Error("Pool or wallet not connected");
    }

    const chainId = await ensureChain();

    const amountBigInt = parseUnits(amount, pool.assetDecimals);

    try {
      const hash = await writeContractAsync({
        address: pool.assetAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [pool.poolAddress as `0x${string}`, amountBigInt],
        chainId: pool.chainId as any,
      });

      setApprovalTxHash(hash);
      return hash;
    } catch (error) {
      console.error("Approval failed:", error);
      throw error;
    }
  };

  const deposit = async (amount: string, tierIndex?: number, interestPayment?: "UPFRONT" | "AT_MATURITY") => {
    if (!pool) throw new Error("Pool not loaded");

    // A Stellar or Solana pool is signed by its own wallet, through its own envelope, and
    // with no approval leg. Delegated rather than branched through the rest of this hook,
    // which is built around an ERC20 allowance and wagmi's receipt tracking — neither of
    // which exists off EVM. The call site stays one `deposit(...)` either way.
    if (isNonEvm) {
      return (await nonEvm.deposit(
        amount,
        tierIndex ?? 0,
        interestPayment ?? "AT_MATURITY",
      )) as `0x${string}`;
    }

    if (!address) {
      throw new Error("Pool or wallet not connected");
    }

    const chainId = await ensureChain();

    try {
      const amountBigInt = parseUnits(amount, pool.assetDecimals);

      let hash: `0x${string}`;

      if (pool.poolType === "LOCKED") {
        // UPFRONT = 0, AT_MATURITY = 1
        const paymentChoice = interestPayment === "UPFRONT" ? 0 : 1;

        // Tell the backend a locked deposit is inbound so its indexer bursts
        // (12s polls) before the tx lands. The non-locked branch below gets this
        // for free from buildDepositTransaction; without it a locked deposit
        // left the indexer at its 60s resting cadence. Fire-and-forget — a
        // failure here must never block the user's deposit.
        buildLockedDepositTransaction({
          poolAddress: pool.poolAddress,
          amount,
          depositor: address,
          tierIndex: tierIndex ?? 0,
          interestPayment: interestPayment ?? "AT_MATURITY",
          chainId,
        }).catch((err) => {
          console.warn("[useDeposit] locked deposit pre-signal failed:", err?.message);
        });

        hash = await writeContractAsync({
          address: pool.poolAddress as `0x${string}`,
          chainId: pool.chainId as any,
          abi: LOCKED_POOL_ABI as any,
          functionName: "depositLocked",
          args: [amountBigInt, tierIndex ?? 0, paymentChoice],
        });
      } else {
        await buildDepositTransaction({
          poolAddress: pool.poolAddress,
          amount,
          receiver: address,
        });

        hash = await writeContractAsync({
          address: pool.poolAddress as `0x${string}`,
          chainId: pool.chainId as any,
          abi: poolABI as any,
          functionName: "deposit",
          args: [amountBigInt, address as `0x${string}`],
        });
      }

      setDepositTxHash(hash);
      // Show the deposit immediately, tagged pending, so the modal can close
      // straight into a visible record rather than an unchanged page.
      addPendingTx({
        txHash: hash,
        chainId,
        poolAddress: pool.poolAddress,
        userAddress: address,
        type: pool.poolType === "LOCKED" ? "POSITION_CREATED" : "DEPOSIT",
        amount,
      });
      return hash;
    } catch (error) {
      console.error("Deposit failed:", error);
      throw error;
    }
  };

  const approveAndDeposit = async (amount: string) => {
    await approve(amount);
  };

  const reset = () => {
    setDepositTxHash(undefined);
    setApprovalTxHash(undefined);
  };

  // Extract shares from deposit receipt if available
  const shares = depositReceipt?.logs?.[0]?.topics?.[3]
    ? formatUnits(
        BigInt(depositReceipt.logs[0].topics[3]),
        pool?.assetDecimals || 18
      )
    : null;

  return {
    deposit,
    approve,
    approveAndDeposit,
    needsApproval,
    hasInsufficientBalance,
    exceedsMaxDeposit,
    poolNotAcceptingDeposits,
    getUserBalance,
    getMaxDepositAmount,
    reset,
    /** Set when this app cannot take a deposit for the pool's network. */
    depositUnavailableReason,
    refetchAllowance,
    refetchBalance,

    isApproving,
    isApprovalSuccess,
    isConfirming,
    isPending: false,
    isDepositing: isApproving || isConfirming || nonEvm.isDepositing,
    isSuccess: isNonEvm ? Boolean(nonEvm.reference) : isDepositSuccess,
    isLoading: isApproving || isConfirming || nonEvm.isDepositing,

    error: null,
    shares,
    // A Soroban hash and a Solana signature are not 0x-prefixed, but every consumer of
    // this treats it as an opaque reference to show and link, so the shape holds.
    transactionHash: (isNonEvm ? nonEvm.reference : depositTxHash) as `0x${string}` | undefined,
    approvalTxHash,
    balance: balance ? getUserBalance() : undefined, // Return undefined if balance not loaded
    balanceRaw: balance as bigint | undefined, // Raw balance data for checking if loaded
  };
}
