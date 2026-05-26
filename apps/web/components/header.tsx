"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/analytics/instagram": "Instagram Analytics",
  "/dashboard/analytics/facebook": "Facebook Analytics",
  "/dashboard/analytics/youtube": "YouTube Analytics",
  "/dashboard/link-in-bio": "Link in Bio",
  "/dashboard/crm": "CRM",
  "/dashboard/dm": "DM Automation",
  "/dashboard/settings/profile": "Profile",
  "/dashboard/settings/connections": "Connections",
  "/dashboard/settings/billing": "Billing",
};

interface HeaderProps {
  userName: string | null;
  userEmail: string;
}

export function Header({ userName, userEmail }: HeaderProps) {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Ivy";

  return (
    <header
      className="fixed left-60 right-0 top-0 flex h-14 items-center justify-between border-b border-white/10 px-6"
      style={{ backgroundColor: "#08090C" }}
    >
      <h1 className="text-sm font-semibold text-white">{title}</h1>
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
        {(userName ?? userEmail).charAt(0).toUpperCase()}
      </div>
    </header>
  );
}
