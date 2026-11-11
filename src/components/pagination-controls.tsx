"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("Pagination");

  return (
    <nav
      aria-label={t("label")}
      className="flex items-center justify-end gap-3 border-t px-5 py-3"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {t("previous")}
      </Button>
      <span className="text-sm text-muted-foreground" aria-live="polite">
        {t("status", { current: currentPage, total: totalPages })}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t("next")}
      </Button>
    </nav>
  );
}
