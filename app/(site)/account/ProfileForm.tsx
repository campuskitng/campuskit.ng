"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateProfileAction, type ActionState } from "@/lib/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
      Save changes
    </Button>
  );
}

export function ProfileForm({
  profile,
}: {
  profile: { username: string; display_name: string; institution: string | null };
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(updateProfileAction, null);
  return (
    <form action={formAction} className="mt-6 max-w-md space-y-4">
      <div>
        <label className="field-label" htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" defaultValue={profile.display_name} required className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="username">Username</label>
        <input id="username" name="username" defaultValue={profile.username} pattern="[a-z0-9_]{3,20}" required className="field-input" />
        <p className="mt-1 text-meta text-muted">campuskit.ng/anonymous/{profile.username}</p>
      </div>
      <div>
        <label className="field-label" htmlFor="institution">Institution</label>
        <input id="institution" name="institution" defaultValue={profile.institution ?? ""} className="field-input" placeholder="University of Benin" />
      </div>
      {state?.error ? <p role="alert" className="text-label text-[#B42318]">{state.error}</p> : null}
      {state?.success ? <p className="text-label text-success">{state.success}</p> : null}
      <SubmitButton />
    </form>
  );
}
