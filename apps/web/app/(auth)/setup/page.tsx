import { redirect } from "next/navigation";
import { createSupabaseServerClient, db } from "@ivy/db";
import { SetupForm } from "./setup-form";

export default async function SetupPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const existingUser = await db.user.findUnique({ where: { authId: user.id } });
  if (existingUser) redirect("/dashboard");

  return <SetupForm email={user.email!} />;
}
