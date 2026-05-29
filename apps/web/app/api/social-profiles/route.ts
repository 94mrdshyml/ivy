import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  db,
  ids,
  getOrgContext,
  UnauthorizedError,
  ForbiddenError,
  type SocialPlatform,
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
    const body = (await req.json()) as {
      platform: SocialPlatform;
      url: string;
    };

    const linkPage = await db.linkPage.findUnique({ where: { orgId: org.id } });
    if (!linkPage)
      return NextResponse.json(
        { error: "No link page found" },
        { status: 404 },
      );

    const maxPositionResult = await db.socialProfile.aggregate({
      where: { linkPageId: linkPage.id, deletedAt: null },
      _max: { position: true },
    });
    const nextPosition = (maxPositionResult._max.position ?? -1) + 1;

    const profile = await db.socialProfile.create({
      data: {
        id: ids.sp(),
        orgId: org.id,
        linkPageId: linkPage.id,
        platform: body.platform,
        url: body.url,
        position: nextPosition,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
