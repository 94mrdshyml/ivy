import { CreditCard } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function BillingPage() {
  return (
    <ComingSoon
      icon={CreditCard}
      title="Billing"
      description="Manage your subscription, view invoices, and upgrade your plan."
    />
  );
}
