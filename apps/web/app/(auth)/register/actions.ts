"use server";

import { db, ids } from "@ivy/db";

export async function createUserRecords(authUserId: string, email: string) {
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) return { userId: existingUser.id };

  const userId = ids.usr();
  const orgId = ids.org();
  const memId = ids.mem();

  const slug =
    email
      .split("@")[0]!
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6);

  await db.user.create({
    data: { id: userId, email },
  });

  await db.organization.create({
    data: { id: orgId, name: "My Workspace", slug },
  });

  await db.membership.create({
    data: { id: memId, orgId, userId, role: "OWNER" },
  });

  return { userId, orgId };
}
