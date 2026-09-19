"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateToolAction } from "@/lib/admin-actions";

type Tool = {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  category: string;
  popular: boolean;
  is_new: boolean;
  note: string | null;
};

export function EditToolForm({ tool, categories }: { tool: Tool; categories: string[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        setPending(true);
        const res = await updateToolAction(tool.id, formData);
        setPending(false);
        if (res?.error) setError(res.error);
        else router.push("/admin/tools");
      }}
      className="mt-6 grid gap-3 rounded-card border border-hairline bg-surface p-4"
    >
      <div>
        <label className="field-label" htmlFor="name">Name</label>
        <input id="name" name="name" defaultValue={tool.name} required className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <input id="description" name="description" defaultValue={tool.description} required className="field-input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="icon">Icon</label>
          <input id="icon" name="icon" defaultValue={tool.icon} className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={tool.category} className="field-input">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="href">Link</label>
        <input id="href" name="href" defaultValue={tool.href} className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="note">Note badge (optional)</label>
        <input id="note" name="note" defaultValue={tool.note ?? ""} placeholder="Free" className="field-input" />
      </div>
      <div className="flex items-center gap-4 text-label text-ink">
        <label className="flex items-center gap-1.5"><input type="checkbox" name="popular" defaultChecked={tool.popular} /> Popular</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" name="is_new" defaultChecked={tool.is_new} /> New</label>
      </div>
      {error ? <p className="text-label text-[#B42318]">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          Save changes
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/tools")}>Cancel</Button>
      </div>
    </form>
  );
}
