import { Suspense } from "react";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="shell max-w-sm pb-16 pt-8 sm:pt-12">
      <header>
        <p className="eyebrow">Accounts</p>
        <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">Get started</h1>
        <p className="mt-2 text-body text-muted">One account for documents, your anonymous link, and saved content.</p>
      </header>
      <Suspense>
        <SignupForm />
      </Suspense>
    </div>
  );
}
