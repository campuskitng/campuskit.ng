import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { DocumentBlock, DocumentLayout, DocumentTemplate } from "@/lib/types";

/** Resolves {{fieldId}} tokens against submitted values. */
function resolve(line: string, values: Record<string, string>): string {
  return line.replace(/\{\{(\w+)\}\}/g, (_, id) => values[id] ?? "");
}

const MARGIN = 64; // ~0.9in — slightly tighter than 1in so body text reads
                    // less lost on the page (brief: "leaves excessive unused
                    // space... content looks too small").
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const INK = rgb(0.08, 0.09, 0.11);
const MUTED = rgb(0.42, 0.44, 0.48);
const BRAND = rgb(0.388, 0.357, 1); // #635BFF, used sparingly (the header rule)

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

type Fonts = { regular: PDFFont; bold: PDFFont };

/**
 * A small, shared page-drawing cursor used by both the legacy renderer and
 * the block-based one — this is the piece that actually makes documents
 * "look like Word" (real line-height, paragraph spacing, page breaks that
 * don't cut a line in half).
 */
class PageCursor {
  pdf: PDFDocument;
  page: import("pdf-lib").PDFPage;
  y: number;
  fonts: Fonts;

  constructor(pdf: PDFDocument, fonts: Fonts) {
    this.pdf = pdf;
    this.fonts = fonts;
    this.page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  private ensureSpace(height: number) {
    if (this.y - height < MARGIN) {
      this.page = this.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.y = PAGE_HEIGHT - MARGIN;
    }
  }

  text(str: string, opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; align?: "left" | "center" | "right"; gap?: number } = {}) {
    const size = opts.size ?? 11;
    const font = opts.font ?? this.fonts.regular;
    const gap = opts.gap ?? size * 1.6;
    this.ensureSpace(gap);
    let x = opts.x ?? MARGIN;
    if (opts.align === "center") {
      x = (PAGE_WIDTH - font.widthOfTextAtSize(str, size)) / 2;
    } else if (opts.align === "right") {
      x = PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(str, size);
    }
    this.page.drawText(str, { x, y: this.y, size, font, color: opts.color ?? INK });
    this.y -= gap;
  }

  paragraph(str: string, opts: { size?: number; align?: "left" | "center" | "right"; spacingAfter?: number } = {}) {
    const size = opts.size ?? 11.5;
    const lines = wrapText(str, this.fonts.regular, size, CONTENT_WIDTH);
    for (const line of lines) this.text(line, { size, align: opts.align, gap: size * 1.62 });
    this.y -= opts.spacingAfter ?? size * 0.75;
  }

  rule(color = rgb(0.9, 0.9, 0.92)) {
    this.ensureSpace(14);
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: PAGE_WIDTH - MARGIN, y: this.y }, thickness: 1, color });
    this.y -= 14;
  }

  space(px: number) {
    this.y -= px;
  }
}

function drawFooter(pdf: PDFDocument, font: PDFFont, docName: string) {
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(`CampusKit · ${docName} · Page ${i + 1} of ${pages.length}`, {
      x: MARGIN,
      y: 34,
      size: 8,
      font,
      color: MUTED,
    });
  });
}

function signerFieldValue(values: Record<string, string>): string {
  // Legacy templates only (no `layout`) — field naming is consistent across
  // every seeded template (guarantorName, sponsorName, studentName — see
  // data/documents.ts), so this heuristic is safe there. Builder-created
  // templates use an explicit signature.nameFieldId instead (see
  // renderLayout below) since their fields have no fixed naming convention.
  return values.guarantorName || values.sponsorName || values.studentName || Object.values(values)[0] || "";
}

