import "server-only";
import Decimal from "decimal.js";
import { CryptoCurrency, InvoiceStatus } from "@prisma/client";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { Connection, PublicKey } from "@solana/web3.js";

export type ObservedPayment = { hash: string; amount: Decimal; confirmations: number; timestamp?: Date; raw?: unknown };

async function btc(address: string): Promise<ObservedPayment[]> {
  const base = process.env.BTC_API_BASE || "https://blockstream.info/api";
  const res = await fetch(`${base}/address/${address}/txs`, { cache: "no-store" });
  if (!res.ok) throw new Error(`BTC monitor failed (${res.status})`);
  const txs = await res.json();
  return txs.flatMap((tx: any) => {
    const sats = (tx.vout || []).filter((v: any) => v.scriptpubkey_address === address).reduce((n: number, v: any) => n + Number(v.value || 0), 0);
    if (!sats) return [];
    return [{ hash: tx.txid, amount: new Decimal(sats).div(1e8), confirmations: tx.status?.confirmed ? 1 : 0, timestamp: tx.status?.block_time ? new Date(tx.status.block_time * 1000) : undefined, raw: tx }];
  });
}

async function ltc(address: string): Promise<ObservedPayment[]> {
  const base = process.env.LTC_BLOCKCYPHER_BASE || "https://api.blockcypher.com/v1/ltc/main";
  const token = process.env.LTC_BLOCKCYPHER_TOKEN ? `?token=${encodeURIComponent(process.env.LTC_BLOCKCYPHER_TOKEN)}` : "";
  const res = await fetch(`${base}/addrs/${address}/full${token}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`LTC monitor failed (${res.status})`);
  const data = await res.json();
  return (data.txs || []).flatMap((tx: any) => {
    const litoshi = (tx.outputs || []).filter((o: any) => (o.addresses || []).includes(address)).reduce((n: number, o: any) => n + Number(o.value || 0), 0);
    if (!litoshi) return [];
    return [{ hash: tx.hash, amount: new Decimal(litoshi).div(1e8), confirmations: Number(tx.confirmations || 0), timestamp: tx.received ? new Date(tx.received) : undefined, raw: tx }];
  });
}

async function eth(address: string, since?: Date): Promise<ObservedPayment[]> {
  if (!process.env.ETH_RPC_URL) throw new Error("ETH_RPC_URL is not configured");
  const client = createPublicClient({ chain: mainnet, transport: http(process.env.ETH_RPC_URL) });
  const latest = await client.getBlockNumber();
  const ageSeconds = since ? Math.max(0, Math.ceil((Date.now() - since.getTime()) / 1000)) : 1800;
  const blocksBack = BigInt(Math.min(240, Math.max(20, Math.ceil(ageSeconds / 12) + 12)));
  const from = latest > blocksBack ? latest - blocksBack : 0n;
  const logs = await client.getBlock({ blockNumber: latest, includeTransactions: true });
  const found: ObservedPayment[] = [];
  for (let n = latest; n >= from && found.length < 20; n--) {
    const block = n === latest ? logs : await client.getBlock({ blockNumber: n, includeTransactions: true });
    for (const tx of block.transactions as any[]) {
      if (typeof tx !== "string" && tx.to?.toLowerCase() === address.toLowerCase() && tx.value > 0n) {
        found.push({ hash: tx.hash, amount: new Decimal(tx.value.toString()).div(new Decimal(10).pow(18)), confirmations: Number(latest - n + 1n), timestamp: new Date(Number(block.timestamp) * 1000), raw: { blockNumber: n.toString() } });
      }
    }
  }
  return found;
}

async function sol(address: string): Promise<ObservedPayment[]> {
  if (!process.env.SOLANA_RPC_URL) throw new Error("SOLANA_RPC_URL is not configured");
  const conn = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
  const key = new PublicKey(address);
  const sigs = await conn.getSignaturesForAddress(key, { limit: 40 });
  const out: ObservedPayment[] = [];
  for (const sig of sigs) {
    const tx = await conn.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0, commitment: "confirmed" });
    if (!tx?.meta) continue;
    const accounts = tx.transaction.message.accountKeys.map(k => k.pubkey.toBase58());
    const idx = accounts.indexOf(address);
    if (idx < 0) continue;
    const delta = (tx.meta.postBalances[idx] ?? 0) - (tx.meta.preBalances[idx] ?? 0);
    if (delta > 0) out.push({ hash: sig.signature, amount: new Decimal(delta).div(1e9), confirmations: sig.confirmationStatus === "finalized" ? 2 : 1, timestamp: sig.blockTime ? new Date(sig.blockTime * 1000) : undefined, raw: { slot: sig.slot, confirmationStatus: sig.confirmationStatus } });
  }
  return out;
}

export async function observe(currency: CryptoCurrency, address: string, since?: Date) {
  if (currency === "BTC") return btc(address);
  if (currency === "LTC") return ltc(address);
  if (currency === "ETH") return eth(address, since);
  return sol(address);
}

export function classify(required: Decimal, detected: Decimal, confirmations: number, requiredConfirmations: number): InvoiceStatus {
  const atomicTolerance = new Decimal(0);
  if (detected.lt(required.minus(atomicTolerance))) return "UNDERPAID";
  if (confirmations === 0) return "DETECTED";
  if (detected.gt(required.plus(atomicTolerance))) return confirmations >= requiredConfirmations ? "OVERPAID" : "CONFIRMING";
  return confirmations >= requiredConfirmations ? "PAID" : "CONFIRMING";
}

export function confirmationsNeeded(currency: CryptoCurrency) {
  return Number(process.env[`${currency}_CONFIRMATIONS`] || ({ BTC: 1, LTC: 2, ETH: 12, SOL: 1 } as const)[currency]);
}
