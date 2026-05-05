"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { exportSuggestionHistoryCsv } from "@/services/suggestions.service";
import type { SuggestionHistoryListQuery } from "@/types/suggestions";

type HistoryExportButtonProps = {
  query: SuggestionHistoryListQuery;
  disabled?: boolean;
};

export function HistoryExportButton({
  query,
  disabled = false,
}: HistoryExportButtonProps) {
  const t = useTranslations("history.page");
  const [isExporting, setIsExporting] = useState(false);
  const canExport = !disabled && !isExporting;

  async function handleExport() {
    if (!canExport) return;
    setIsExporting(true);
    try {
      const blob = await exportSuggestionHistoryCsv(query);
      downloadHistoryBlob(blob);
    } catch {
      toast.error(t("exportError"));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={t("export")}
      disabled={!canExport}
      onClick={handleExport}
    >
      {isExporting ? (
        <LoadingIndicator size="sm" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">{t("export")}</span>
    </Button>
  );
}

function downloadHistoryBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ritora-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
