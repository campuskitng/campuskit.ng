"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateOpportunityAction } from "@/lib/admin-actions";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: string;
  deadline: string;
  eligibility: string | null;
  location: string | null;
  description: string | null;
  status: string;
};

const categories = ["Scholarship", "Internship", "Competition", "Event", "Fellowship"];
const statuses = ["published", "draft", "expired"];

export function EditOpportunityForm({ opportunity }: { opportunity: Opportunity }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        setPending(true);
        const res = await updateOpportunityAction(opportunity.id, formData);
        setPending(false);
        if (res?.error) setError(res.error);
        else router.push("/admin/opportunities");
      }}
      className="mt-6 grid gap-3 rounded-card border border-hairline bg-surface p-4"
    >
      <div>
        <label className="field-label" htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={opportunity.title} required className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="organization">Organization</label>
        <input id="organization" name="organization" defaultValue={opportunity.organization} required className="field-input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={opportunity.category} className="field-input">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="deadline">Deadline</label>
          <input id="deadline" name="deadline" type="date" defaultValue={opportunity.deadline} required className="field-input" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="eligibility">Eligibility</label>
        <input id="eligibility" name="eligibility" defaultValue={opportunity.eligibility ?? ""} className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="location">Location</label>
        <input id="location" name="location" defaultValue={opportunity.location ?? ""} className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={opportunity.description ?? ""} rows={3} className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={opportunity.status} className="field-input">
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {error ? <p className="text-label text-[#B42318]">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          Save changes
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/opportunities")}>Cancel</Button>
      </div>
    </form>
  );
}
