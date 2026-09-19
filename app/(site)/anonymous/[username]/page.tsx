import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AnonymousComposer } from "./AnonymousComposer";

type Params = { params: { username: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const username = decodeURIComponent(params.username).toLowerCase();
  return {
    title: `Send @${username} an anonymous message`,
    description: `Send @${username} a message on CampusKit without your name attached.`,
  };
}

export default async function AnonymousProfilePage({ params }: Params) {
  const username = decodeURIComponent(params.username).toLowerCase();
  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, anonymous_enabled")
    .eq("username", username)
    .maybeSingle();

  if (!profile || !profile.anonymous_enabled) notFound();

  const displayName = profile.display_name;

  return (
    <div className="shell max-w-xl pb-16 pt-8 sm:pt-12">
      <header className="text-center">
        <span
          aria-hidden="true"
          className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-title font-semibold text-brand-700"
        >
          {displayName.charAt(0).toUpperCase()}
        </span>
        <h1 className="mt-4 text-section font-semibold tracking-tight text-ink sm:text-display">
          Send {displayName} an anonymous message 👀
        </h1>
        <p className="mt-2 text-label text-muted">
          campuskit.ng/anonymous/{profile.username}
        </p>
      </header>

      <div className="mt-7">
        <AnonymousComposer username={profile.username} displayName={displayName} />
      </div>

      <p className="mt-6 text-center text-label text-muted">
        Want your own link?{" "}
        <Link href="/signup" className="font-medium text-brand hover:text-brand-700">
          Create one on CampusKit
        </Link>
        .
      </p>
    </div>
  );
}
