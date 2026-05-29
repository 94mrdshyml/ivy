import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  db,
  ids,
  getOrgContext,
  UnauthorizedError,
  ForbiddenError,
} from "@ivy/db";

async function getAuthContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();
  return getOrgContext(user.id);
}

export async function POST(req: NextRequest) {
  try {
    const { org } = await getAuthContext();
    const body = (await req.json()) as { title: string; url: string };

    const linkPage = await db.linkPage.findUnique({ where: { orgId: org.id } });
    if (!linkPage)
      return NextResponse.json(
        { error: "No link page found" },
        { status: 404 },
      );

    const maxPositionResult = await db.link.aggregate({
      where: { linkPageId: linkPage.id, deletedAt: null },
      _max: { position: true },
    });
    const nextPosition = (maxPositionResult._max.position ?? -1) + 1;

    const link = await db.link.create({
      data: {
        id: ids.lnk(),
        orgId: org.id,
        linkPageId: linkPage.id,
        title: body.title,
        url: body.url,
        position: nextPosition,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
