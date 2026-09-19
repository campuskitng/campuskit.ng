"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateMarketplaceItemAction } from "@/lib/admin-actions";

type Item = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  category: string;
  condition: string;
  image: string;
  status: string;
  whatsapp_contact: string | null;
};

const conditions = ["New", "Like new", "Good", "Fair"];
const statuses = ["available", "reserved", "sold", "draft"];

export function EditMarketplaceItemForm({ item }: { item: Item }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        setPending(true);
        const res = await updateMarketplaceItemAction(item.id, formData);
        setPending(false);
        if (res?.error) setError(res.error);
        else router.push("/admin/marketplace");
      }}
      className="mt-6 grid gap-3 rounded-card border border-hairline bg-surface p-4"
    >
      <div>
        <label className="field-label" htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={item.title} required className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={item.description ?? ""} rows={2} className="field-input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="price">Price (₦)</label>
          <input id="price" name="price" type="number" min={0} defaultValue={item.price} required className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="location">Location</label>
          <input id="location" name="location" defaultValue={item.location} required className="field-input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="category">Category</label>
          <input id="category" name="category" defaultValue={item.category} className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="condition">Condition</label>
          <select id="condition" name="condition" defaultValue={item.condition} className="field-input">
            {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="image">Image URL</label>
        <input id="image" name="image" defaultValue={item.image} className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="whatsappContact">Seller WhatsApp</label>
        <input
          id="whatsappContact"
          name="whatsappContact"
          defaultValue={item.whatsapp_contact ?? ""}
          placeholder="08012345678 or a wa.me link"
          className="field-input"
        />
        <p className="mt-1 text-meta text-muted">Shown to students as a "Message on WhatsApp" button. Leave blank to hide it.</p>
      </div>
      <div>
        <label className="field-label" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={item.status} className="field-input">
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {error ? <p className="text-label text-[#B42318]">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          Save changes
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/marketplace")}>Cancel</Button>
      </div>
    </form>
  );
}
