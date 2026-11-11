"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { daysUntilDate, formatRegistryDate } from "@/lib/registry-dates";

export function RegistryExpiryCell({ value }: { value: string | null }) {
  const locale = useLocale();
  const t = useTranslations("Expiry");
  const days = daysUntilDate(value);

  if (!value || days === null) {
    return <span className="text-sm text-muted-foreground">{t("notSpecified")}</span>;
  }

  if (days < 0) {
    return (
      <div className="space-y-1">
        <p className="font-medium text-rose-700">
          {formatRegistryDate(value, locale)}
        </p>
        <Badge variant="destructive">{t("expired")}</Badge>
      </div>
    );
  }

  if (days <= 30) {
    return (
      <div className="space-y-1">
        <p className="font-medium text-amber-800">
          {formatRegistryDate(value, locale)}
        </p>
        <Badge className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
          {days === 0 ? t("expiresToday") : t("daysRemaining", { count: days })}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="font-medium text-foreground">
        {formatRegistryDate(value, locale)}
      </p>
      <Badge variant="secondary" className="bg-emerald-50 text-emerald-800">
        {t("active")}
      </Badge>
    </div>
  );
}
