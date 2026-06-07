"use client";

import { useTranslations } from "next-intl";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommunityAdaptation } from "@/types/community";
import {
  humaniseCommunityTag,
  labelFromOptions,
  useCommunityTranslatedOptions,
} from "./community-i18n-options";
import {
  changeMeta,
  resolveChange,
  summaryLabels,
  type ChangeKind,
} from "./community-routine-detail-helpers";
import {
  Badge,
  CommunityAdaptResultSkeleton,
  InlineSpinner,
} from "./community-shared";

type CommunityRoutineShelfCheckProps = {
  adaptation: CommunityAdaptation | null;
  isError: boolean;
  isPending: boolean;
  onCheck: () => void;
};

export function CommunityRoutineShelfCheck({
  adaptation,
  isError,
  isPending,
  onCheck,
}: CommunityRoutineShelfCheckProps) {
  const t = useTranslations("community.routineDetail");
  const options = useCommunityTranslatedOptions();

  return (
    <section className="rounded-2xl border border-ai-border bg-ai-bg/30 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="inline-flex items-center gap-2 font-display text-base font-bold tracking-tight text-foreground">
            <Sparkles className="h-4 w-4 text-ai-strong" aria-hidden />
            {t("adaptTitle")}
          </h2>
          <p className="mt-1.5 max-w-xl text-xs leading-5 text-muted">
            {t("adaptBody")}
          </p>
        </div>
        <Button
          size="sm"
          onClick={onCheck}
          disabled={isPending}
          className="shrink-0"
        >
          {isPending ? <InlineSpinner /> : <Wand2 className="h-4 w-4" />}
          {isPending
            ? t("adapting")
            : adaptation
              ? t("adaptAgain")
              : t("adaptAction")}
        </Button>
      </div>

      {isPending && !adaptation ? <CommunityAdaptResultSkeleton /> : null}

      {adaptation ? (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {Object.entries(adaptation.summary).map(([key, value]) => {
              const meta =
                summaryLabels[key.toLowerCase()] ?? {
                  labelKey: "summary.kept",
                  kind: "kept" as ChangeKind,
                };
              const palette = changeMeta[meta.kind];
              return (
                <div
                  key={key}
                  className={cn(
                    "min-w-0 rounded-xl border px-3 py-2.5",
                    palette.accent,
                  )}
                >
                  <div className="font-display text-2xl font-bold leading-none text-foreground">
                    {value}
                  </div>
                  <div className="mt-1 truncate text-[11px] font-medium text-muted">
                    {t(meta.labelKey)}
                  </div>
                </div>
              );
            })}
          </div>

          <ol className="overflow-hidden rounded-2xl border border-border bg-surface">
            {adaptation.changes.map((change, index) => {
              const kind = resolveChange(change.changeType);
              const palette = changeMeta[kind];
              const productLabel = change.targetProductName
                ? `${change.targetProductBrand ?? ""} ${change.targetProductName}`.trim()
                : (labelFromOptions(options.productCategories, change.category) ??
                  humaniseCommunityTag(change.category));
              return (
                <li
                  key={`${change.stepOrder}-${change.changeType}`}
                  className={cn(
                    "px-4 py-3",
                    index < adaptation.changes.length - 1 &&
                      "border-b border-border",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        palette.badge === "accent" &&
                          "bg-accent text-surface",
                        palette.badge === "ai" &&
                          "bg-ai-strong text-surface",
                        palette.badge === "warning" &&
                          "bg-warning text-surface",
                        palette.badge === "muted" &&
                          "bg-surface-muted text-muted",
                      )}
                    >
                      <palette.Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-xs font-semibold text-muted">
                        {t("changeStep", {
                          step: change.stepOrder,
                          label: t(palette.labelKey),
                        })}
                      </span>
                      <Badge tone={palette.badge}>
                        {t(`changeType.${kind}`)}
                      </Badge>
                    </div>
                  </div>
                  <p
                    className="ml-10 mt-1.5 break-words text-sm font-medium text-foreground [overflow-wrap:anywhere]"
                    title={productLabel}
                  >
                    {productLabel}
                  </p>
                  {change.reason ? (
                    <p className="ml-10 mt-0.5 break-words text-xs leading-5 text-muted [overflow-wrap:anywhere]">
                      {change.reason}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>

          <p className="border-t border-border pt-4 text-xs leading-5 text-muted">
            {t("previewOnlyHint")}
          </p>
        </div>
      ) : isError ? (
        <p
          className="mt-4 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {t("adaptError")}
        </p>
      ) : null}
    </section>
  );
}
