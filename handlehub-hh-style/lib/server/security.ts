import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const buckets = new Map<string, { count: number; reset: number }>();

export function clientKey(req: NextRequest) {
  const direct = req.headers.get("x-real-ip");
  const forwarded = process.env.TRUST_PROXY === "true" ? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() : null;
  return forwarded || direct || "unknown";
}

export function rateLimit(req: NextRequest, limit = 30, windowMs = 60_000) {
  const key = `${clientKey(req)}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) { buckets.set(key, { count: 1, reset: now + windowMs }); return null; }
  bucket.count += 1;
  if (bucket.count > limit) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((bucket.reset - now) / 1000)) } });
  return null;
}

export function newCsrfToken() { return crypto.randomBytes(24).toString("base64url"); }

export function requireCsrf(req: NextRequest) {
  const cookie = req.cookies.get("hh_csrf")?.value;
  const header = req.headers.get("x-csrf-token");
  if (!cookie || !header || cookie.length !== header.length || !crypto.timingSafeEqual(Buffer.from(cookie), Buffer.from(header))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }
  return null;
}

export function sessionId(req: NextRequest) {
  return req.cookies.get("hh_session")?.value || crypto.randomUUID();
}
