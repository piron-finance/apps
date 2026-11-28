import { TransactionBuilder, rpc as stellarRpc } from "@stellar/stellar-sdk";
import type { StellarWallet } from "./StellarWalletContext";

/**
 * Sign a backend-built Stellar envelope with Freighter, submit it, and wait for it to land.
 *
 * Every Stellar action in the app goes through here: deposits, exits, withdrawals, coupon
 * claims, and the test-USDC swap. It resolves only once the network reports SUCCESS, so a
 * caller never tells an investor that money moved when it did not.
 *
 * Polled every 2.5s for up to a minute. Stellar closes a ledger about every five seconds, so
 * polling faster spends a public node's rate limit to learn nothing.
 */
export async function signAndSubmitStellar(
  wallet: Pick<StellarWallet, "signXdr">,
  tx: { xdr: string; networkPassphrase: string; validUntilTime?: number; rpcUrl?: string },
  what: string,
): Promise<string> {
  // A prepared Soroban envelope carries time bounds of a few minutes, and a stale one is
  // refused in a way that reads like a contract error.
  if (tx.validUntilTime && tx.validUntilTime * 1000 < Date.now()) {
    throw new Error("This quote expired before it was signed. Try again.");
  }
  const signedXdr = await wallet.signXdr(tx.xdr, tx.networkPassphrase);
  const server = new stellarRpc.Server(tx.rpcUrl ?? "https://soroban-testnet.stellar.org");
  const sent = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, tx.networkPassphrase));
  if (sent.status === "ERROR") {
    throw new Error(`The network rejected the ${what}: ${JSON.stringify(sent.errorResult)}`);
  }
  let result = await server.getTransaction(sent.hash);
  for (let i = 0; i < 24 && result.status === "NOT_FOUND"; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    result = await server.getTransaction(sent.hash);
  }
  if (result.status !== "SUCCESS") {
    throw new Error(`The ${what} did not complete: ${result.status}`);
  }
  return sent.hash;
}
