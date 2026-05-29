import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createSupabaseServerClient,
  db,
  ids,
  getOrgContext,
  UnauthorizedError,
  ForbiddenError,
} from "@ivy/db";
import type { Prisma } from "@ivy/db";

async function getAuthContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();
  return getOrgContext(user.id);
}

export async function GET() {
  try {
    const { org } = await getAuthContext();

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

    return NextResponse.json(linkPage);
  } catch (err) {
    if (err instanceof UnauthorizedError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { org } = await getAuthContext();
    const body = (await req.json()) as {
      displayName?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
      coverImageUrl?: string | null;
      accentColor?: string | null;
      theme?: string;
      isPublished?: boolean;
    };

    const data: Prisma.LinkPageUpdateInput = {};
    if ("displayName" in body) data.displayName = body.displayName ?? null;
    if ("bio" in body) data.bio = body.bio ?? null;
    if ("avatarUrl" in body) data.avatarUrl = body.avatarUrl ?? null;
    if ("coverImageUrl" in body)
      data.coverImageUrl = body.coverImageUrl ?? null;
    if ("accentColor" in body) data.accentColor = body.accentColor ?? null;
    if ("theme" in body && body.theme !== undefined) data.theme = body.theme;
    if ("isPublished" in body && body.isPublished !== undefined)
      data.isPublished = body.isPublished;

    const linkPage = await db.linkPage.update({
      where: { orgId: org.id },
      data,
    });

    revalidatePath(`/${linkPage.username}`);
    return NextResponse.json(linkPage);
  } catch (err) {
    if (err instanceof UnauthorizedError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
