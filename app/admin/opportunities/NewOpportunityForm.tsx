"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createOpportunityAction } from "@/lib/admin-actions";

const categories = ["Scholarship", "Internship", "Competition", "Event", "Fellowship"];

export function NewOpportunityForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button variant="secondary" className="mt-6" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Add opportunity
      </Button>
    );
  }

  return (
    <form
      action={async (formData) => {
        const res = await createOpportunityAction(formData);
        if (res?.error) setError(res.error);
        else setOpen(false);
      }}
      className="mt-6 grid max-w-lg gap-3 rounded-card border border-hairline bg-surface p-4"
    >
      <input name="title" required placeholder="Title" className="field-input" />
      <input name="organization" required placeholder="Organization" className="field-input" />
      <div className="grid grid-cols-2 gap-3">
        <select name="category" className="field-input">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="deadline" type="date" required className="field-input" />
      </div>
      <input name="eligibility" placeholder="Eligibility (optional)" className="field-input" />
      <input name="location" placeholder="Location (optional)" className="field-input" />
      <textarea name="description" placeholder="Description" rows={3} className="field-input" />
      {error ? <p className="text-label text-[#B42318]">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit">Create</Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
