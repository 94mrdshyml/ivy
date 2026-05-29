"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function ConnectionsToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "instagram") {
      toast.success("Instagram connected successfully");
    } else if (error === "oauth_denied") {
      toast.error("Instagram connection cancelled");
    } else if (error === "invalid_state") {
      toast.error("Connection failed — please try again");
    } else if (error === "connection_failed") {
      toast.error(
        "Could not connect Instagram account. Check your account type (Business or Creator required).",
      );
    }

    if (connected || error) {
      router.replace(pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
