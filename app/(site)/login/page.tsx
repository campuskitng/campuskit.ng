import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="shell max-w-sm pb-16 pt-8 sm:pt-12">
      <header>
        <p className="eyebrow">Accounts</p>
        <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">Log in</h1>
        <p className="mt-2 text-body text-muted">Access your documents, your anonymous inbox, and saved content.</p>
      </header>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
