"use client";

import Link from "next/link";
import { History, Hourglass, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { RoutineBreak } from "@/types/suggestions";

type Props = {
  hasData: boolean;
  routineBreak: RoutineBreak | null | undefined;
  onQuickSuggestion: () => void;
  onStartBreak: () => void;
};

export function TodayPageHeaderActions({
  hasData,
  routineBreak,
  onQuickSuggestion,
  onStartBreak,
}: Props) {
  const t = useTranslations("todaysSuggestion.page");
  return (
    <div className="flex shrink-0 gap-1.5">
      {hasData && !routineBreak ? (
        <Button
          type="button"
          size="sm"
          aria-label={t("quickSuggestion")}
          onClick={onQuickSuggestion}
          className="w-7 px-0 sm:w-auto sm:px-4"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("quickSuggestion")}</span>
        </Button>
      ) : null}
      {hasData && !routineBreak ? (
        <Button
          type="button"
          size="sm"
          aria-label={t("takeBreak")}
          onClick={onStartBreak}
          className="w-7 border border-[color:var(--note-warm-border)] bg-[color:var(--note-warm-bg)] px-0 text-[color:var(--note-warm-fg)] shadow-none hover:bg-[color:var(--note-warm-bg)] hover:opacity-90 sm:w-auto sm:px-4"
        >
          <Hourglass className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("takeBreak")}</span>
        </Button>
      ) : null}
      <Button
        asChild
        variant="outline"
        size="sm"
        aria-label={t("history")}
        className="w-7 px-0 sm:w-auto sm:px-4"
      >
        <Link href="/history">
          <History className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("history")}</span>
        </Link>
      </Button>
    </div>
  );
}
