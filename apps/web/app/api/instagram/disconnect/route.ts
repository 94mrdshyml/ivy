import { NextResponse } from "next/server";
import { createSupabaseServerClient, db } from "@ivy/db";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await db.user.findUnique({ where: { authId: user.id } });
  const membership = dbUser
    ? await db.membership.findFirst({ where: { userId: dbUser.id } })
    : null;

  if (!membership)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();

  await db.socialAccount.updateMany({
    where: { orgId: membership.orgId, platform: "INSTAGRAM" },
    data: { deletedAt: now },
  });

  await db.instagramAccount.updateMany({
    where: { orgId: membership.orgId },
    data: { deletedAt: now },
  });

  return NextResponse.json({ ok: true });
}
