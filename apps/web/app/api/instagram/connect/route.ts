import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient, db } from "@ivy/db";
import { cookies } from "next/headers";

const SCOPES = [
  "instagram_basic",
  "instagram_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const dbUser = await db.user.findUnique({ where: { email: user.email! } });
  const membership = dbUser
    ? await db.membership.findFirst({ where: { userId: dbUser.id } })
    : null;

  if (!membership)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  const cookieStore = await cookies();
  cookieStore.set("ig_org_id", membership.orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`,
    scope: SCOPES,
    response_type: "code",
  });

  return NextResponse.redirect(
    `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`,
  );
}
