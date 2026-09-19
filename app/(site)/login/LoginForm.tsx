"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { signInAction, type ActionState } from "@/lib/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
      Log in
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState<ActionState, FormData>(signInAction, null);
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "/";
  const confirmed = params.get("confirm") === "1";

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
        {confirmed ? (
          <p className="rounded-control border border-success/30 bg-success/5 p-3 text-label text-ink">
            Check your email to confirm your account, then log in.
          </p>
        ) : null}
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="field-input" />
        </div>
        {state?.error ? <p role="alert" className="text-label text-[#B42318]">{state.error}</p> : null}
        <SubmitButton />
        <p className="text-center text-label text-muted">
          <Link href="/reset-password" className="font-medium text-brand hover:text-brand-700">Forgot your password?</Link>
        </p>
        <p className="text-center text-label text-muted">
          No account? <Link href="/signup" className="font-medium text-brand hover:text-brand-700">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
