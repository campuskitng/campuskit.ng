import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DocumentBuilderForm } from "../DocumentBuilderForm";

export default function NewDocumentTemplatePage() {
  return (
    <div className="max-w-5xl">
      <Link href="/admin/documents" className="inline-flex items-center gap-1.5 text-label font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Documents
      </Link>
      <h1 className="mt-3 text-section font-semibold text-ink">New document template</h1>
      <p className="mt-1 text-label text-muted">
        Build the structure, insert fields where the student should fill something in, and preview it live.
      </p>
      <DocumentBuilderForm />
    </div>
  );
}
