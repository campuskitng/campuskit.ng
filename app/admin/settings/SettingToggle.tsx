"use client";

import { useState, useTransition } from "react";
import { setSiteSettingAction, type SiteSettings } from "@/lib/settings-actions";

export function SettingToggle({ settingKey, initialValue }: { settingKey: keyof SiteSettings; initialValue: boolean }) {
  const [on, setOn] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !on;
    setOn(next); // optimistic
    setError(null);
    startTransition(async () => {
      const res = await setSiteSettingAction(settingKey, next);
      if (res?.error) {
        setOn(!next);
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={toggle}
        disabled={pending}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-brand" : "bg-hairline"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-control transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      {error ? <p className="text-meta text-[#B42318]">{error}</p> : null}
    </div>
  );
}
