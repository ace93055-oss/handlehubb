import "server-only";
import Decimal from "decimal.js";
import crypto from "node:crypto";
import { CryptoCurrency } from "@prisma/client";
import { cryptoConfig } from "@/lib/constants";
import { getUsdRate } from "./prices";

export async function priceInvoice(fiatUsd: Decimal, currency: CryptoCurrency) {
  const rate = await getUsdRate(currency);
  const cfg = cryptoConfig[currency];
  const base = fiatUsd.div(rate);
  const fingerprintUnits = BigInt((crypto.randomBytes(2).readUInt16BE(0) % 97) + 1);
  const atomic = new Decimal(10).pow(cfg.decimals);
  const amount = base.mul(atomic).ceil().plus(fingerprintUnits.toString()).div(atomic);
  return { rate, baseAmount: base, amount: amount.toDecimalPlaces(cfg.decimals, Decimal.ROUND_UP) };
}

export function destination(currency: CryptoCurrency) {
  const env = cryptoConfig[currency].env;
  const value = process.env[env];
  if (!value) throw new Error(`Missing ${env}`);
  return value;
}

export function publicInvoiceId() {
  return `HH-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
}
