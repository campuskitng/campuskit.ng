"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { updateThemePreferenceAction } from "@/lib/theme-actions";
import type { ThemePreference } from "@/lib/types";

const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "System", icon: Laptop },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export function AppearanceSettings({ currentPreference }: { currentPreference: ThemePreference }) {
  const { setTheme } = useTheme();
  const [selected, setSelected] = useState<ThemePreference>(currentPreference);
  const [saving, setSaving] = useState<ThemePreference | null>(null);

  async function choose(value: ThemePreference) {
    setSelected(value);
    setTheme(value); // instant, no-flash switch on this device
    setSaving(value);
    await updateThemePreferenceAction(value); // persists across the account's devices
    setSaving(null);
  }

  return (
    <div className="mt-4 grid max-w-md grid-cols-3 gap-2">
      {options.map(({ value, label, icon: Icon }) => {
        const active = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            aria-pressed={active}
            className={`flex flex-col items-center gap-1.5 rounded-control border p-3 text-label font-medium transition-colors ${
              active ? "border-brand bg-brand-soft text-brand-700" : "border-hairline bg-surface text-ink hover:border-brand/40"
            }`}
          >
            <span className="relative">
              <Icon className="h-5 w-5" aria-hidden="true" />
              {active && saving === null ? (
                <Check className="absolute -right-2 -top-2 h-3.5 w-3.5 rounded-full bg-brand p-0.5 text-white" aria-hidden="true" />
              ) : null}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
