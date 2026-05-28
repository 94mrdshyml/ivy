import { MessageSquare } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function DmPage() {
  return (
    <ComingSoon
      icon={MessageSquare}
      title="DM Automation"
      description="Set up automated DM flows to engage followers and respond to triggers instantly."
    />
  );
}
