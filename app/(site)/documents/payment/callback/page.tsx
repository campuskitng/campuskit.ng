"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";

const PENDING_KEY = "ck_pending_document";

type Status = "verifying" | "generating" | "done" | "error";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reference = params.get("reference") ?? params.get("trxref");
    if (!reference) {
      setStatus("error");
      setError("Missing payment reference.");
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const verifyRes = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference!)}`);
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.ok) {
          throw new Error(verifyData.message || "Payment could not be verified.");
        }
        if (cancelled) return;
        setStatus("generating");

        const raw = window.sessionStorage.getItem(PENDING_KEY);
        const pending = raw ? (JSON.parse(raw) as { templateId: string; values: Record<string, string> }) : null;
        if (!pending) {
          // Verified fine, but this browser lost the in-progress form
          // (different tab/device, or storage cleared). Send them back to
          // fetch it from their account instead of failing hard.
          setStatus("done");
          window.sessionStorage.removeItem(PENDING_KEY);
          router.replace(`/account/documents`);
          return;
        }

        const genRes = await fetch("/api/documents/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId: pending.templateId, values: pending.values }),
        });
        if (!genRes.ok) {
          const data = await genRes.json().catch(() => ({}));
          throw new Error(data.error || "Payment succeeded, but the document could not be generated. Try downloading it again from your account.");
        }
        const blob = await genRes.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${pending.templateId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        window.sessionStorage.removeItem(PENDING_KEY);

        if (cancelled) return;
        setStatus("done");
        setTimeout(() => {
          router.replace(`/documents?type=${encodeURIComponent(pending.templateId)}&paid=1`);
        }, 1200);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="shell flex min-h-[60vh] max-w-sm flex-col items-center justify-center pb-16 pt-8 text-center">
      {status === "error" ? (
        <>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#B42318]/10 text-[#B42318]">
            <X className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-title font-semibold text-ink">Payment not confirmed</p>
          <p className="mt-1 text-label text-muted">{error}</p>
          <ButtonLink href="/documents" className="mt-5">
            Back to documents
          </ButtonLink>
        </>
      ) : status === "done" ? (
        <>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-success/10 text-success">
            <Check className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-title font-semibold text-ink">Payment confirmed</p>
          <p className="mt-1 text-label text-muted">Your document is downloading…</p>
        </>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden="true" />
          <p className="mt-4 text-title font-semibold text-ink">
            {status === "generating" ? "Preparing your document…" : "Confirming your payment…"}
          </p>
          <p className="mt-1 text-label text-muted">Please don&apos;t close this tab.</p>
        </>
      )}
    </div>
  );
}
