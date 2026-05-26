import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = db;
}

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
