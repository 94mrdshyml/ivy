import { redirect } from "next/navigation";
import { createSupabaseServerClient, db } from "@ivy/db";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/social-icons";

const platforms = [
  {
    key: "INSTAGRAM" as const,
    label: "Instagram",
    icon: InstagramIcon,
    color: "#E1306C",
  },
  {
    key: "FACEBOOK" as const,
    label: "Facebook",
    icon: FacebookIcon,
    color: "#1877F2",
  },
  {
    key: "YOUTUBE" as const,
    label: "YouTube",
    icon: YoutubeIcon,
    color: "#FF0000",
  },
];

export default async function ConnectionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await db.user.findUnique({ where: { email: user.email! } });

  const accounts = dbUser
    ? await db.socialAccount.findMany({
        where: { org: { members: { some: { userId: dbUser.id } } } },
      })
    : [];

  const connected = new Set(accounts.map((a) => a.platform));

  return (
    <div className="max-w-lg">
      <h2 className="mb-1 text-xl font-semibold text-white">Connections</h2>
      <p className="mb-8 text-sm text-white/50">
        Connect your social accounts to unlock analytics
      </p>

      <div className="space-y-3">
        {platforms.map(({ key, label, icon: Icon, color }) => {
          const isConnected = connected.has(key);
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-white/10 px-5 py-4"
              style={{ backgroundColor: "#15161E" }}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} color={color} />
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p
                    className="text-xs"
                    style={{
                      color: isConnected ? "#00D97E" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {isConnected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              <button
                disabled
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/50 opacity-50 cursor-not-allowed"
              >
                {isConnected ? "Disconnect" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-white/30">
        Platform OAuth connections coming in Session 2b.
      </p>
    </div>
  );
}
