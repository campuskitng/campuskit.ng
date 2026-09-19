import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MessageDetail } from "./MessageDetail";

export const revalidate = 0;

export default async function AnonymousMessagePage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=/account/anonymous/${params.id}`);

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();

  // RLS ("Recipients read own messages") means this simply returns nothing
  // for a message that isn't the caller's — notFound() either way, so a
  // wrong/guessed id can't be distinguished from someone else's message.
  const { data: message } = await supabase
    .from("anonymous_messages")
    .select("id, body, image_path, status, reply_body, replied_at, read_at, created_at, card_theme")
    .eq("id", params.id)
    .neq("status", "removed")
    .maybeSingle();
  if (!message) notFound();

  if (!message.read_at) {
    await supabase.from("anonymous_messages").update({ read_at: new Date().toISOString() }).eq("id", message.id);
  }

  return (
    <div className="shell max-w-xl pb-16 pt-8 sm:pt-10">
      <Link href="/account/anonymous" className="inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Anonymous inbox
      </Link>

      <div className="mt-5">
        <MessageDetail message={message} username={profile?.username ?? ""} />
      </div>
    </div>
  );
}
