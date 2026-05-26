import { Users } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function CrmPage() {
  return (
    <ComingSoon
      icon={Users}
      title="CRM"
      description="Manage your followers, segment your audience, and track relationships at scale."
    />
  );
}
