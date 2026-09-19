"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { signUpAction, type ActionState } from "@/lib/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
      Create account
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState<ActionState, FormData>(signUpAction, null);
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "/";

  return (
    <div className="mt-6 space-y-5">
      <GoogleSignInButton redirectTo={redirectTo} />

      <div className="flex items-center gap-3 text-meta text-muted" role="separator">
        <span className="h-px flex-1 bg-hairline" />
        or
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div>
          <label className="field-label" htmlFor="displayName">Full name</label>
          <input id="displayName" name="displayName" required className="field-input" placeholder="Robin Idahosa" />
        </div>
        <div>
          <label className="field-label" htmlFor="username">Username</label>
          <input id="username" name="username" required pattern="[a-z0-9_]{3,20}" className="field-input" placeholder="robin" />
          <p className="mt-1 text-meta text-muted">This becomes campuskit.ng/anonymous/&lt;username&gt;. Lowercase letters, numbers, underscore.</p>
        </div>
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="field-input" />
        </div>
        {state?.error ? <p role="alert" className="text-label text-[#B42318]">{state.error}</p> : null}
        <SubmitButton />
        <p className="text-center text-label text-muted">
          Already have an account? <Link href="/login" className="font-medium text-brand hover:text-brand-700">Log in</Link>
        </p>
      </form>
    </div>
  );
}
