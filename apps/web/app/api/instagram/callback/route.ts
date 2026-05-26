import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db, ids } from "@ivy/db";
import { cookies } from "next/headers";

const GRAPH = "https://graph.facebook.com/v19.0";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`;

async function exchangeCodeForShortToken(code: string): Promise<string> {
  const res = await fetch(
    `${GRAPH}/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri: REDIRECT_URI,
        code,
      }).toString(),
  );
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function exchangeForLongLivedToken(
  shortToken: string,
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(
    `${GRAPH}/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        fb_exchange_token: shortToken,
      }).toString(),
  );
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

async function getIgAccount(
  pageToken: string,
): Promise<{
  igUserId: string;
  handle: string;
  name: string;
  profilePicUrl: string;
}> {
  // Get pages the user manages
  const pagesRes = await fetch(
    `${GRAPH}/me/accounts?access_token=${pageToken}&fields=id,name,instagram_business_account`,
  );
  const pagesData = (await pagesRes.json()) as {
    data: Array<{
      id: string;
      name: string;
      instagram_business_account?: { id: string };
    }>;
  };

  const page = pagesData.data.find((p) => p.instagram_business_account);
  if (!page?.instagram_business_account) {
    throw new Error("No Instagram Business Account found");
  }

  const igId = page.instagram_business_account.id;
  const igRes = await fetch(
    `${GRAPH}/${igId}?fields=id,username,name,profile_picture_url&access_token=${pageToken}`,
  );
  const igData = (await igRes.json()) as {
    id: string;
    username: string;
    name: string;
    profile_picture_url: string;
  };

  return {
    igUserId: igData.id,
    handle: igData.username,
    name: igData.name,
    profilePicUrl: igData.profile_picture_url,
  };
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/connections", request.url),
    );
  }

  const cookieStore = await cookies();
  const orgId = cookieStore.get("ig_org_id")?.value;
  if (!orgId) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/connections", request.url),
    );
  }

  try {
    const shortToken = await exchangeCodeForShortToken(code);
    const { access_token, expires_in } =
      await exchangeForLongLivedToken(shortToken);
    const { igUserId, handle, name, profilePicUrl } =
      await getIgAccount(access_token);

    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    // Upsert SocialAccount
    const existing = await db.socialAccount.findFirst({
      where: { orgId, platform: "INSTAGRAM" },
    });

    let socialAccountId: string;
    if (existing) {
      await db.socialAccount.update({
        where: { id: existing.id },
        data: {
          platformId: igUserId,
          handle,
          accessToken: access_token,
          tokenExpiresAt,
          deletedAt: null,
        },
      });
      socialAccountId = existing.id;
    } else {
      socialAccountId = ids.acc();
      await db.socialAccount.create({
        data: {
          id: socialAccountId,
          orgId,
          platform: "INSTAGRAM",
          platformId: igUserId,
          handle,
          accessToken: access_token,
          tokenExpiresAt,
        },
      });
    }

    // Upsert InstagramAccount
    const existingIg = await db.instagramAccount.findFirst({
      where: { orgId },
    });

    if (existingIg) {
      await db.instagramAccount.update({
        where: { id: existingIg.id },
        data: {
          igUserId,
          handle,
          name,
          profilePicUrl,
          accessToken: access_token,
          tokenExpiresAt,
          deletedAt: null,
        },
      });
    } else {
      await db.instagramAccount.create({
        data: {
          id: ids.igacc(),
          orgId,
          socialAccountId,
          igUserId,
          handle,
          name,
          profilePicUrl,
          accessToken: access_token,
          tokenExpiresAt,
        },
      });
    }

    // Trigger immediate sync
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/inngest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "instagram/sync.requested",
        data: { orgId },
      }),
    });

    cookieStore.delete("ig_org_id");
  } catch {
    // Log and redirect; don't expose error to user
  }

  return NextResponse.redirect(
    new URL("/dashboard/analytics/instagram", request.url),
  );
}
