/**
 * Every auth flow (password login, signup confirmation, Google OAuth,
 * password reset) threads a `next`/`redirectTo` path through so the person
 * lands back on the document/purchase/save action they started, instead of
 * the homepage. That path comes from a query string, so it must be
 * validated before use — otherwise it's an open-redirect vector
 * (`?redirectTo=https://evil.example.com` or `//evil.example.com`).
 *
 * A safe value is a same-site, relative path: starts with exactly one "/"
 * and never "//" (protocol-relative) or a scheme.
 */
export function getSafeRedirect(path: string | null | undefined, fallback = "/"): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("://")) return fallback;
  return path;
}
