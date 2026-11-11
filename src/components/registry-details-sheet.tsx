"use client";

import { Eye } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { daysUntilDate } from "@/lib/registry-dates";
import type { registryRecords } from "@/lib/db/schema";
import type { ReactNode } from "react";

type RegistryRecord = typeof registryRecords.$inferSelect;

export function RegistryDetailsSheet({
  record,
}: {
  record: RegistryRecord;
}) {
  const locale = useLocale();
  const t = useTranslations("Details");
  const customFields = Object.entries(record.customFields);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg">
          <Eye aria-hidden="true" />
          {t("open")}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="text-lg">{record.fullName}</SheetTitle>
          <SheetDescription>
            {[record.position, record.depot].filter(Boolean).join(" · ") ||
              t("employeeCard")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap gap-2 border-b px-5 py-3">
          <Badge
            variant={record.isFired ? "destructive" : "secondary"}
            className={
              record.isFired
                ? ""
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }
          >
            {record.isFired ? t("fired") : t("employeeActive")}
          </Badge>
          <ExpiryBadge label={locale === "ru" ? "ЭП" : "Signature"} value={record.expiryDate} />
          <ExpiryBadge label={locale === "ru" ? "МЧД" : "PoA"} value={record.mchdExpiryDate} />
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <DetailSection title={t("employee")}>
            <DetailGrid
              locale={locale}
              yes={t("yes")}
              no={t("no")}
              items={[
                [t("fullName"), record.fullName],
                [t("position"), record.position],
                [t("email"), record.email],
                [t("department"), record.depot],
                [
                  t("employeeStatus"),
                  record.isFired ? t("fired") : t("employeeActive"),
                ],
                [
                  t("conturPlace"),
                  record.placeConturExtern ? t("yes") : t("no"),
                ],
              ]}
            />
          </DetailSection>

          <DetailSection title={t("certificate")}>
            <DetailGrid
              locale={locale}
              yes={t("yes")}
              no={t("no")}
              items={[
                [t("certificateType"), record.certificateType],
                [t("serialNumber"), record.serialNumber],
                [t("certificateStatus"), record.certificateStatus],
                [t("issueDate"), record.issueDate],
                [t("expiryDate"), record.expiryDate],
                [t("certificationCenter"), record.certificationCenter],
                [t("platform"), record.platform],
              ]}
            />
          </DetailSection>

          <DetailSection title={t("mchd")}>
            <DetailGrid
              locale={locale}
              yes={t("yes")}
              no={t("no")}
              items={[
                [t("account"), record.mchd],
                [t("issueDate"), record.mchdIssueDate],
                [t("expiryDate"), record.mchdExpiryDate],
              ]}
            />
          </DetailSection>

          <DetailSection title={t("contractAndNotes")}>
            <DetailGrid
              locale={locale}
              yes={t("yes")}
              no={t("no")}
              items={[
                [t("contract"), record.contract],
                [t("notes"), record.notes],
              ]}
            />
          </DetailSection>

          <DetailSection title={t("customFields")}>
            {customFields.length ? (
              <DetailGrid
                locale={locale}
                yes={t("yes")}
                no={t("no")}
                items={customFields.map(([name, value]) => [
                  name,
                  formatValue(value, locale, t("yes"), t("no")),
                ])}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("noCustomFields")}
              </p>
            )}
          </DetailSection>

          <DetailSection title={t("recordInfo")}>
            <DetailGrid
              locale={locale}
              yes={t("yes")}
              no={t("no")}
              items={[
                [t("createdAt"), formatDateTime(record.createdAt, locale)],
                [t("updatedAt"), formatDateTime(record.updatedAt, locale)],
              ]}
            />
          </DetailSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="border-b pb-2 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function DetailGrid({
  items,
  locale,
  yes,
  no,
}: {
  items: [string, unknown][];
  locale: string;
  yes: string;
  no: string;
}) {
  return (
    <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0 space-y-1">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="break-words text-sm font-medium">
            {formatValue(value, locale, yes, no)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function formatValue(
  value: unknown,
  locale: string,
  yes: string,
  no: string,
): ReactNode {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? yes : no;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, day));
  }
  if (value instanceof Date) return formatDateTime(value, locale);
  return String(value);
}

function formatDateTime(value: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function ExpiryBadge({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  const t = useTranslations("Details");
  const days = daysUntilDate(value);
  if (days === null) {
    return (
      <Badge variant="secondary">
        {t("noExpiry", { label })}
      </Badge>
    );
  }
  if (days < 0) {
    return (
      <Badge variant="destructive">
        {t("expiredBadge", { label })}
      </Badge>
    );
  }
  if (days <= 30) {
    return (
      <Badge
        variant="outline"
        className="border-amber-300 bg-amber-50 text-amber-900"
      >
        {days === 0
          ? t("expiresTodayBadge", { label })
          : t("daysRemainingBadge", { label, count: days })}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-emerald-200 bg-emerald-50 text-emerald-800"
    >
      {t("activeBadge", { label })}
    </Badge>
  );
}
