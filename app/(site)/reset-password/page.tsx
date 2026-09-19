"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { requestPasswordResetAction, type ActionState } from "@/lib/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
      Send reset link
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState<ActionState, FormData>(requestPasswordResetAction, null);
  return (
    <div className="shell max-w-sm pb-16 pt-8 sm:pt-12">
      <header>
        <p className="eyebrow">Accounts</p>
        <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">Reset password</h1>
        <p className="mt-2 text-body text-muted">We&apos;ll email you a link to choose a new password.</p>
      </header>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="field-input" />
        </div>
        {state?.error ? <p role="alert" className="text-label text-[#B42318]">{state.error}</p> : null}
        {state?.success ? <p className="text-label text-success">{state.success}</p> : null}
        <SubmitButton />
      </form>
    </div>
  );
}
