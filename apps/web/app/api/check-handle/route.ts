import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@ivy/db";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ available: false });

  const existing = await db.organization.findUnique({ where: { slug } });
  return NextResponse.json({ available: !existing });
}