function drawSignatureBlock(cursor: PageCursor, label: string, placement: "left" | "right", name: string) {
  const x = placement === "right" ? PAGE_WIDTH - MARGIN - 220 : MARGIN;
  cursor.space(28);
  cursor.text("_______________________________", { x, size: 11, color: MUTED, gap: 16 });
  if (name) cursor.text(name, { x, size: 11.5, font: cursor.fonts.bold, gap: 15 });
  cursor.text(label, { x, size: 9.5, color: MUTED, gap: 13 });
  cursor.text(`Date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, { x, size: 9.5, color: MUTED, gap: 13 });
}

// --- Legacy renderer (preview: { to, subject, body }) ----------------------
// Unchanged in structure from the pre-builder version — still what every
// template seeded before the admin builder existed uses — refined for
// typography/spacing/signature only, per the brief's PDF-quality request.

function renderLegacy(
  cursor: PageCursor,
  preview: NonNullable<DocumentTemplate["preview"]>,
  values: Record<string, string>,
) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  cursor.text(today, { size: 11 });
  cursor.space(12);

  for (const line of resolve(preview.to, values).split("\n")) {
    cursor.text(line, { size: 11 });
  }
  cursor.space(16);

  cursor.text(resolve(preview.subject, values), { size: 12.5, font: cursor.fonts.bold, gap: 22 });
  cursor.space(8);

  for (const paragraph of preview.body) {
    cursor.paragraph(resolve(paragraph, values));
  }

  cursor.space(20);
  cursor.text("Yours faithfully,", { size: 11 });
  drawSignatureBlock(cursor, "Applicant", "left", signerFieldValue(values));
}

// --- Block-based renderer (layout: DocumentLayout) --------------------------

function renderBlock(cursor: PageCursor, block: DocumentBlock, values: Record<string, string>) {
  switch (block.type) {
    case "heading": {
      const size = block.size === "lg" ? 18 : block.size === "sm" ? 12.5 : 15;
      const text = resolve(block.text, values);
      cursor.text(text, { size, font: cursor.fonts.bold, align: block.align, gap: size * 1.7 });
      if (block.underline) {
        const width = cursor.fonts.bold.widthOfTextAtSize(text, size);
        const x = block.align === "center" ? (PAGE_WIDTH - width) / 2 : block.align === "right" ? PAGE_WIDTH - MARGIN - width : MARGIN;
        cursor.page.drawLine({ start: { x, y: cursor.y + size * 0.5 }, end: { x: x + width, y: cursor.y + size * 0.5 }, thickness: 1, color: INK });
      }
      cursor.space(6);
      return;
    }
    case "paragraph":
      cursor.paragraph(resolve(block.text, values), { align: block.align });
      return;
    case "list": {
      block.items.forEach((item, i) => {
        const marker = block.style === "number" ? `${i + 1}.` : "•";
        const text = resolve(item, values);
        const lines = wrapText(`${marker} ${text}`, cursor.fonts.regular, 11.5, CONTENT_WIDTH - 14);
        lines.forEach((line, li) => cursor.text(li === 0 ? line : `   ${line}`, { size: 11.5, gap: 18 }));
      });
      cursor.space(8);
      return;
    }
    case "spacer":
      cursor.space(block.size === "lg" ? 32 : block.size === "sm" ? 10 : 20);
      return;
  }
}

function renderLayout(cursor: PageCursor, layout: DocumentLayout, values: Record<string, string>) {
  if (layout.header?.show) {
    cursor.text(layout.header.institutionName || "CampusKit", { size: 13, font: cursor.fonts.bold, align: "center", gap: 18 });
    cursor.rule(BRAND);
    cursor.space(10);
  }

  if (layout.addressBlock?.show) {
    const align = layout.addressBlock.align;
    for (const line of resolve(layout.addressBlock.text, values).split("\n")) {
      cursor.text(line, { size: 10.5, color: MUTED, align, gap: 14 });
    }
    cursor.space(10);
  }

  if (layout.showDateLine) {
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    cursor.text(today, { size: 11 });
    cursor.space(14);
  }

  for (const block of layout.blocks) renderBlock(cursor, block, values);

  if (layout.signature?.show) {
    const name = layout.signature.nameFieldId ? values[layout.signature.nameFieldId] || "" : "";
    drawSignatureBlock(cursor, layout.signature.label || "Signature", layout.signature.placement, name);
  }
}

/**
 * Renders a document_templates row + submitted field values into a
 * professionally formatted, A4, print-friendly PDF.
 *
 * Dispatches on which shape the template has: `layout` (built via the admin
 * document builder, /admin/documents/new) takes priority; `preview` (every
 * template seeded before the builder existed) is the fallback. A template
 * only ever has one of the two in normal use, but if somehow both are
 * present, the richer `layout` wins.
 */
export async function renderDocumentPdf(
  template: Pick<DocumentTemplate, "name" | "preview" | "layout">,
  values: Record<string, string>,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(template.name);
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.TimesRoman),
    bold: await pdf.embedFont(StandardFonts.TimesRomanBold),
  };
  const cursor = new PageCursor(pdf, fonts);

  if (template.layout) {
    renderLayout(cursor, template.layout, values);
  } else if (template.preview) {
    renderLegacy(cursor, template.preview, values);
  } else {
    cursor.paragraph(`This document (${template.name}) does not have a formatted body configured yet.`);
  }

  drawFooter(pdf, fonts.regular, template.name);
  return pdf.save();
}
