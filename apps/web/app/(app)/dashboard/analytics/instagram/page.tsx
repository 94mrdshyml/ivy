import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createSupabaseServerClient, db } from "@ivy/db";
import { InstagramIcon } from "@/components/social-icons";
import { DateRangeSelector } from "./date-range-selector";
import { MetricsRow } from "./metric-cards";
import {
  FollowerGrowthChart,
  ReachImpressionsChart,
  EngagementChart,
} from "./charts";
import { ContentTable } from "./content-table";

function sum(arr: (number | null | undefined)[]) {
  return arr.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

function lastVal(arr: (number | null | undefined)[]) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null) return arr[i] ?? 0;
  }
  return 0;
}

export default async function InstagramAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await db.user.findUnique({ where: { authId: user.id } });
  const membership = dbUser
    ? await db.membership.findFirst({ where: { userId: dbUser.id } })
    : null;

  const igAccount = membership
    ? await db.instagramAccount.findFirst({
        where: { orgId: membership.orgId, deletedAt: null },
      })
    : null;

  // ── Not connected ──
  if (!igAccount) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, #E1306C 0%, #833AB4 50%, #F77737 100%)",
          }}
        >
          <InstagramIcon size={26} color="#fff" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white">
          Connect your Instagram account
        </h2>
        <p className="mb-6 max-w-xs text-sm text-white/50">
          Connect your account to start seeing your analytics.
        </p>
        <Link
          href="/api/instagram/connect"
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-black"
          style={{ backgroundColor: "#00D97E" }}
        >
          Connect Instagram
        </Link>
      </div>
    );
  }

  // ── Connected ──
  const { range: rawRange } = await searchParams;
  const rangeDays = Number(rawRange) || 30;

  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(now.getDate() - rangeDays);
  const prevStart = new Date(periodStart);
  prevStart.setDate(periodStart.getDate() - rangeDays);

  const [metrics, prevMetrics, posts] = await Promise.all([
    db.instagramMetric.findMany({
      where: { instagramAccountId: igAccount.id, date: { gte: periodStart } },
      orderBy: { date: "asc" },
    }),
    db.instagramMetric.findMany({
      where: {
        instagramAccountId: igAccount.id,
        date: { gte: prevStart, lt: periodStart },
      },
      orderBy: { date: "asc" },
    }),
    db.instagramPost.findMany({
      where: {
        instagramAccountId: igAccount.id,
        timestamp: { gte: periodStart },
      },
      orderBy: { reach: "desc" },
    }),
  ]);

  // Metric totals
  const cur = {
    followers: lastVal(metrics.map((m) => m.followersCount)),
    reach: sum(metrics.map((m) => m.reach)),
    impressions: sum(metrics.map((m) => m.impressions)),
    profileViews: sum(metrics.map((m) => m.profileViews)),
    accountsEngaged: sum(metrics.map((m) => m.accountsEngaged)),
  };
  const prev = {
    followers: lastVal(prevMetrics.map((m) => m.followersCount)),
    reach: sum(prevMetrics.map((m) => m.reach)),
    impressions: sum(prevMetrics.map((m) => m.impressions)),
    profileViews: sum(prevMetrics.map((m) => m.profileViews)),
    accountsEngaged: sum(prevMetrics.map((m) => m.accountsEngaged)),
  };

  // Chart data
  const chartData = metrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    followers: m.followersCount ?? 0,
    reach: m.reach ?? 0,
    impressions: m.impressions ?? 0,
  }));

  const engagementData = [
    { name: "Likes", value: sum(posts.map((p) => p.likes)) },
    { name: "Comments", value: sum(posts.map((p) => p.comments)) },
    { name: "Shares", value: sum(posts.map((p) => p.shares)) },
    { name: "Saves", value: sum(posts.map((p) => p.saves)) },
  ];

  const tableData = posts.map((p) => ({
    id: p.id,
    mediaType: p.mediaType,
    caption: p.caption,
    thumbnailUrl: p.thumbnailUrl,
    mediaUrl: p.mediaUrl,
    reach: p.reach ?? 0,
    likes: p.likes ?? 0,
    comments: p.comments ?? 0,
    shares: p.shares ?? 0,
    saves: p.saves ?? 0,
    engagementRate: p.engagementRate ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Instagram Analytics
          </h2>
          <p className="mt-0.5 text-sm text-white/50">@{igAccount.handle}</p>
        </div>
        <Suspense>
          <DateRangeSelector current={String(rangeDays)} />
        </Suspense>
      </div>

      {/* Metrics */}
      <MetricsRow
        followers={cur.followers}
        reach={cur.reach}
        impressions={cur.impressions}
        profileViews={cur.profileViews}
        accountsEngaged={cur.accountsEngaged}
        prevFollowers={prev.followers}
        prevReach={prev.reach}
        prevImpressions={prev.impressions}
        prevProfileViews={prev.profileViews}
        prevAccountsEngaged={prev.accountsEngaged}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FollowerGrowthChart data={chartData} />
        <ReachImpressionsChart data={chartData} />
      </div>

      <EngagementChart data={engagementData} />

      {/* Content table */}
      <ContentTable posts={tableData} />
    </div>
  );
}
