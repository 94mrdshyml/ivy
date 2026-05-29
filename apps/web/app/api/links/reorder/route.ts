import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  db,
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

  const dbUser = await db.user.findUnique({ where: { email: user.email! } });
  if (!dbUser) throw new UnauthorizedError();

  return getOrgContext(dbUser.id);
}

export async function PUT(req: NextRequest) {
  try {
    const { org } = await getAuthContext();
    const body = (await req.json()) as {
      links: { id: string; position: number }[];
    };

    await db.$transaction(
      body.links.map(({ id, position }) =>
        db.link.updateMany({
          where: { id, orgId: org.id, deletedAt: null },
          data: { position },
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthorizedError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
