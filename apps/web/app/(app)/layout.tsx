import { redirect } from "next/navigation";
import { createSupabaseServerClient, db, getDisplayName } from "@ivy/db";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await db.user.findUnique({ where: { authId: user.id } });

  const displayName = dbUser
    ? getDisplayName({ ...dbUser, email: user.email! })
    : user.email!;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#08090C" }}>
      <Sidebar displayName={displayName} userEmail={user.email!} />
      <Header displayName={displayName} />
      <main className="ml-60 pt-14">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
