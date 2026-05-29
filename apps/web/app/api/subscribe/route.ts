import { NextRequest, NextResponse } from "next/server";
import { db, ids } from "@ivy/db";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };

    if (!body.username || !body.email) {
      return NextResponse.json(
        { error: "username and email required" },
        { status: 400 },
      );
    }

    const linkPage = await db.linkPage.findUnique({
      where: { username: body.username },
      select: { id: true, orgId: true, isPublished: true },
    });

    if (!linkPage || !linkPage.isPublished) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const existing = await db.subscriber.findUnique({
      where: {
        linkPageId_email: { linkPageId: linkPage.id, email: body.email },
      },
    });

    if (existing) {
      return NextResponse.json({ alreadySubscribed: true });
    }

    await db.subscriber.create({
      data: {
        id: ids.sub(),
        orgId: linkPage.orgId,
        linkPageId: linkPage.id,
        email: body.email,
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
      },
    });

    return NextResponse.json({ subscribed: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
