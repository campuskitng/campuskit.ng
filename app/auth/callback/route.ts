import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/safe-redirect";

// Handles Supabase redirect-based flows that hand back a `code`: email
// signup confirmation, password-reset links, and Google OAuth. Whichever
// flow got the person here, `next` carries them back to what they were
// originally doing (see lib/safe-redirect.ts for why it's validated).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirect(searchParams.get("next"));

  if (code) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
