import { NextRequest, NextResponse } from "next/server";
import { db, ids } from "@ivy/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const link = await db.link.findFirst({
    where: { id: params.id, isActive: true, deletedAt: null },
  });

  if (!link) return NextResponse.json({ ok: true });

  const country = req.headers.get("x-vercel-ip-country") ?? null;
  const referrer = req.headers.get("referer") ?? null;
  const ua = req.headers.get("user-agent") ?? "";

  let device = "desktop";
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
    device = /iPad/i.test(ua) ? "tablet" : "mobile";
  }

  await db.linkClick.create({
    data: {
      id: ids.lclk(),
      orgId: link.orgId,
      linkId: link.id,
      country,
      device,
      referrer,
    },
  });

  return NextResponse.json({ ok: true });
}
