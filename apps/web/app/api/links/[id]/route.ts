import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  db,
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { org } = await getAuthContext();
    const body = (await req.json()) as {
      title?: string;
      url?: string;
      isActive?: boolean;
    };

    const data: Prisma.LinkUpdateManyMutationInput = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.url !== undefined) data.url = body.url;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const result = await db.link.updateMany({
      where: { id: params.id, orgId: org.id, deletedAt: null },
      data,
    });

    if (result.count === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { org } = await getAuthContext();

    const result = await db.link.updateMany({
      where: { id: params.id, orgId: org.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
