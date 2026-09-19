import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ANONYMOUS_CARD_THEME_STYLES } from "@/lib/anonymous-themes";
import { ANONYMOUS_CARD_THEMES, type AnonymousCardTheme } from "@/lib/types";

export const runtime = "edge";

const WIDTH = 1080;
const HEIGHT = 1350;

// Fetches a specific weight of Inter directly as raw TTF bytes from
// jsDelivr's font CDN — matches the font the rest of the app uses (see
// app/layout.tsx's next/font/google Inter import). One direct request per
// weight, no CSS-parsing round trip like Google Fonts' CSS2 endpoint needs.
async function loadInterFont(weight: 400 | 700) {
  return fetch(`https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-${weight}-normal.ttf`).then((res) =>
    res.arrayBuffer(),
  );
}

/**
 * Renders the same message the recipient sees in their inbox as a
 * shareable PNG — this is the "download/share card" from the brief's viral
 * loop (message → reply → download → share → new signups). Rendered
 * server-side via satori (next/og), not a client screenshot library, so it
 * looks the same regardless of the viewer's device/zoom.
 *
 * Ownership check: the RLS-scoped server client is what actually gates
 * this — `anonymous_messages` select policy only returns the caller's own
 * (or, for an admin, any) message. No session → no row → 404, same as
 * someone else's message.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data: message } = await supabase
    .from("anonymous_messages")
    .select("id, body, image_path, reply_body, card_theme, recipient_id")
    .eq("id", params.id)
    .maybeSingle();
  if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", message.recipient_id).maybeSingle();

  const requestedTheme = request.nextUrl.searchParams.get("theme");
  const theme: AnonymousCardTheme = ANONYMOUS_CARD_THEMES.includes(requestedTheme as AnonymousCardTheme)
    ? (requestedTheme as AnonymousCardTheme)
    : message.card_theme;
  const t = ANONYMOUS_CARD_THEME_STYLES[theme];

  let imageUrl: string | null = null;
  if (message.image_path) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.storage.from("anonymous-images").createSignedUrl(message.image_path, 60);
    imageUrl = data?.signedUrl ?? null;
  }

  const [fontRegular, fontBold] = await Promise.all([loadInterFont(400), loadInterFont(700)]);

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 64px",
          backgroundImage: t.gradient,
          color: t.text,
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: t.chip,
              color: t.chipText,
              borderRadius: 999,
              padding: "12px 22px",
              fontSize: 28,
              fontWeight: 600,
              alignSelf: "flex-start",
            }}
          >
            💬 Anonymous message
          </div>

          <div style={{ display: "flex", marginTop: 48, fontSize: 56, fontWeight: 700, lineHeight: 1.25, letterSpacing: -1 }}>
            {message.body.length > 220 ? `${message.body.slice(0, 220)}…` : message.body}
          </div>

          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} width={WIDTH - 128} height={420} style={{ objectFit: "cover", borderRadius: 24, marginTop: 40 }} />
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {message.reply_body ? (
            <div style={{ display: "flex", flexDirection: "column", background: t.chip, borderRadius: 24, padding: 32, marginBottom: 36 }}>
              <div style={{ display: "flex", color: t.subtext, fontSize: 26, fontWeight: 600 }}>💬 Reply</div>
              <div style={{ display: "flex", marginTop: 10, fontSize: 34, lineHeight: 1.3 }}>{message.reply_body}</div>
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: t.subtext, fontSize: 28 }}>
            <div style={{ display: "flex", alignItems: "center", fontWeight: 700 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.2)",
                  marginRight: 12,
                  fontSize: 20,
                }}
              >
                C
              </div>
              CampusKit
            </div>
            <div style={{ display: "flex" }}>campuskit.ng/anonymous/{profile?.username ?? ""}</div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "Inter",
          data: fontRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: fontBold,
          weight: 700,
          style: "normal",
        },
      ],
      headers: {
        "content-disposition": 'attachment; filename="campuskit-anonymous.png"',
        "cache-control": "private, no-store",
      },
    },
  );

  return image;
}