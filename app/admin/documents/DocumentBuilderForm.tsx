"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  List as ListIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DocumentPreview } from "@/components/DocumentPreview";
import { createDocumentTemplateAction, updateDocumentTemplateAction } from "@/lib/admin-actions";
import {
  emptyDocumentLayout,
  SUGGESTED_DOCUMENT_FIELDS,
  type DocumentBlock,
  type DocumentField,
  type DocumentLayout,
  type DocumentTemplate,
} from "@/lib/types";

const groups: DocumentTemplate["group"][] = ["Academic", "Administrative", "Financial", "Career"];
const statuses = ["draft", "published"];

function slugifyFieldId(label: string): string {
  const words = label
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return `field${Date.now().toString(36).slice(-4)}`;
  return words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join("");
}

type Existing = {
  id: string;
  name: string;
  use_case: string;
  doc_group: DocumentTemplate["group"];
  price: number;
  status: string;
  fields: DocumentField[] | null;
  layout: DocumentLayout | null;
};

/**
 * The admin never edits raw JSON: fields and blocks are built through this
 * UI, then serialized into hidden inputs right before submit. Reuses
 * DocumentPreview (the same component students see) fed an empty `values`
 * object, so field tokens render as `[Field Label]` placeholders — this is
 * genuinely the same renderer, not a second one to keep in sync.
 */
