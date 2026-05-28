import { db } from "./client";
import { Role } from "@prisma/client";

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

export async function getOrgContext(userId: string) {
  if (!userId) throw new UnauthorizedError();

  const membership = await db.membership.findFirst({
    where: { userId, deletedAt: null },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) throw new ForbiddenError();

  return {
    org: membership.org,
    role: membership.role as Role,
    userId,
  };
}
