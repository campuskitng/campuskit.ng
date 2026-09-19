import { NextResponse } from "next/server";
import { fulfillPaymentByReference } from "@/lib/paystack";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Called from the client-side payment callback page. Never trusts the
 * redirect itself as proof of payment — it re-verifies with Paystack
 * server-side (see fulfillPaymentByReference) before unlocking anything.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "reference is required." }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const result = await fulfillPaymentByReference(reference);
  return NextResponse.json(result, { status: result.ok ? 200 : 402 });
}
