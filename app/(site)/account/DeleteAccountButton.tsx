"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { deleteAccountAction } from "@/lib/auth-actions";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <Button variant="secondary" className="border-[#B42318]/30 text-[#B42318] hover:border-[#B42318]" onClick={() => setConfirming(true)}>
        Delete account
      </Button>
    );
  }
  return (
    <form action={deleteAccountAction} className="flex items-center gap-3">
      <p className="text-label text-muted">This permanently deletes your account and data.</p>
      <Button variant="secondary" type="button" onClick={() => setConfirming(false)}>Cancel</Button>
      <Button type="submit" className="bg-[#B42318] hover:bg-[#961D14]">Confirm delete</Button>
    </form>
  );
}
