import { getSiteSettings } from "@/lib/settings-actions";
import { SettingToggle } from "./SettingToggle";

export const revalidate = 0;

const toggles: { id: keyof Awaited<ReturnType<typeof getSiteSettings>>; label: string; description: string }[] = [
  {
    id: "anonymous_messaging_enabled",
    label: "Anonymous messaging",
    description: "Site-wide switch. Turning this off stops new anonymous messages from being sent, even to users whose own link is enabled.",
  },
  {
    id: "maintenance_mode",
    label: "Maintenance mode",
    description: "Shows a maintenance banner across the public site. Admin pages stay accessible.",
  },
];

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="text-section font-semibold text-ink">Settings</h1>
      <p className="mt-1 text-label text-muted">Platform-wide feature flags, stored in Supabase.</p>

      <ul className="mt-5 divide-y divide-hairline rounded-card border border-hairline bg-surface">
        {toggles.map((toggle) => (
          <li key={toggle.id} className="flex items-start justify-between gap-4 p-4">
            <div>
              <p className="text-label font-medium text-ink">{toggle.label}</p>
              <p className="mt-0.5 text-meta text-muted">{toggle.description}</p>
            </div>
            <SettingToggle settingKey={toggle.id} initialValue={settings[toggle.id]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
