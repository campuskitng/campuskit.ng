import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Shared shell for routes that exist in navigation but wait on the backend.
 * Keeps dead ends honest instead of showing a broken link.
 */
export function Placeholder({
  eyebrow,
  title,
  body,
  backHref = "/",
  backLabel = "Back to home",
}: {
  eyebrow?: string;
  title: string;
  body: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="shell max-w-xl pb-20 pt-14 sm:pt-20">
      {eyebrow ? <p className="eyebrow text-brand">{eyebrow}</p> : null}
      <h1 className="mt-2 text-display font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-3 text-body text-muted">{body}</p>
      <ButtonLink href={backHref} variant="secondary" className="mt-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </ButtonLink>
    </div>
  );
}
