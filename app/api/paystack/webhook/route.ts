import { NextResponse } from "next/server";
import { isValidPaystackSignature, fulfillPaymentByReference } from "@/lib/paystack";

/**
 * Backstop for the client-driven /api/paystack/verify call — covers the
 * case where the user closes the tab right after paying. Configure this
 * URL in the Paystack dashboard (Settings → API Keys & Webhooks).
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!(await isValidPaystackSignature(rawBody, signature))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event === "charge.success" && event.data?.reference) {
    await fulfillPaymentByReference(event.data.reference);
  }

  return NextResponse.json({ received: true });
}
