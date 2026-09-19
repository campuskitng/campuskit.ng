"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CornerDownLeft, Search, X } from "lucide-react";

type Result = { id: string; label: string; group: string; hint: string; href: string };

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  // Debounced search against /api/search. Runs immediately (with q='') when
  // the overlay opens to populate the "Jump to a tool" default list too.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const handle = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => setResults(data.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [query, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/25 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search CampusKit"
        className="relative w-full max-w-xl overflow-hidden rounded-panel border border-hairline bg-surface shadow-note"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <Search className="h-[18px] w-[18px] shrink-0 text-muted" aria-hidden="true" />
          <label className="sr-only" htmlFor="site-search">
            Search tools, documents and opportunities
          </label>
          <input
            id="site-search"
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools, documents, opportunities"
            className="h-14 w-full bg-transparent text-body text-ink outline-none placeholder:text-muted/80"
            autoComplete="off"
          />
          {loading ? <span className="shrink-0 text-meta text-muted">Searching…</span> : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-control p-1.5 text-muted transition-colors hover:bg-brand-soft/60 hover:text-ink"
          >
            <X className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>

        {results.length > 0 ? (
          <ul className="max-h-[52vh] overflow-y-auto p-2">
            {!query.trim() && (
              <li className="px-3 pb-1 pt-2 text-meta font-semibold uppercase tracking-wider text-muted">
                Jump to a tool
              </li>
            )}
            {results.slice(0, 8).map((result) => (
              <li key={result.id}>
                <Link href={result.href} onClick={onClose} className="row-link group">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label font-medium text-ink">{result.label}</p>
                    <p className="truncate text-meta text-muted">{result.hint}</p>
                  </div>
                  <span className="shrink-0 text-meta text-muted">{result.group}</span>
                  <CornerDownLeft
                    className="h-4 w-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-label font-medium text-ink">Nothing matches “{query.trim()}”</p>
            <p className="mt-1 text-label text-muted">
              Try a course code, a document name, or browse{" "}
              <Link href="/tools" onClick={onClose} className="font-medium text-brand hover:underline">
                all tools
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
