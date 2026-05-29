import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient, db } from "@ivy/db";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/social-icons";
import { DisconnectButton } from "./disconnect-button";
import { ExternalLink, Link as LinkIcon } from "lucide-react";

const platforms = [
  {
    key: "INSTAGRAM" as const,
    label: "Instagram",
    icon: InstagramIcon,
    color: "#E1306C",
    connectHref: "/api/instagram/connect",
  },
  {
    key: "FACEBOOK" as const,
    label: "Facebook",
    icon: FacebookIcon,
    color: "#1877F2",
    connectHref: null,
  },
  {
    key: "YOUTUBE" as const,
    label: "YouTube",
    icon: YoutubeIcon,
    color: "#FF0000",
    connectHref: null,
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

  const linkPage = dbUser
    ? await db.linkPage.findFirst({
        where: { org: { members: { some: { userId: dbUser.id } } } },
      })
    : null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="max-w-lg">
      <h2 className="mb-1 text-xl font-semibold text-white">Connections</h2>
      <p className="mb-8 text-sm text-white/50">
        Connect your social accounts to unlock analytics
      </p>

      <div className="space-y-3">
        {platforms.map(({ key, label, icon: Icon, color, connectHref }) => {
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

              {isConnected ? (
                <DisconnectButton platform={label} />
              ) : connectHref ? (
                <Link
                  href={connectHref}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/5"
                >
                  Connect
                </Link>
              ) : (
                <button
                  disabled
                  className="cursor-not-allowed rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/30"
                >
                  Coming soon
                </button>
              )}
            </div>
          );
        })}

        {/* Link in Bio row */}
        <div
          className="flex items-center justify-between rounded-xl border border-white/10 px-5 py-4"
          style={{ backgroundColor: "#15161E" }}
        >
          <div className="flex items-center gap-3">
            <LinkIcon size={20} color="#00D97E" />
            <div>
              <p className="text-sm font-medium text-white">Link in Bio</p>
              {linkPage ? (
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {appUrl}/{linkPage.username}
                </p>
              ) : (
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Not set up yet
                </p>
              )}
            </div>
          </div>

          <Link
            href="/dashboard/link-in-bio"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/5"
          >
            <ExternalLink size={12} /> Manage
          </Link>
        </div>
      </div>
    </div>
  );
}
