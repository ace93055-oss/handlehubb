import "server-only";
import Decimal from "decimal.js";
import { CryptoCurrency } from "@prisma/client";

const ids: Record<CryptoCurrency, string> = { BTC: "bitcoin", LTC: "litecoin", SOL: "solana", ETH: "ethereum" };

export async function getUsdRate(currency: CryptoCurrency) {
  const base = process.env.COINGECKO_API_BASE || "https://api.coingecko.com/api/v3";
  const headers: HeadersInit = { accept: "application/json" };
  if (process.env.COINGECKO_API_KEY) headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  const res = await fetch(`${base}/simple/price?ids=${ids[currency]}&vs_currencies=usd`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`Price provider failed (${res.status})`);
  const json = await res.json();
  const value = json?.[ids[currency]]?.usd;
  if (!value || Number(value) <= 0) throw new Error("Invalid price response");
  return new Decimal(value);
}
