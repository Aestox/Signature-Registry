"use client";

import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export function AdminSignOut() {
  const t = useTranslations("SignOut");
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <Button variant="outline" size="lg" onClick={signOut}>
      <LogOut aria-hidden="true" />
      {t("label")}
    </Button>
  );
}
