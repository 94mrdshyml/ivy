import { notFound } from "next/navigation";
import { db } from "@ivy/db";
import { PublicPageClient } from "./public-page-client";

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const pages = await db.linkPage.findMany({
      where: { isPublished: true, deletedAt: null },
      select: { username: true },
    });
    return pages.map((p) => ({ username: p.username }));
  } catch {
    return [];
  }
}

interface Props {
  params: { username: string };
}

export default async function PublicPage({ params }: Props) {
  const linkPage = await db.linkPage.findUnique({
    where: { username: params.username },
    include: {
      links: {
        where: { isActive: true, deletedAt: null },
        orderBy: { position: "asc" },
      },
      socialProfiles: {
        where: { deletedAt: null },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!linkPage || !linkPage.isPublished || linkPage.deletedAt) {
    notFound();
  }

  return <PublicPageClient page={linkPage} />;
}
