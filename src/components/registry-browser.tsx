"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  CalendarDays,
  FileCheck2,
  FileKey2,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RegistryExpiryCell } from "@/components/registry-expiry-cell";
import { PaginationControls } from "@/components/pagination-controls";
import { Link } from "@/i18n/navigation";
import { daysUntilDate } from "@/lib/registry-dates";
import { REGISTRY_PAGE_SIZE } from "@/lib/registry-pagination";
import { filterRegistryRecords } from "@/lib/registry-search";

export type PublicRegistryRecord = {
  id: number;
  fullName: string;
  position: string | null;
  depot: string | null;
  expiryDate: string | null;
  mchdExpiryDate: string | null;
};

export function RegistryBrowser({
  records,
  isAdmin,
}: {
  records: PublicRegistryRecord[];
  isAdmin: boolean;
}) {
  const t = useTranslations("PublicPage");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const filteredRecords = useMemo(
    () => filterRegistryRecords(records, query),
    [query, records],
  );
  const expiringSoon = records.filter((record) => {
    const certificateDays = daysUntilDate(record.expiryDate);
    const mchdDays = daysUntilDate(record.mchdExpiryDate);
    return (
      (certificateDays !== null && certificateDays >= 0 && certificateDays <= 30) ||
      (mchdDays !== null && mchdDays >= 0 && mchdDays <= 30)
    );
  }).length;
  const totalPages = Math.ceil(filteredRecords.length / REGISTRY_PAGE_SIZE);
  const pageRecords = filteredRecords.slice(
    (currentPage - 1) * REGISTRY_PAGE_SIZE,
    currentPage * REGISTRY_PAGE_SIZE,
  );

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 pb-16 sm:px-8 lg:px-12">
      <section className="relative isolate overflow-hidden rounded-3xl bg-[#122a43] px-6 py-10 text-white shadow-[0_24px_70px_-38px_rgba(18,42,67,0.65)] sm:px-10 sm:py-14">
        <div className="absolute -right-20 -top-32 -z-10 size-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-36 left-1/3 -z-10 size-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium tracking-wide text-cyan-100">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {t("publicLabel")}
          </div>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            {t("heroDescription")}
          </p>
          <a
            href="#registry"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#122a43] transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t("goToRegistry")}
            <ArrowDownWideNarrow className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="pointer-events-none absolute bottom-8 right-10 hidden size-44 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] lg:flex">
          <div className="flex size-28 items-center justify-center rounded-full border border-cyan-100/20 bg-cyan-100/10">
            <FileKey2 className="size-12 text-cyan-100" strokeWidth={1.4} />
          </div>
        </div>
      </section>

      <section
        aria-label={t("summaryLabel")}
        className="grid gap-4 py-7 sm:grid-cols-3"
      >
        <SummaryCard
          icon={UsersRound}
          label={t("recordCountLabel")}
          value={records.length}
          detail={t("activeEntries")}
        />
        <SummaryCard
          icon={FileCheck2}
          label={t("certificatesLabel")}
          value={records.filter((record) => record.expiryDate).length}
          detail={t("withExpiry")}
        />
        <SummaryCard
          icon={CalendarDays}
          label={t("expiringSoon")}
          value={expiringSoon}
          detail={t("next30Days")}
          highlight={expiringSoon > 0}
        />
      </section>

      <section id="registry" className="scroll-mt-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{t("registryLabel")}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {t("employeesTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("publicFieldsNotice")}
            </p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              className="h-10 bg-white pl-9"
            />
          </div>
        </div>

        <Card className="overflow-hidden border-border/80 py-0 shadow-sm">
          <CardHeader className="border-b bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("recordsTitle")}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {t("visibleOfTotal", {
                  visible: pageRecords.length,
                  total: filteredRecords.length,
                })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredRecords.length ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="min-w-52 pl-5">{t("employee")}</TableHead>
                        <TableHead className="min-w-40">{t("position")}</TableHead>
                        <TableHead className="min-w-36">{t("department")}</TableHead>
                        <TableHead className="min-w-40">{t("certificateExpiry")}</TableHead>
                        <TableHead className="min-w-40 pr-5">{t("mchdExpiry")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="pl-5 font-medium">
                            {record.fullName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.position || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.depot || "—"}
                          </TableCell>
                          <TableCell>
                            <RegistryExpiryCell value={record.expiryDate} />
                          </TableCell>
                          <TableCell className="pr-5">
                            <RegistryExpiryCell value={record.mchdExpiryDate} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Search className="size-5 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-medium">
                  {records.length ? t("noResults") : t("emptyRegistry")}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {records.length
                    ? t("noResultsHint")
                    : t("emptyRegistryHint")}
                </p>
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setQuery("");
                      setCurrentPage(1);
                    }}
                  >
                    {t("resetSearch")}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <footer className="mt-8 flex flex-col gap-3 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{t("footer")}</p>
        <Link
          href={isAdmin ? "/admin" : "/admin/login"}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          {isAdmin ? t("adminReturn") : t("adminLogin")}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </footer>
    </main>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  highlight = false,
}: {
  icon: typeof UsersRound;
  label: string;
  value: number;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        highlight
          ? "border-amber-200 bg-amber-50/50 shadow-sm"
          : "border-border/80 bg-white shadow-sm"
      }
    >
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${
            highlight
              ? "bg-amber-100 text-amber-800"
              : "bg-primary/5 text-primary"
          }`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}
