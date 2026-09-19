import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileForm } from "../ProfileForm";
import { DeleteAccountButton } from "../DeleteAccountButton";
import { AppearanceSettings } from "./AppearanceSettings";

export const revalidate = 0;

export default async function EditAccountPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account/edit");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, institution, theme_preference")
    .eq("id", user.id)
    .single();

  return (
    <div className="shell max-w-2xl pb-16 pt-8 sm:pt-10">
      <Link href="/account" className="inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Account
      </Link>

      <header className="mt-4">
        <p className="eyebrow">Account</p>
        <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">Edit profile</h1>
        <p className="mt-2 text-body text-muted">{user.email}</p>
      </header>

      <section className="mt-8 border-t border-hairline pt-8">
        <h2 className="text-section font-semibold text-ink">Profile</h2>
        {profile ? <ProfileForm profile={profile} /> : null}
      </section>

      <section className="mt-10 border-t border-hairline pt-8">
        <h2 className="text-section font-semibold text-ink">Appearance</h2>
        <p className="mt-1 max-w-[46ch] text-label text-muted">Choose how CampusKit looks on this and your other devices.</p>
        <AppearanceSettings currentPreference={profile?.theme_preference ?? "system"} />
      </section>

      <section className="mt-10 border-t border-hairline pt-8">
        <h2 className="text-section font-semibold text-ink">Danger zone</h2>
        <p className="mt-1 max-w-[46ch] text-label text-muted">
          Deleting your account removes your profile, anonymous inbox, and saved items. Your generated
          documents&apos; payment records are kept for accounting purposes.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}