export function DocumentBuilderForm({ existing }: { existing?: Existing }) {
  const router = useRouter();
  const [name, setName] = useState(existing?.name ?? "");
  const [useCase, setUseCase] = useState(existing?.use_case ?? "");
  const [group, setGroup] = useState<DocumentTemplate["group"]>(existing?.doc_group ?? "Administrative");
  const [price, setPrice] = useState(existing?.price ?? 0);
  const [status, setStatus] = useState(existing?.status ?? "draft");
  const [fields, setFields] = useState<DocumentField[]>(existing?.fields ?? []);
  const [layout, setLayout] = useState<DocumentLayout>(existing?.layout ?? emptyDocumentLayout());
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  function addField(label: string, type: DocumentField["type"] = "text") {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = slugifyFieldId(trimmed);
    if (fields.some((f) => f.id === id)) return; // already added
    setFields((prev) => [...prev, { id, label: trimmed, type }]);
    setNewFieldLabel("");
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function updateBlock(index: number, patch: Partial<DocumentBlock>) {
    setLayout((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as DocumentBlock) : b)),
    }));
  }

  function addBlock(type: DocumentBlock["type"]) {
    const block: DocumentBlock =
      type === "heading"
        ? { type: "heading", text: "", size: "md", align: "left", underline: false }
        : type === "paragraph"
          ? { type: "paragraph", text: "", align: "left" }
          : type === "list"
            ? { type: "list", style: "bullet", items: [""] }
            : { type: "spacer", size: "md" };
    setLayout((prev) => ({ ...prev, blocks: [...prev.blocks, block] }));
  }

  function removeBlock(index: number) {
    setLayout((prev) => ({ ...prev, blocks: prev.blocks.filter((_, i) => i !== index) }));
  }

  function moveBlock(index: number, dir: -1 | 1) {
    setLayout((prev) => {
      const next = [...prev.blocks];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, blocks: next };
    });
  }

  /** Inserts {{fieldId}} at the current cursor position in a block's textarea. */
  function insertFieldToken(index: number, fieldId: string, currentText: string) {
    const el = textareaRefs.current[index];
    const token = `{{${fieldId}}}`;
    if (!el) {
      updateBlock(index, { text: `${currentText}${token}` } as Partial<DocumentBlock>);
      return;
    }
    const start = el.selectionStart ?? currentText.length;
    const end = el.selectionEnd ?? currentText.length;
    const next = `${currentText.slice(0, start)}${token}${currentText.slice(end)}`;
    updateBlock(index, { text: next } as Partial<DocumentBlock>);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + token.length;
    });
  }

  const previewTemplate: DocumentTemplate = {
    id: existing?.id ?? "preview",
    name: name || "Untitled document",
    useCase: useCase,
    group,
    fields,
    layout,
  };

  async function handleSubmit() {
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("use_case", useCase);
    formData.set("doc_group", group);
    formData.set("price", String(price));
    formData.set("status", status);
    formData.set("fields", JSON.stringify(fields));
    formData.set("layout", JSON.stringify(layout));

    const res = existing
      ? await updateDocumentTemplateAction(existing.id, formData)
      : await createDocumentTemplateAction(formData);

    setPending(false);
    if (res?.error) setError(res.error);
    else router.push("/admin/documents");
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        {/* Basics */}
        <div className="grid gap-3 rounded-card border border-hairline bg-surface p-4">
          <div>
            <label className="field-label" htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="field-input" placeholder="Bank Verification Letter" />
          </div>
          <div>
            <label className="field-label" htmlFor="use_case">Use case</label>
            <input id="use_case" value={useCase} onChange={(e) => setUseCase(e.target.value)} className="field-input" placeholder="Opening a student account" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="field-label" htmlFor="doc_group">Group</label>
              <select id="doc_group" value={group} onChange={(e) => setGroup(e.target.value as DocumentTemplate["group"])} className="field-input">
                {groups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="price">Price (₦, 0 = free)</label>
              <input id="price" type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="status">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="field-input">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="rounded-card border border-hairline bg-surface p-4">
          <h3 className="text-title font-semibold text-ink">Fields</h3>
          <p className="mt-1 text-meta text-muted">What the student fills in. Never pre-filled from their CampusKit profile.</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUGGESTED_DOCUMENT_FIELDS.filter((s) => !fields.some((f) => f.label === s.label)).map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => addField(s.label, s.type)}
                className="rounded-full border border-hairline px-3 py-1 text-meta text-muted transition-colors hover:border-brand/40 hover:text-ink"
              >
                + {s.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addField(newFieldLabel);
                }
              }}
              placeholder="Custom field label…"
              className="field-input"
            />
            <Button type="button" variant="secondary" onClick={() => addField(newFieldLabel)}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add
            </Button>
          </div>

          {fields.length > 0 ? (
            <ul className="mt-3 divide-y divide-hairline">
              {fields.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2">
                  <span className="text-label text-ink">{f.label} <span className="text-meta text-muted">({f.id})</span></span>
                  <button type="button" onClick={() => removeField(f.id)} aria-label={`Remove ${f.label}`} className="text-muted hover:text-[#B42318]">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-label text-muted">No fields yet — add some above, then insert them into your blocks below.</p>
          )}
        </div>

        {/* Layout options */}
        <div className="rounded-card border border-hairline bg-surface p-4">
          <h3 className="text-title font-semibold text-ink">Layout</h3>
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-2 text-label text-ink">
              <input type="checkbox" checked={layout.showDateLine} onChange={(e) => setLayout((p) => ({ ...p, showDateLine: e.target.checked }))} />
              Show today&apos;s date
            </label>

            <div>
              <label className="flex items-center gap-2 text-label text-ink">
                <input
                  type="checkbox"
                  checked={!!layout.header?.show}
                  onChange={(e) => setLayout((p) => ({ ...p, header: e.target.checked ? { show: true, institutionName: p.header?.institutionName ?? "CampusKit" } : null }))}
                />
                Header / institution name
              </label>
              {layout.header?.show ? (
                <input
                  value={layout.header.institutionName}
                  onChange={(e) => setLayout((p) => ({ ...p, header: { show: true, institutionName: e.target.value } }))}
                  className="field-input mt-2"
                  placeholder="University of Benin"
                />
              ) : null}
            </div>

            <div>
              <label className="flex items-center gap-2 text-label text-ink">
                <input
                  type="checkbox"
                  checked={!!layout.addressBlock?.show}
                  onChange={(e) => setLayout((p) => ({ ...p, addressBlock: e.target.checked ? { show: true, align: "right", text: p.addressBlock?.text ?? "" } : null }))}
                />
                Address block
              </label>
              {layout.addressBlock?.show ? (
                <div className="mt-2 space-y-2">
                  <select
                    value={layout.addressBlock.align}
                    onChange={(e) => setLayout((p) => ({ ...p, addressBlock: { ...p.addressBlock!, align: e.target.value as "left" | "right" } }))}
                    className="field-input"
                  >
                    <option value="left">Aligned left</option>
                    <option value="right">Aligned right</option>
                  </select>
                  <textarea
                    value={layout.addressBlock.text}
                    onChange={(e) => setLayout((p) => ({ ...p, addressBlock: { ...p.addressBlock!, text: e.target.value } }))}
                    rows={2}
                    className="field-input"
                    placeholder={"The Registrar\nUniversity of Benin"}
                  />
                </div>
              ) : null}
            </div>

            <div>
              <label className="flex items-center gap-2 text-label text-ink">
                <input
                  type="checkbox"
                  checked={!!layout.signature?.show}
                  onChange={(e) => setLayout((p) => ({ ...p, signature: e.target.checked ? { show: true, placement: p.signature?.placement ?? "left", label: p.signature?.label ?? "Applicant" } : null }))}
                />
                Signature block
              </label>
              {layout.signature?.show ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select
                    value={layout.signature.placement}
                    onChange={(e) => setLayout((p) => ({ ...p, signature: { ...p.signature!, placement: e.target.value as "left" | "right" } }))}
                    className="field-input"
                  >
                    <option value="left">Bottom-left</option>
                    <option value="right">Bottom-right</option>
                  </select>
                  <input
                    value={layout.signature.label}
                    onChange={(e) => setLayout((p) => ({ ...p, signature: { ...p.signature!, label: e.target.value } }))}
                    className="field-input"
                    placeholder="Guarantor / Applicant / Sponsor"
                  />
                  <div className="col-span-2">
                    <label className="field-label" htmlFor="signature-name-field">Name printed under the line</label>
                    <select
                      id="signature-name-field"
                      value={layout.signature.nameFieldId ?? ""}
                      onChange={(e) => setLayout((p) => ({ ...p, signature: { ...p.signature!, nameFieldId: e.target.value || undefined } }))}
                      className="field-input"
                    >
                      <option value="">None — leave blank until signed</option>
                      {fields.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Blocks */}
        <div className="rounded-card border border-hairline bg-surface p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-title font-semibold text-ink">Content</h3>
            <div className="flex gap-1.5">
              <Button type="button" size="sm" variant="secondary" onClick={() => addBlock("heading")}><Type className="h-3.5 w-3.5" aria-hidden="true" /> Heading</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => addBlock("paragraph")}><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Paragraph</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => addBlock("list")}><ListIcon className="h-3.5 w-3.5" aria-hidden="true" /> List</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => addBlock("spacer")}>Space</Button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {layout.blocks.map((block, index) => (
              <div key={index} className="rounded-control border border-hairline p-3">
                <div className="flex items-center justify-between">
                  <span className="text-meta font-medium uppercase tracking-wide text-muted">{block.type}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveBlock(index, -1)} aria-label="Move up" className="text-muted hover:text-ink"><ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /></button>
                    <button type="button" onClick={() => moveBlock(index, 1)} aria-label="Move down" className="text-muted hover:text-ink"><ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /></button>
                    <button type="button" onClick={() => removeBlock(index)} aria-label="Remove block" className="text-muted hover:text-[#B42318]"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button>
                  </div>
                </div>

                {(block.type === "heading" || block.type === "paragraph") ? (
                  <>
                    <textarea
                      ref={(el) => { textareaRefs.current[index] = el; }}
                      value={block.text}
                      onChange={(e) => updateBlock(index, { text: e.target.value } as Partial<DocumentBlock>)}
                      rows={block.type === "heading" ? 1 : 3}
                      className="field-input mt-2"
                      placeholder={block.type === "heading" ? "LETTER OF INTRODUCTION" : "Dear Sir/Madam, this is to introduce {{fullName}}…"}
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-meta text-muted">Insert field:</span>
                      {fields.length === 0 ? (
                        <span className="text-meta text-muted">Add fields above first</span>
                      ) : (
                        fields.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => insertFieldToken(index, f.id, block.text)}
                            className="rounded-full border border-hairline px-2.5 py-0.5 text-meta text-ink hover:border-brand/40"
                          >
                            {f.label}
                          </button>
                        ))
                      )}
                    </div>
                    {block.type === "heading" ? (
                      <div className="mt-2 flex flex-wrap gap-3">
                        <select value={block.size} onChange={(e) => updateBlock(index, { size: e.target.value } as Partial<DocumentBlock>)} className="field-input w-auto">
                          <option value="sm">Small</option>
                          <option value="md">Medium</option>
                          <option value="lg">Large</option>
                        </select>
                        <select value={block.align} onChange={(e) => updateBlock(index, { align: e.target.value } as Partial<DocumentBlock>)} className="field-input w-auto">
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                        <label className="flex items-center gap-1.5 text-label text-ink">
                          <input type="checkbox" checked={block.underline} onChange={(e) => updateBlock(index, { underline: e.target.checked } as Partial<DocumentBlock>)} />
                          Underline
                        </label>
                      </div>
                    ) : (
                      <select value={block.align} onChange={(e) => updateBlock(index, { align: e.target.value } as Partial<DocumentBlock>)} className="field-input mt-2 w-auto">
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    )}
                  </>
                ) : null}

                {block.type === "list" ? (
                  <div className="mt-2 space-y-2">
                    <select value={block.style} onChange={(e) => updateBlock(index, { style: e.target.value } as Partial<DocumentBlock>)} className="field-input w-auto">
                      <option value="bullet">Bullets</option>
                      <option value="number">Numbered</option>
                    </select>
                    {block.items.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={item}
                          onChange={(e) => {
                            const items = [...block.items];
                            items[i] = e.target.value;
                            updateBlock(index, { items } as Partial<DocumentBlock>);
                          }}
                          className="field-input"
                        />
                        <button
                          type="button"
                          onClick={() => updateBlock(index, { items: block.items.filter((_, x) => x !== i) } as Partial<DocumentBlock>)}
                          aria-label="Remove item"
                          className="text-muted hover:text-[#B42318]"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                    <Button type="button" size="sm" variant="secondary" onClick={() => updateBlock(index, { items: [...block.items, ""] } as Partial<DocumentBlock>)}>
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Item
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {error ? <p className="text-label text-[#B42318]">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {existing ? "Save changes" : "Create template"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/documents")}>Cancel</Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-meta font-medium uppercase tracking-wide text-muted">Live preview</p>
        <DocumentPreview template={previewTemplate} values={{}} />
      </div>
    </div>
  );
}
