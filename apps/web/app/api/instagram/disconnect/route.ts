import { createSupabaseServerClient, db, getOrgContext } from "@ivy/db";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { org } = await getOrgContext(user.id);

  await db.instagramAccount.updateMany({
    where: { orgId: org.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
