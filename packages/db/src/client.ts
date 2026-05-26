import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

db.$use(async (params, next) => {
  const readOps = ["findUnique", "findFirst", "findMany"];
  if (params.model && readOps.includes(params.action)) {
    if (!params.args) params.args = {};
    if (!params.args.where) params.args.where = {};
    params.args.where.deletedAt = null;
  }
  return next(params);
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
