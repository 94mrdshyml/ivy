const META_VERSION = "v19.0";
const META_BASE = `https://graph.facebook.com/${META_VERSION}`;

export function getOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    scope: [
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights",
      "pages_show_list",
      "pages_read_engagement",
      "business_management",
    ].join(","),
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/dialog/oauth?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch(`${META_BASE}/oauth/access_token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: process.env.META_REDIRECT_URI!,
      code,
    }),
  });
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token)
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<{ token: string; expiresAt: Date }> {
  const res = await fetch(
    `${META_BASE}/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        fb_exchange_token: shortLivedToken,
      }),
  );
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token)
    throw new Error(
      `Long-lived token exchange failed: ${JSON.stringify(data)}`,
    );
  const expiresAt = new Date(Date.now() + (data.expires_in ?? 5184000) * 1000);
  return { token: data.access_token, expiresAt };
}

export async function getInstagramAccountFromToken(accessToken: string) {
  const pagesRes = await fetch(
    `${META_BASE}/me/accounts?access_token=${accessToken}&fields=id,name,instagram_business_account`,
  );
  const pages = (await pagesRes.json()) as {
    data?: Array<{
      id: string;
      name: string;
      instagram_business_account?: { id: string };
    }>;
  };

  const page = pages.data?.find((p) => p.instagram_business_account);
  if (!page)
    throw new Error(
      "No Instagram Business account found on this Facebook profile",
    );

  const igId = page.instagram_business_account!.id;

  const igRes = await fetch(
    `${META_BASE}/${igId}?fields=id,username,name,profile_picture_url,account_type,followers_count&access_token=${accessToken}`,
  );
  const ig = (await igRes.json()) as {
    id: string;
    username: string;
    name?: string;
    profile_picture_url?: string;
    account_type?: string;
    followers_count?: number;
    error?: { message: string };
  };
  if (ig.error)
    throw new Error(`Instagram account fetch failed: ${ig.error.message}`);
  return ig;
}
