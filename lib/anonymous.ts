import "server-only";
import { cookies, headers } from "next/headers";
import { randomUUID, createHash } from "node:crypto";

const TOKEN_COOKIE = "ck_anon_token";

/**
 * A stable-but-anonymous fingerprint for rate limiting and report
 * correlation: hash(IP + a random per-browser cookie token). We never store
 * the raw IP — the hash can't be reversed to identify the sender, but the
 * same sender reliably produces the same fingerprint.
 */
export function getSenderFingerprint(): string {
  const store = cookies();
  let token = store.get(TOKEN_COOKIE)?.value;
  if (!token) {
    token = randomUUID();
    store.set(TOKEN_COOKIE, token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(`${ip}:${token}`).digest("hex");
}

export const MESSAGE_MAX_CHARS = 500;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Simple sliding-window limits, enforced with a count query — good enough at
// CampusKit's scale without adding infra (e.g. Redis).
export const SEND_LIMIT_PER_RECIPIENT_PER_HOUR = 10;
export const SEND_LIMIT_TOTAL_PER_HOUR = 30;
export const REPORT_LIMIT_PER_HOUR = 15;
