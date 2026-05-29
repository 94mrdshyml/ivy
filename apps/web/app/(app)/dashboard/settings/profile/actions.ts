"use server";

import { db } from "@ivy/db";
import { revalidatePath } from "next/cache";

export async function saveProfile(
  userId: string,
  orgId: string,
  firstName: string,
  lastName: string,
  slug: string,
) {
  await db.user.update({
    where: { id: userId },
    data: { firstName: firstName || null, lastName: lastName || null },
  });
  await db.organization.update({ where: { id: orgId }, data: { slug } });
  revalidatePath("/dashboard/settings/profile");
}
