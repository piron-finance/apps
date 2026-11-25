"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Account,
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc as stellarRpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import { findNetwork } from "@/lib/constants/networks";

/**
 * An account's balance of a Stellar asset contract, read by simulating `balance(id)`.
 *
 * The deposit panel's balance is an ERC20 read, so on a Stellar pool it always showed 0. A
 * Soroban read needs no key: simulation builds the call from a throwaway source and nothing
 * is signed or sent.
 *
 * A classic asset such as USDC refuses the read for an account with no trustline, which is
 * reported as `hasTrustline: false` with a zero balance, because that is what the investor
 * has to fix before they can hold any.
 */
export interface StellarAssetBalance {
  /** Display units. */
  balance: string;
  hasTrustline: boolean;
}

/** A valid but arbitrary account: simulation never checks its existence or balance. */
const READ_SOURCE = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

export function useStellarAssetBalance(
  pool?: { networkId?: string | null; assetAddress?: string; assetDecimals?: number },
  account?: string,
) {
  const network = findNetwork(pool?.networkId ?? undefined);
  const enabled = Boolean(network?.runtime === "stellar" && pool?.assetAddress && account);
  return useQuery<StellarAssetBalance>({
    queryKey: ["stellar-asset-balance", pool?.networkId, pool?.assetAddress, account],
    enabled,
    staleTime: 10_000,
    queryFn: async () => {
      const server = new stellarRpc.Server(network?.rpcUrl ?? "https://soroban-testnet.stellar.org");
      const passphrase = pool!.networkId === "stellar:pubnet" ? Networks.PUBLIC : Networks.TESTNET;
      const tx = new TransactionBuilder(new Account(READ_SOURCE, "0"), {
        fee: BASE_FEE,
        networkPassphrase: passphrase,
      })
        .addOperation(new Contract(pool!.assetAddress!).call("balance", nativeToScVal(account!, { type: "address" })))
        .setTimeout(30)
        .build();
      const sim = await server.simulateTransaction(tx);
      if (stellarRpc.Api.isSimulationError(sim)) {
        // The asset contract's "trustline entry is missing" (error #13).
        if (/#13\b|trustline/i.test(sim.error)) return { balance: "0", hasTrustline: false };
        throw new Error(sim.error);
      }
      const raw = stellarRpc.Api.isSimulationSuccess(sim) && sim.result?.retval ? scValToNative(sim.result.retval) : 0;
      return { balance: formatUnits(BigInt(String(raw)), pool!.assetDecimals ?? 7), hasTrustline: true };
    },
  });
}

/** Base units as an exact decimal string. */
function formatUnits(value: bigint, decimals: number): string {
  const digits = value.toString().padStart(decimals + 1, "0");
  const whole = digits.slice(0, digits.length - decimals);
  const fraction = digits.slice(digits.length - decimals).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}
