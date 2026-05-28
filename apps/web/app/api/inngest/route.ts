import { serve } from "inngest/next";
import { Inngest } from "inngest";
import { db, ids } from "@ivy/db";

export const inngest = new Inngest({ id: "ivy" });

const GRAPH = "https://graph.facebook.com/v19.0";

type InsightValue = { value: number; end_time: string };
type InsightEntry = { name: string; values: InsightValue[] };

async function fetchAccountInsights(igUserId: string, accessToken: string) {
  const since = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const until = Math.floor(Date.now() / 1000);
  const metrics = [
    "follower_count",
    "impressions",
    "reach",
    "profile_views",
    "accounts_engaged",
    "website_clicks",
  ].join(",");

  const res = await fetch(
    `${GRAPH}/${igUserId}/insights?` +
      new URLSearchParams({
        metric: metrics,
        period: "day",
        since: String(since),
        until: String(until),
        access_token: accessToken,
      }).toString(),
  );
  const data = (await res.json()) as { data: InsightEntry[] };
  return data.data ?? [];
}

type MediaItem = {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
};

async function fetchMedia(
  igUserId: string,
  accessToken: string,
): Promise<MediaItem[]> {
  const res = await fetch(
    `${GRAPH}/${igUserId}/media?` +
      new URLSearchParams({
        fields:
          "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
        limit: "50",
        access_token: accessToken,
      }).toString(),
  );
  const data = (await res.json()) as { data: MediaItem[] };
  return data.data ?? [];
}

type MediaInsights = {
  reach?: number;
  impressions?: number;
  saved?: number;
  shares?: number;
};

async function fetchMediaInsights(
  mediaId: string,
  accessToken: string,
  mediaType: string,
): Promise<MediaInsights> {
  const metrics =
    mediaType === "STORY"
      ? "reach,impressions"
      : "reach,impressions,saved,shares";
  const res = await fetch(
    `${GRAPH}/${mediaId}/insights?` +
      new URLSearchParams({
        metric: metrics,
        access_token: accessToken,
      }).toString(),
  );
  const data = (await res.json()) as {
    data: Array<{ name: string; values: Array<{ value: number }> }>;
  };
  const result: MediaInsights = {};
  for (const entry of data.data ?? []) {
    const val = entry.values[0]?.value ?? 0;
    if (entry.name === "reach") result.reach = val;
    if (entry.name === "impressions") result.impressions = val;
    if (entry.name === "saved") result.saved = val;
    if (entry.name === "shares") result.shares = val;
  }
  return result;
}

async function syncAccount(account: {
  id: string;
  orgId: string;
  igUserId: string;
  accessToken: string;
}) {
  const insights = await fetchAccountInsights(
    account.igUserId,
    account.accessToken,
  );

  const dateMap = new Map<string, Record<string, number>>();
  for (const metric of insights) {
    for (const point of metric.values) {
      const date = point.end_time.slice(0, 10);
      if (!dateMap.has(date)) dateMap.set(date, {});
      dateMap.get(date)![metric.name] = point.value;
    }
  }

  for (const [dateStr, vals] of dateMap.entries()) {
    const date = new Date(dateStr);
    const existing = await db.instagramMetric.findFirst({
      where: { instagramAccountId: account.id, date },
    });
    const data = {
      orgId: account.orgId,
      instagramAccountId: account.id,
      date,
      followersCount: vals["follower_count"] ?? null,
      impressions: vals["impressions"] ?? null,
      reach: vals["reach"] ?? null,
      profileViews: vals["profile_views"] ?? null,
      accountsEngaged: vals["accounts_engaged"] ?? null,
      websiteClicks: vals["website_clicks"] ?? null,
    };
    if (existing) {
      await db.instagramMetric.update({ where: { id: existing.id }, data });
    } else {
      await db.instagramMetric.create({ data: { id: ids.igmet(), ...data } });
    }
  }

  const media = await fetchMedia(account.igUserId, account.accessToken);
  for (const item of media) {
    const postInsights = await fetchMediaInsights(
      item.id,
      account.accessToken,
      item.media_type,
    );
    const likes = item.like_count ?? 0;
    const comments = item.comments_count ?? 0;
    const shares = postInsights.shares ?? 0;
    const saves = postInsights.saved ?? 0;
    const reach = postInsights.reach ?? 0;
    const engagementRate =
      reach > 0 ? ((likes + comments + shares + saves) / reach) * 100 : 0;
    const postData = {
      orgId: account.orgId,
      instagramAccountId: account.id,
      igMediaId: item.id,
      mediaType: item.media_type,
      caption: item.caption ?? null,
      mediaUrl: item.media_url ?? null,
      thumbnailUrl: item.thumbnail_url ?? null,
      permalink: item.permalink ?? null,
      timestamp: new Date(item.timestamp),
      likes,
      comments,
      shares,
      saves,
      reach,
      impressions: postInsights.impressions ?? null,
      engagementRate,
    };
    const existing = await db.instagramPost.findFirst({
      where: { igMediaId: item.id },
    });
    if (existing) {
      await db.instagramPost.update({
        where: { id: existing.id },
        data: postData,
      });
    } else {
      await db.instagramPost.create({ data: { id: ids.igpst(), ...postData } });
    }
  }

  await db.instagramAccount.update({
    where: { id: account.id },
    data: { lastSyncedAt: new Date() },
  });
}

const instagramSync = inngest.createFunction(
  { id: "instagram-sync", concurrency: { limit: 5 } },
  [{ event: "instagram/sync.requested" }, { cron: "0 * * * *" }],
  async ({ event, step }) => {
    const accounts = await step.run("fetch-accounts", async () => {
      if (event && "data" in event && event.data?.orgId) {
        return db.instagramAccount.findMany({
          where: { orgId: event.data.orgId as string, deletedAt: null },
        });
      }
      return db.instagramAccount.findMany({ where: { deletedAt: null } });
    });

    for (const account of accounts) {
      await step.run(`sync-${account.id}`, () => syncAccount(account));
      await step.run(`audit-${account.id}`, () =>
        db.auditLog.create({
          data: {
            id: ids.aud(),
            orgId: account.orgId,
            action: "instagram.sync",
            resourceType: "InstagramAccount",
            resourceId: account.id,
            metadata: { syncedAt: new Date().toISOString() },
          },
        }),
      );
    }
  },
);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [instagramSync],
});
