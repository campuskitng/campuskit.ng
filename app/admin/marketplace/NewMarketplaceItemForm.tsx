"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createMarketplaceItemAction } from "@/lib/admin-actions";

const conditions = ["New", "Like new", "Good", "Fair"];

export function NewMarketplaceItemForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button variant="secondary" className="mt-6" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Add listing
      </Button>
    );
  }

  return (
    <form
      action={async (formData) => {
        const res = await createMarketplaceItemAction(formData);
        if (res?.error) setError(res.error);
        else setOpen(false);
      }}
      className="mt-6 grid max-w-lg gap-3 rounded-card border border-hairline bg-surface p-4"
    >
      <input name="title" required placeholder="Title" className="field-input" />
      <textarea name="description" placeholder="Description" rows={2} className="field-input" />
      <div className="grid grid-cols-2 gap-3">
        <input name="price" type="number" min={0} required placeholder="Price (₦)" className="field-input" />
        <input name="location" required placeholder="Location" className="field-input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input name="category" placeholder="Category" defaultValue="General" className="field-input" />
        <select name="condition" className="field-input">
          {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <input name="image" placeholder="Image URL" className="field-input" />
      <input name="whatsappContact" placeholder="Seller WhatsApp (e.g. 08012345678 or wa.me link)" className="field-input" />
      {error ? <p className="text-label text-[#B42318]">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit">Create</Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
