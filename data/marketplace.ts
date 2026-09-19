// The catalogue itself now comes from Supabase (lib/supabase/queries.ts);
// this file only keeps small formatting/link helpers that both the admin
// forms and the public pages import.

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/**
 * Builds a wa.me link from whatever an admin entered for a listing: a bare
 * phone number, a number with punctuation/spaces, or an already-complete
 * wa.me/https://wa.me link. Returns null for empty/unusable input so
 * call sites can hide the button rather than link to nothing.
 */
export function buildWhatsAppLink(contact: string | null | undefined, itemTitle: string): string | null {
  const trimmed = contact?.trim();
  if (!trimmed) return null;

  const message = encodeURIComponent(`Hi, I saw "${itemTitle}" on CampusKit. Is it still available?`);

  if (/^https?:\/\//i.test(trimmed)) {
    // Already a full link — respect it, but add the prefilled message only
    // if the admin didn't already put one in the URL.
    return trimmed.includes("text=") ? trimmed : `${trimmed}${trimmed.includes("?") ? "&" : "?"}text=${message}`;
  }

  const digits = trimmed.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${message}`;
}
