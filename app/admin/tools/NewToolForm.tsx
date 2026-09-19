"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createToolAction } from "@/lib/admin-actions";

export function NewToolForm({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button variant="secondary" className="mt-6" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Add tool
      </Button>
    );
  }

  return (
    <form
      action={async (formData) => {
        const res = await createToolAction(formData);
        if (res?.error) setError(res.error);
        else setOpen(false);
      }}
      className="mt-6 grid max-w-lg gap-3 rounded-card border border-hairline bg-surface p-4"
    >
      <input name="name" required placeholder="Name" className="field-input" />
      <input name="description" required placeholder="Short description" className="field-input" />
      <div className="grid grid-cols-2 gap-3">
        <input name="icon" placeholder="Icon (lucide name)" defaultValue="sparkles" className="field-input" />
        <select name="category" className="field-input">
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <input name="href" placeholder="/tools/slug (optional)" className="field-input" />
      <div className="flex items-center gap-4 text-label text-ink">
        <label className="flex items-center gap-1.5"><input type="checkbox" name="popular" /> Popular</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" name="is_new" /> New</label>
      </div>
      {error ? <p className="text-label text-[#B42318]">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit">Create</Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
