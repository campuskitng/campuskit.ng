"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  Loader2,
  Lock,
  Pencil,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DocumentPreview } from "@/components/DocumentPreview";
import { SaveButton } from "@/components/SaveButton";
import { documentGroups } from "@/data/documents";
import { formatNaira } from "@/data/marketplace";
import type { DocumentTemplate } from "@/lib/types";

type Step = 1 | 2 | 3 | 4 | 5;
type PaymentState = "idle" | "processing" | "paid" | "error";

const PENDING_KEY = "ck_pending_document";

const stepOrder: Step[] = [1, 2, 3, 4, 5];

/** Keeps step maths inside the Step union instead of widening to number. */
function previousStep(step: Step): Step {
  const position = stepOrder.indexOf(step);
  return stepOrder[Math.max(position - 1, 0)];
}

const stepLabels: Record<Step, string> = {
  1: "Document type",
  2: "Details",
  3: "Review",
  4: "Payment",
  5: "Download",
};

export function DocumentGenerator({
  templates: documentTemplates,
  initialTypeId,
  paid,
  isAuthenticated = false,
  savedTemplateIds = [],
}: {
  templates: DocumentTemplate[];
  initialTypeId?: string;
  paid?: boolean;
  isAuthenticated?: boolean;
  savedTemplateIds?: string[];
}) {
  const initial = documentTemplates.find((template) => template.id === initialTypeId);

  const [step, setStep] = useState<Step>(paid && initial ? 4 : initial ? 2 : 1);
  const [selected, setSelected] = useState<DocumentTemplate | null>(initial ?? null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState<PaymentState>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const isFree = !selected?.price || selected.price <= 0;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return documentTemplates;
    return documentTemplates.filter(
      (template) =>
        template.name.toLowerCase().includes(term) ||
        template.useCase.toLowerCase().includes(term),
    );
  }, [query]);

  function chooseTemplate(template: DocumentTemplate) {
    setSelected(template);
    setValues({});
    setPayment("idle");
    setStep(2);
  }

  function setValue(id: string, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  // Restore in-progress values after an /api/paystack/initialize -> login
  // redirect (unauthenticated) round trip, so the person doesn't retype
  // everything after signing in.
  useEffect(() => {
    if (!initial) return;
    try {
      const raw = window.sessionStorage.getItem(PENDING_KEY);
      if (!raw) return;
      const pending = JSON.parse(raw) as { templateId: string; values: Record<string, string> };
      if (pending.templateId === initial.id) {
        setValues(pending.values ?? {});
        window.sessionStorage.removeItem(PENDING_KEY);
      }
    } catch {
      // Malformed/absent — ignore, the person just fills the form again.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requiredFields = selected?.fields?.filter((field) => !field.optional) ?? [];
  const missing = requiredFields.filter((field) => !values[field.id]?.trim());

  async function startPayment() {
    if (!selected) return;
    setPayment("processing");
    setPaymentError(null);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selected.id, values }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.sessionStorage.setItem(PENDING_KEY, JSON.stringify({ templateId: selected.id, values }));
          window.location.assign(`/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }
        throw new Error(data.error || "Could not start payment.");
      }
      window.sessionStorage.setItem(PENDING_KEY, JSON.stringify({ templateId: selected.id, values, reference: data.reference }));
      window.location.assign(data.authorizationUrl);
    } catch (err) {
      setPayment("error");
      setPaymentError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function downloadDocument() {
    if (!selected) return;
    setDownloading(true);
    setPaymentError(null);
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selected.id, values }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not generate the document.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selected.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setPayment("paid");
      setStep(5);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="shell pb-16 pt-8 sm:pt-10">
      <header className="max-w-[48ch]">
        <h1 className="text-display font-semibold tracking-tight text-ink">Document generator</h1>
        <p className="mt-2 text-body text-muted">
          Pick a document, answer a short set of questions, and get a formatted letter you can print
          or submit.
        </p>
      </header>

      <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-label">
        {stepOrder.map((value, position) => {
          const state = value === step ? "current" : value < step ? "done" : "todo";
          return (
            <li key={value} className="flex items-center gap-2">
              <span
                className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                  state === "current"
                    ? "bg-brand text-white"
                    : state === "done"
                      ? "bg-brand-soft text-brand-700"
                      : "border border-hairline bg-surface text-muted"
                }`}
              >
                {state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : value}
              </span>
              <span className={state === "todo" ? "text-muted" : "font-medium text-ink"}>
                {stepLabels[value]}
              </span>
              {position < 4 ? (
                <span aria-hidden="true" className="mx-1 hidden h-px w-6 bg-hairline sm:block" />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        {step === 1 ? (
          <section aria-label="Choose a document type">
            <div className="relative max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <label className="sr-only" htmlFor="doc-filter">
                Filter document types
              </label>
              <input
                id="doc-filter"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter 22 document types"
                className="field-input pl-10"
              />
            </div>

            <div className="mt-6 space-y-8">
              {documentGroups.map((group) => {
                const items = filtered.filter((template) => template.group === group);
                if (items.length === 0) return null;

                return (
                  <div key={group}>
                    <h2 className="border-b border-hairline pb-2 text-label font-semibold text-ink">
                      {group}
                    </h2>
                    <ul className="mt-1 divide-y divide-hairline">
                      {items.map((template) => (
                        <li key={template.id}>
                          <button
                            type="button"
                            onClick={() => chooseTemplate(template)}
                            className="flex min-h-[60px] w-full items-center gap-4 py-3 text-left transition-colors
                              hover:bg-surface/80 sm:px-2"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block text-body font-medium text-ink">
                                {template.name}
                              </span>
                              <span className="mt-0.5 block text-label text-muted">
                                {template.useCase}
                              </span>
                            </span>
                            <span className="shrink-0 text-label text-muted">
                              {template.price ? formatNaira(template.price) : "—"}
                            </span>
                            {!template.fields ? (
                              <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-meta text-muted">
                                Form soon
                              </span>
                            ) : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {filtered.length === 0 ? (
                <p className="py-10 text-center text-label text-muted">
                  No document matches “{query.trim()}”. Try a shorter word, like “letter”.
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {step >= 2 && selected ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-12">
            <section aria-label={stepLabels[step]}>
              <button
                type="button"
                onClick={() => setStep(previousStep(step))}
                className="mb-5 inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </button>

              <h2 className="text-section font-semibold text-ink">{selected.name}</h2>
              <p className="mt-1 text-label text-muted">{selected.useCase}</p>
              <div className="mt-3">
                <SaveButton
                  itemType="document_template"
                  itemId={selected.id}
                  initialSaved={savedTemplateIds.includes(selected.id)}
                  isAuthenticated={isAuthenticated}
                />
              </div>

              {step === 2 ? (
                selected.fields ? (
                  <form
                    className="mt-6 space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setStep(3);
                    }}
                  >
                    {selected.fields.map((field) => (
                      <div key={field.id}>
                        <label className="field-label" htmlFor={field.id}>
                          {field.label}
                          {field.optional ? (
                            <span className="ml-1 font-normal text-muted">(optional)</span>
                          ) : null}
                        </label>

                        {field.type === "textarea" ? (
                          <textarea
                            id={field.id}
                            rows={3}
                            value={values[field.id] ?? ""}
                            onChange={(event) => setValue(field.id, event.target.value)}
                            placeholder={field.placeholder}
                            className="field-input resize-y"
                          />
                        ) : field.type === "select" ? (
                          <select
                            id={field.id}
                            value={values[field.id] ?? ""}
                            onChange={(event) => setValue(field.id, event.target.value)}
                            className="field-input"
                          >
                            <option value="">Select one</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={field.id}
                            type={field.type === "date" ? "date" : "text"}
                            value={values[field.id] ?? ""}
                            onChange={(event) => setValue(field.id, event.target.value)}
                            placeholder={field.placeholder}
                            className="field-input"
                          />
                        )}
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button type="submit" disabled={missing.length > 0}>
                        Continue to review
                      </Button>
                      {missing.length > 0 ? (
                        <p className="text-label text-muted">
                          {missing.length} field{missing.length > 1 ? "s" : ""} left
                        </p>
                      ) : null}
                    </div>
                  </form>
                ) : (
                  <div className="mt-6 rounded-card border border-hairline bg-surface p-5">
                    <p className="text-body font-medium text-ink">This form is not open yet.</p>
                    <p className="mt-1 max-w-[46ch] text-label text-muted">
                      {selected.name} is in the catalogue, but its questions are still being
                      written. Pick another document type in the meantime.
                    </p>
                    <Button variant="secondary" className="mt-4" onClick={() => setStep(1)}>
                      Choose another document
                    </Button>
                  </div>
                )
              ) : null}

              {step === 3 ? (
                <div className="mt-6 rounded-card border border-hairline bg-surface p-5">
                  <p className="text-body font-medium text-ink">Check the details</p>
                  <p className="mt-1 text-label text-muted">
                    The preview beside this is exactly what gets formatted into the final document.
                  </p>
                  <dl className="mt-4 divide-y divide-hairline text-label">
                    {selected.fields?.map((field) => (
                      <div key={field.id} className="flex gap-4 py-2">
                        <dt className="w-2/5 shrink-0 text-muted">{field.label}</dt>
                        <dd className="min-w-0 flex-1 text-ink">
                          {values[field.id]?.trim() || <span className="text-muted">Not set</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button onClick={() => setStep(4)}>Continue to payment</Button>
                    <Button variant="secondary" onClick={() => setStep(2)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Edit details
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="mt-6 max-w-md rounded-card border border-hairline bg-surface p-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-body font-medium text-ink">{selected.name}</p>
                    <p className="text-title font-semibold text-ink">
                      {isFree ? "Free" : formatNaira(selected.price ?? 0)}
                    </p>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-label text-muted">
                    <li>Formatted PDF, ready to print</li>
                    {!isFree ? <li>Redownload anytime from your account</li> : null}
                  </ul>

                  <Button
                    className="mt-5 w-full"
                    onClick={isFree ? downloadDocument : startPayment}
                    disabled={payment === "processing" || downloading}
                  >
                    {payment === "processing" || downloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {isFree ? "Generating" : "Redirecting to Paystack"}
                      </>
                    ) : isFree ? (
                      <>
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Generate document
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        Pay {formatNaira(selected.price ?? 0)} with Paystack
                      </>
                    )}
                  </Button>

                  {paymentError ? (
                    <p role="alert" className="mt-3 text-label text-[#B42318]">
                      {paymentError}
                    </p>
                  ) : (
                    <p className="mt-3 text-meta text-muted">
                      {isFree
                        ? "No payment needed for this document."
                        : "You'll be redirected to Paystack to complete payment securely, then brought back here."}
                    </p>
                  )}
                </div>
              ) : null}

              {step === 5 ? (
                <div className="mt-6 max-w-md rounded-card border border-success/30 bg-success/5 p-5">
                  <p className="flex items-center gap-2 text-body font-medium text-ink">
                    <Check className="h-4 w-4 text-success" aria-hidden="true" />
                    {selected.name} is ready
                  </p>
                  <p className="mt-1 text-label text-muted">
                    Your download should have started. Didn&apos;t work?
                  </p>
                  <Button className="mt-4 w-full" onClick={downloadDocument} disabled={downloading}>
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Download className="h-4 w-4" aria-hidden="true" />
                    )}
                    Download PDF again
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setSelected(null);
                      setValues({});
                      setPayment("idle");
                    }}
                    className="mt-4 text-label font-medium text-brand hover:text-brand-700"
                  >
                    Start another document
                  </button>
                </div>
              ) : null}
            </section>

            <aside aria-label="Document preview" className="lg:sticky lg:top-20 lg:self-start">
              <p className="mb-2 text-meta font-semibold uppercase tracking-wider text-muted">
                Preview
              </p>
              <DocumentPreview template={selected} values={values} />
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
