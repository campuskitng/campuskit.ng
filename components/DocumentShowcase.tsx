"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { DocumentPreview } from "@/components/DocumentPreview";
import { demoValues } from "@/data/documents";
import type { DocumentTemplate } from "@/lib/types";

export function DocumentShowcase({ templates }: { templates: DocumentTemplate[] }) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const selected = templates.find((template) => template.id === selectedId) ?? templates[0];

  return (
    <section aria-labelledby="documents-heading" className="shell pt-14 sm:pt-16">
      <div className="max-w-[46ch]">
        <h2 id="documents-heading" className="text-section font-semibold text-ink">
          Documents, without the blank page.
        </h2>
        <p className="mt-1.5 text-body text-muted">
          Choose what you need, fill in a few details, and generate a properly formatted document.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-10">
        <div>
          <ul
            role="listbox"
            aria-label="Document type"
            className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface"
          >
            {templates.map((template) => {
              const isSelected = template.id === selected.id;
              return (
                <li key={template.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(template.id)}
                    className={`flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? "bg-brand-soft/70"
                        : "hover:bg-canvas active:bg-brand-soft/40"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-label font-medium ${
                          isSelected ? "text-brand-700" : "text-ink"
                        }`}
                      >
                        {template.name}
                      </span>
                      <span className="mt-0.5 block truncate text-meta text-muted">
                        {template.useCase}
                      </span>
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 ${isSelected ? "text-brand" : "text-muted"}`}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              );
            })}
            <li>
              <Link
                href="/documents"
                className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-3 text-label
                  font-medium text-brand transition-colors hover:bg-brand-soft/50"
              >
                More documents
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          </ul>

          <p className="mt-3 px-1 text-meta text-muted">
            22 document types available. Preview is free; you pay before download.
          </p>
        </div>

        <div aria-live="polite">
          <DocumentPreview template={selected} values={demoValues} />
          <Link
            href={`/documents?type=${selected.id}`}
            className="group mt-4 inline-flex items-center gap-1.5 text-label font-medium text-brand hover:text-brand-700"
          >
            Fill in a {selected.name.toLowerCase()}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
