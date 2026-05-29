"use server";

import { db } from "@ivy/db";
import { redirect } from "next/navigation";

export async function completeOnboarding(
  userId: string,
  firstName: string,
  lastName: string,
  handle: string,
) {
  await db.user.update({
    where: { id: userId },
    data: { firstName: firstName || null, lastName: lastName || null },
  });

  const membership = await db.membership.findFirst({ where: { userId } });

  if (membership) {
    const slug = handle.replace(/^@/, "").toLowerCase();
    await db.organization.update({
      where: { id: membership.orgId },
      data: { slug, name: slug },
    });
  }

  redirect("/dashboard");
}
