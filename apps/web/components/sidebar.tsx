"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link as LinkIcon,
  Users,
  MessageSquare,
  Settings,
} from "lucide-react";
import { InstagramIcon, FacebookIcon, YoutubeIcon } from "./social-icons";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const nav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Instagram",
    href: "/dashboard/analytics/instagram",
    icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: "/dashboard/analytics/facebook",
    icon: FacebookIcon,
  },
  { label: "YouTube", href: "/dashboard/analytics/youtube", icon: YoutubeIcon },
  { label: "Link in Bio", href: "/dashboard/link-in-bio", icon: LinkIcon },
  { label: "CRM", href: "/dashboard/crm", icon: Users },
  { label: "DM Automation", href: "/dashboard/dm", icon: MessageSquare },
];

interface SidebarProps {
  displayName: string;
  userEmail: string;
}

export function Sidebar({ displayName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-white/10"
      style={{ backgroundColor: "#08090C" }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: "rgba(0,217,126,0.15)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="#00D97E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white">Ivy</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {nav.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
              style={{
                color: active ? "#00D97E" : "rgba(255,255,255,0.55)",
                backgroundColor: active
                  ? "rgba(0,217,126,0.06)"
                  : "transparent",
                borderLeft: active
                  ? "2px solid #00D97E"
                  : "2px solid transparent",
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-white/40">{userEmail}</p>
          </div>
          <Link
            href="/dashboard/settings/profile"
            className="text-white/40 hover:text-white/70"
          >
            <Settings size={14} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
