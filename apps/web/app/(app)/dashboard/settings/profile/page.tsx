import { redirect } from "next/navigation";
import { createSupabaseServerClient, db } from "@ivy/db";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await db.user.findUnique({ where: { email: user.email! } });

  const membership = dbUser
    ? await db.membership.findFirst({
        where: { userId: dbUser.id },
        include: { org: true },
      })
    : null;

  return (
    <div className="max-w-lg">
      <h2 className="mb-1 text-xl font-semibold text-white">Profile</h2>
      <p className="mb-8 text-sm text-white/50">
        Update your personal info and handle
      </p>
      <ProfileForm
        userId={dbUser?.id ?? ""}
        orgId={membership?.orgId ?? ""}
        initialFirstName={dbUser?.firstName ?? ""}
        initialLastName={dbUser?.lastName ?? ""}
        initialSlug={membership?.org.slug ?? ""}
        avatarUrl={dbUser?.avatarUrl ?? null}
      />
    </div>
  );
}
