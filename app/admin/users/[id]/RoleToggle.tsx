"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { setUserRoleAction } from "@/lib/admin-actions";

export function RoleToggle({ userId, role }: { userId: string; role: string }) {
  const [pending, startTransition] = useTransition();
  const next = role === "admin" ? "user" : "admin";
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => { void setUserRoleAction(userId, next); })}
    >
      {pending ? "Updating…" : `Make ${next}`}
    </Button>
  );
}
