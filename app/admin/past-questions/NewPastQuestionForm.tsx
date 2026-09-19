"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createPastQuestionAction } from "@/lib/admin-actions";

export function NewPastQuestionForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" className="mt-6" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" /> Upload past question
      </Button>
    );
  }

  return (
    <form
      action={async (formData) => {
        setPending(true);
        const res = await createPastQuestionAction(formData);
        setPending(false);
        if (res?.error) setError(res.error);
        else setOpen(false);
      }}
      className="mt-6 grid max-w-lg gap-3 rounded-card border border-hairline bg-surface p-4"
    >
      <input name="title" required placeholder="Title" className="field-input" />
      <div className="grid grid-cols-2 gap-3">
        <input name="institution" required placeholder="Institution" className="field-input" />
        <input name="department" required placeholder="Department" className="field-input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input name="courseCode" required placeholder="Course code (CSC301)" className="field-input" />
        <input name="courseTitle" placeholder="Course title" className="field-input" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input name="level" placeholder="Level (300)" className="field-input" />
        <input name="session" required placeholder="Session (2023/2024)" className="field-input" />
        <select name="semester" className="field-input">
          <option value="First">First</option>
          <option value="Second">Second</option>
          <option value="Combined">Combined</option>
        </select>
      </div>
      <label className="field-label">PDF file</label>
      <input name="file" type="file" accept="application/pdf" required className="field-input" />
      {error ? <p className="text-label text-[#B42318]">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? "Uploading…" : "Upload"}</Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
