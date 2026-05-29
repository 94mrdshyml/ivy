import {
  createSupabaseServerClient,
  db,
  encrypt,
  ids,
  getOrgContext,
} from "@ivy/db";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getInstagramAccountFromToken,
} from "@/lib/meta";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("ig_oauth_state")?.value;
  cookieStore.delete("ig_oauth_state");

  const connectionsUrl = new URL(
    "/dashboard/settings/connections",
    req.nextUrl.origin,
  );

  if (error) {
    connectionsUrl.searchParams.set("error", "oauth_denied");
    return NextResponse.redirect(connectionsUrl);
  }
  if (!code || !state || state !== savedState) {
    connectionsUrl.searchParams.set("error", "invalid_state");
    return NextResponse.redirect(connectionsUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));

    const { org } = await getOrgContext(user.id);

    const shortToken = await exchangeCodeForToken(code);
    const { token: longToken, expiresAt } =
      await exchangeForLongLivedToken(shortToken);
    const ig = await getInstagramAccountFromToken(longToken);

    await db.instagramAccount.upsert({
      where: { orgId_igUserId: { orgId: org.id, igUserId: ig.id } },
      update: {
        igUsername: ig.username,
        igName: ig.name ?? null,
        igProfilePicUrl: ig.profile_picture_url ?? null,
        igAccountType: ig.account_type ?? null,
        igFollowersCount: ig.followers_count ?? null,
        accessTokenEnc: encrypt(longToken),
        tokenExpiresAt: expiresAt,
        deletedAt: null,
      },
      create: {
        id: ids.iga(),
        orgId: org.id,
        igUserId: ig.id,
        igUsername: ig.username,
        igName: ig.name ?? null,
        igProfilePicUrl: ig.profile_picture_url ?? null,
        igAccountType: ig.account_type ?? null,
        igFollowersCount: ig.followers_count ?? null,
        accessTokenEnc: encrypt(longToken),
        tokenExpiresAt: expiresAt,
      },
    });

    connectionsUrl.searchParams.set("connected", "instagram");
    return NextResponse.redirect(connectionsUrl);
  } catch (err) {
    console.error("Instagram callback error:", err);
    connectionsUrl.searchParams.set("error", "connection_failed");
    return NextResponse.redirect(connectionsUrl);
  }
}
