import "server-only";

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set.");
  return key;
}

export type PaystackInitResponse = {
  status: boolean;
  message: string;
  data?: { authorization_url: string; access_code: string; reference: string };
};

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitResponse> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
    cache: "no-store",
  });
  return res.json();
}

export type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    id: number;
    metadata: Record<string, unknown>;
  };
};

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });
  return res.json();
}

/** HMAC-SHA512 signature check for the /api/paystack/webhook route. */
export async function isValidPaystackSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false;
  const crypto = await import("node:crypto");
  const hash = crypto.createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  return hash === signatureHeader;
}

// --- Shared fulfillment (used by both the verify route and the webhook) ---
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function fulfillPaymentByReference(reference: string): Promise<{ ok: boolean; message: string }> {
  const admin = createSupabaseAdminClient();

  const { data: payment } = await admin.from("payments").select("*").eq("reference", reference).maybeSingle();
  if (!payment) return { ok: false, message: "Unknown payment reference." };

  // Idempotency: already fulfilled, nothing to do.
  if (payment.status === "success") return { ok: true, message: "Already verified." };

  const verification = await verifyTransaction(reference);
  const data = verification.data;
  if (!verification.status || !data || data.status !== "success") {
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id).eq("status", "pending");
    return { ok: false, message: "Payment was not successful." };
  }

  // Paranoid check: the amount Paystack confirms must match what we asked for.
  if (data.amount !== payment.amount_kobo) {
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return { ok: false, message: "Amount mismatch." };
  }

  const { error: updateError } = await admin
    .from("payments")
    .update({
      status: "success",
      channel: data.channel,
      paystack_transaction_id: String(data.id),
      verified_at: new Date().toISOString(),
    })
    .eq("id", payment.id)
    .eq("status", "pending"); // guards against double-processing races

  if (updateError) return { ok: false, message: updateError.message };

  if (payment.purpose === "document_template") {
    const values = (payment.metadata as Record<string, unknown>)?.values ?? {};
    await admin.from("document_purchases").insert({
      user_id: payment.user_id,
      template_id: payment.product_id,
      payment_id: payment.id,
      field_values: values,
    });
  }

  return { ok: true, message: "Payment verified." };
}
