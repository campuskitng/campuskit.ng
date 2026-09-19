"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updatePasswordAction, type ActionState } from "@/lib/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
      Update password
    </Button>
  );
}

export default function NewPasswordPage() {
  const [state, formAction] = useFormState<ActionState, FormData>(updatePasswordAction, null);
  return (
    <div className="shell max-w-sm pb-16 pt-8 sm:pt-12">
      <h1 className="text-display font-semibold tracking-tight text-ink">Choose a new password</h1>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="field-label" htmlFor="password">New password</label>
          <input id="password" name="password" type="password" required minLength={8} className="field-input" />
        </div>
        {state?.error ? <p role="alert" className="text-label text-[#B42318]">{state.error}</p> : null}
        <SubmitButton />
      </form>
    </div>
  );
}
