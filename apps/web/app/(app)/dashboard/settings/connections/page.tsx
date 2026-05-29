import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createSupabaseServerClient, db } from "@ivy/db";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/social-icons";
import { DisconnectButton } from "./disconnect-button";
import { ConnectionsToast } from "./connections-toast";
import { ExternalLink, Link as LinkIcon } from "lucide-react";

export default async function ConnectionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await db.user.findUnique({ where: { authId: user.id } });

  const instagramAccount = dbUser
    ? await db.instagramAccount.findFirst({
        where: { org: { members: { some: { userId: dbUser.id } } } },
      })
    : null;

  const linkPage = dbUser
    ? await db.linkPage.findFirst({
        where: { org: { members: { some: { userId: dbUser.id } } } },
      })
    : null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="max-w-lg">
      <Suspense>
        <ConnectionsToast />
      </Suspense>

      <h2 className="mb-1 text-xl font-semibold text-text-primary">
        Connections
      </h2>
      <p className="mb-8 text-sm text-text-secondary">
        Connect your social accounts to start pulling analytics.
      </p>

      <div className="space-y-3">
        {/* Instagram */}
        <div
          className="rounded-ds-lg border border-border-default px-5 py-4"
          style={{ backgroundColor: "#15161E" }}
        >
          {instagramAccount ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {instagramAccount.igProfilePicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={instagramAccount.igProfilePicUrl}
                    alt={instagramAccount.igUsername}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-3">
                    <InstagramIcon size={18} color="#E1306C" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    @{instagramAccount.igUsername}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-text-secondary">
                      {instagramAccount.igFollowersCount != null
                        ? `${instagramAccount.igFollowersCount.toLocaleString()} followers`
                        : "Instagram"}
                    </span>
                    {instagramAccount.igAccountType && (
                      <span className="rounded-ds-sm bg-ivy-dim px-1.5 py-0.5 text-[10px] font-medium text-ivy">
                        {instagramAccount.igAccountType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <DisconnectButton platform="Instagram" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <InstagramIcon size={20} color="#E1306C" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Instagram
                  </p>
                  <p className="text-xs text-text-muted">Not connected</p>
                </div>
              </div>
              <Link
                href="/api/instagram/connect"
                className="rounded-ds-md border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-3"
              >
                Connect
              </Link>
            </div>
          )}
        </div>

        {/* Facebook */}
        <div
          className="flex items-center justify-between rounded-ds-lg border border-border-default px-5 py-4"
          style={{ backgroundColor: "#15161E" }}
        >
          <div className="flex items-center gap-3">
            <FacebookIcon size={20} color="#1877F2" />
            <div>
              <p className="text-sm font-medium text-text-primary">Facebook</p>
              <p className="text-xs text-text-muted">Not connected</p>
            </div>
          </div>
          <button
            disabled
            className="cursor-not-allowed rounded-ds-md border border-border-default px-3 py-1.5 text-xs font-medium text-text-disabled"
          >
            Coming soon
          </button>
        </div>

        {/* YouTube */}
        <div
          className="flex items-center justify-between rounded-ds-lg border border-border-default px-5 py-4"
          style={{ backgroundColor: "#15161E" }}
        >
          <div className="flex items-center gap-3">
            <YoutubeIcon size={20} color="#FF0000" />
            <div>
              <p className="text-sm font-medium text-text-primary">YouTube</p>
              <p className="text-xs text-text-muted">Not connected</p>
            </div>
          </div>
          <button
            disabled
            className="cursor-not-allowed rounded-ds-md border border-border-default px-3 py-1.5 text-xs font-medium text-text-disabled"
          >
            Coming soon
          </button>
        </div>

        {/* Link in Bio */}
        <div
          className="flex items-center justify-between rounded-ds-lg border border-border-default px-5 py-4"
          style={{ backgroundColor: "#15161E" }}
        >
          <div className="flex items-center gap-3">
            <LinkIcon size={20} color="#00D97E" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                Link in Bio
              </p>
              {linkPage ? (
                <p className="text-xs text-text-muted">
                  {appUrl}/{linkPage.username}
                </p>
              ) : (
                <p className="text-xs text-text-muted">Not set up yet</p>
              )}
            </div>
          </div>
          <Link
            href="/dashboard/link-in-bio"
            className="flex items-center gap-1.5 rounded-ds-md border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-3"
          >
            <ExternalLink size={12} /> Manage
          </Link>
        </div>
      </div>
    </div>
  );
}
