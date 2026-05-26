"use server";

import { db } from "@ivy/db";
import { revalidatePath } from "next/cache";

export async function saveProfile(
  userId: string,
  orgId: string,
  name: string,
  slug: string,
) {
  await db.user.update({ where: { id: userId }, data: { name } });
  await db.organization.update({ where: { id: orgId }, data: { slug } });
  revalidatePath("/dashboard/settings/profile");
}
