import { formatPreviewDate, renderTemplateLine } from "@/data/documents";
import type { DocumentBlock, DocumentTemplate } from "@/lib/types";

/**
 * A plain, formal letter sheet. Deliberately not styled like the rest of the
 * product: it should read as the thing you will print.
 *
 * Handles both template shapes the way lib/documents/render.ts does:
 * `layout` (admin-builder templates) takes priority over the legacy
 * `preview` shape — same blocks, rendered as HTML instead of PDF drawing
 * calls, so what the student sees here matches what downloads.
 */
export function DocumentPreview({
  template,
  values,
  className = "",
}: {
  template: DocumentTemplate;
  values: Record<string, string>;
  className?: string;
}) {
  const render = (line: string) => renderTemplateLine(line, template, values);
  const addressLines = template.preview?.to.split("\n") ?? [];

  function renderBlock(block: DocumentBlock, index: number) {
    switch (block.type) {
      case "heading": {
        const sizeClass = block.size === "lg" ? "text-lg" : block.size === "sm" ? "text-[13px]" : "text-[15px]";
        const alignClass = block.align === "center" ? "text-center" : block.align === "right" ? "text-right" : "text-left";
        return (
          <p key={index} className={`mt-5 font-semibold ${sizeClass} ${alignClass} ${block.underline ? "underline decoration-1 underline-offset-2" : ""}`}>
            {render(block.text)}
          </p>
        );
      }
      case "paragraph": {
        const alignClass = block.align === "center" ? "text-center" : block.align === "right" ? "text-right" : "text-justify";
        return (
          <p key={index} className={`mt-3 ${alignClass}`}>
            {render(block.text)}
          </p>
        );
      }
      case "list":
        return (
          <ul key={index} className={`mt-3 space-y-1.5 pl-5 ${block.style === "number" ? "list-decimal" : "list-disc"}`}>
            {block.items.map((item, i) => (
              <li key={i}>{render(item)}</li>
            ))}
          </ul>
        );
      case "spacer":
        return <div key={index} className={block.size === "lg" ? "h-8" : block.size === "sm" ? "h-2" : "h-4"} />;
    }
  }

  return (
    <article
      aria-label={`${template.name} preview`}
      className={`rounded-card border border-hairline bg-surface p-6 text-[13px] leading-6 text-ink shadow-control sm:p-8 ${className}`}
    >
      {template.layout ? (
        <>
          {template.layout.header?.show ? (
            <div className="border-b border-hairline pb-3 text-center font-semibold">
              {template.layout.header.institutionName || "CampusKit"}
            </div>
          ) : null}
          {template.layout.addressBlock?.show ? (
            <div className={`mt-4 text-muted ${template.layout.addressBlock.align === "right" ? "text-right" : "text-left"}`}>
              {render(template.layout.addressBlock.text)
                .split("\n")
                .map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
            </div>
          ) : null}
          {template.layout.showDateLine ? <p className="mt-4 text-muted">{formatPreviewDate()}</p> : null}
          <div>{template.layout.blocks.map(renderBlock)}</div>
          {template.layout.signature?.show ? (
            <div className={`mt-8 ${template.layout.signature.placement === "right" ? "text-right" : "text-left"}`}>
              <p className="text-muted">_______________________________</p>
              <p className="mt-2 font-medium">
                {(template.layout.signature.nameFieldId && values[template.layout.signature.nameFieldId]?.trim()) ||
                  (template.layout.signature.nameFieldId
                    ? `[${template.fields?.find((f) => f.id === template.layout!.signature!.nameFieldId)?.label ?? "Signature"}]`
                    : "")}
              </p>
              <p className="text-meta text-muted">{template.layout.signature.label}</p>
            </div>
          ) : null}
        </>
      ) : template.preview ? (
        <>
          <p className="text-right text-muted">{formatPreviewDate()}</p>

          <div className="mt-6 space-y-0.5 font-medium">
            {addressLines.map((line, position) => (
              <p key={position}>{render(line)}</p>
            ))}
          </div>

          <p className="mt-6 font-semibold underline decoration-1 underline-offset-2">
            {render(template.preview.subject)}
          </p>

          <p className="mt-5">Dear Sir/Madam,</p>

          <div className="mt-3 space-y-3 text-justify">
            {template.preview.body.map((paragraph, position) => (
              <p key={position}>{render(paragraph)}</p>
            ))}
          </div>

          <div className="mt-8">
            <p>Yours faithfully,</p>
            <p className="mt-6 font-medium">{values.studentName?.trim() || "[Your full name]"}</p>
            {values.matricNumber?.trim() ? <p className="text-muted">{values.matricNumber}</p> : null}
          </div>
        </>
      ) : (
        <div className="py-10 text-center">
          <p className="text-title font-medium text-ink">{template.name}</p>
          <p className="mx-auto mt-2 max-w-[34ch] text-label text-muted">
            The form for this document is not open yet. Pick another type, or leave your email and
            we will tell you when it is ready.
          </p>
        </div>
      )}
    </article>
  );
}
