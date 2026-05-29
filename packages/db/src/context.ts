import { db } from "./client";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}
export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
  }
}

export async function getOrgContext(authId: string) {
  if (!authId) throw new UnauthorizedError();

  const user = await db.user.findUnique({ where: { authId } });
  if (!user) throw new UnauthorizedError();

  const membership = await db.membership.findFirst({
    where: { userId: user.id, deletedAt: null },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) throw new ForbiddenError();

  return { user, org: membership.org, role: membership.role };
}
