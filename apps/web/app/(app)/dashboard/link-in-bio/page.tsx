import { redirect } from "next/navigation";
import { createSupabaseServerClient, db, ids } from "@ivy/db";
import { LinkInBioEditor } from "./editor";

export default async function LinkInBioPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await db.user.findUnique({ where: { email: user.email! } });
  if (!dbUser) redirect("/login");

  const membership = await db.membership.findFirst({
    where: { userId: dbUser.id, deletedAt: null },
    include: { org: true },
  });
  if (!membership) redirect("/login");

  const org = membership.org;

  let linkPage = await db.linkPage.findUnique({
    where: { orgId: org.id },
    include: {
      links: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
      },
      socialProfiles: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!linkPage) {
    linkPage = await db.linkPage.create({
      data: {
        id: ids.lp(),
        orgId: org.id,
        username: org.slug,
        displayName: null,
      },
      include: {
        links: true,
        socialProfiles: true,
      },
    });
  }

  // Analytics: total clicks + last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalClicks, recentClicks, clicksByDay] = await Promise.all([
    db.linkClick.count({ where: { orgId: org.id } }),
    db.linkClick.count({
      where: { orgId: org.id, createdAt: { gte: thirtyDaysAgo } },
    }),
    db.linkClick.groupBy({
      by: ["createdAt"],
      where: { orgId: org.id, createdAt: { gte: thirtyDaysAgo } },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Clicks per link
  const linkClickCounts = await db.linkClick.groupBy({
    by: ["linkId"],
    where: { orgId: org.id },
    _count: true,
    orderBy: { _count: { linkId: "desc" } },
  });

  const linkClickMap: Record<string, number> = {};
  for (const row of linkClickCounts) {
    linkClickMap[row.linkId] = row._count;
  }

  // Build daily chart data for last 30 days
  const dailyData: { date: string; clicks: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyData.push({ date: key, clicks: 0 });
  }
  for (const row of clicksByDay) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    const entry = dailyData.find((d) => d.date === key);
    if (entry) entry.clicks += row._count;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <LinkInBioEditor
      linkPage={linkPage}
      totalClicks={totalClicks}
      recentClicks={recentClicks}
      dailyData={dailyData}
      linkClickMap={linkClickMap}
      appUrl={appUrl}
    />
  );
}
