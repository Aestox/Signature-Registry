"use client";

import { hasLocale } from "next-intl";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Language");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        if (hasLocale(routing.locales, value)) {
          router.replace(pathname, { locale: value });
        }
      }}
    >
      <SelectTrigger
        size="default"
        aria-label={t("label")}
        className="!h-9 w-24 min-w-24 bg-white px-1.5 text-sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        side="bottom"
        align="end"
        className="w-(--radix-select-trigger-width) min-w-0 max-w-(--radix-select-trigger-width)"
      >
        {routing.locales.map((option) => (
          <SelectItem key={option} value={option}>
            {t(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
