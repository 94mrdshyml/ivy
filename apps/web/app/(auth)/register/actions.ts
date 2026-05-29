"use server";

import { db, ids } from "@ivy/db";

interface CreateUserRecordsParams {
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  orgName: string;
  username: string;
}

export async function createUserRecords({
  authUserId,
  email,
  firstName,
  lastName,
  orgName,
  username,
}: CreateUserRecordsParams) {
  const existingUser = await db.user.findUnique({
    where: { authId: authUserId },
  });
  if (existingUser) return { userId: existingUser.id };

  const userId = ids.usr();
  const orgId = ids.org();
  const memId = ids.mem();

  const slug = username.toLowerCase().replace(/[^a-z0-9-]/g, "");

  await db.$transaction([
    db.user.create({
      data: { id: userId, authId: authUserId, email, firstName, lastName },
    }),
    db.organization.create({
      data: { id: orgId, name: orgName, slug },
    }),
    db.membership.create({
      data: { id: memId, orgId, userId, role: "OWNER" },
    }),
  ]);

  return { userId, orgId };
}

export async function checkUsernameAvailable(
  username: string,
): Promise<boolean> {
  const slug = username.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug) return false;
  const existing = await db.organization.findUnique({ where: { slug } });
  return !existing;
}
