"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { PaginationControls } from "@/components/pagination-controls";
import { RegistryDeleteButton } from "@/components/registry-delete-button";
import { RegistryDetailsSheet } from "@/components/registry-details-sheet";
import { RegistryEditor } from "@/components/registry-editor";
import { RegistryExpiryCell } from "@/components/registry-expiry-cell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { REGISTRY_PAGE_SIZE } from "@/lib/registry-pagination";
import { filterRegistryRecords } from "@/lib/registry-search";
import type { registryRecords } from "@/lib/db/schema";

type RegistryRecord = typeof registryRecords.$inferSelect;

export function AdminRegistryTable({
  records,
}: {
  records: RegistryRecord[];
}) {
  const t = useTranslations("AdminPage");
  const publicT = useTranslations("PublicPage");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const filteredRecords = useMemo(
    () => filterRegistryRecords(records, query),
    [query, records],
  );
  const totalPages = Math.ceil(filteredRecords.length / REGISTRY_PAGE_SIZE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  const pageRecords = filteredRecords.slice(
    (page - 1) * REGISTRY_PAGE_SIZE,
    page * REGISTRY_PAGE_SIZE,
  );

  return (
    <section className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">{t("allRecords")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("privateFieldsNotice")}
            </p>
          </div>
          <RegistryEditor />
        </div>
        <div className="relative mt-4 w-full sm:max-w-sm">
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
            placeholder={publicT("searchPlaceholder")}
            aria-label={publicT("searchLabel")}
            className="h-9 bg-white pl-9"
          />
        </div>
      </div>
      {filteredRecords.length ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-5">{t("employee")}</TableHead>
                <TableHead>{t("department")}</TableHead>
                <TableHead className="min-w-40">{t("certificateExpiry")}</TableHead>
                <TableHead className="min-w-40">{t("mchdExpiry")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="pr-5 text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="pl-5 font-medium">
                    <div>{record.fullName}</div>
                    {record.position && (
                      <div className="mt-1 text-xs font-normal text-muted-foreground">
                        {record.position}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{record.depot || "—"}</TableCell>
                  <TableCell>
                    <RegistryExpiryCell value={record.expiryDate} />
                  </TableCell>
                  <TableCell>
                    <RegistryExpiryCell value={record.mchdExpiryDate} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.isFired ? "destructive" : "secondary"}>
                      {record.isFired ? t("fired") : t("active")}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <RegistryDetailsSheet record={record} />
                      <RegistryEditor record={record} />
                      <RegistryDeleteButton
                        id={record.id}
                        fullName={record.fullName}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <Search className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-medium">
            {records.length ? publicT("noResults") : t("emptyTitle")}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {records.length ? publicT("noResultsHint") : t("emptyHint")}
          </p>
          {query && (
            <Button
              variant="ghost"
              size="lg"
              className="mt-3"
              onClick={() => {
                setQuery("");
                setCurrentPage(1);
              }}
            >
              {publicT("resetSearch")}
            </Button>
          )}
        </div>
      )}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
}
