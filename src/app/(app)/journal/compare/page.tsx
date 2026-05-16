"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeftRight, Images, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";
import { useCompareDays, usePhotoDates } from "@/hooks/use-skin-journal";
import { BackButton } from "@/components/skin-journal/back-button";
import { PhotoFrame } from "@/components/skin-journal/photo-frame";
import { Chip } from "@/components/skin-journal/chip";
import { JournalCompareSkeleton } from "@/components/skin-journal/journal-loading-skeletons";
import { formatJournalShortDate } from "@/components/skin-journal/journal-date";
import { PhotoDatePicker } from "@/components/skin-journal/photo-date-picker";
import { safeDynamicTranslation } from "@/components/skin-journal/safe-translation";
import { useJournalUiStore } from "@/stores/journal-ui-store";
import type { CompareResponse } from "@/types/skin-journal";

type CompareDeltaBullet = CompareResponse["delta"]["bullets"][number];

function deltaText(
  bullet: CompareDeltaBullet,
  t: ReturnType<typeof useTranslations>,
  tConcerns: ReturnType<typeof useTranslations>,
): string {
  if (bullet.code === "reaction_cleared") {
    return t("delta.reactionCleared");
  }
  if (bullet.code === "no_major_change") {
    return t("delta.noMajorChange");
  }
  const concern = bullet.concern
    ? safeDynamicTranslation(
        tConcerns,
        bullet.concern,
        bullet.concern.replace(/_/g, " "),
      )
    : t("delta.unknownConcern");
  const values = {
    concern,
    from: bullet.from_rating ?? 0,
    to: bullet.to_rating ?? 0,
  };
  return bullet.code === "rating_improved"
    ? t("delta.ratingImproved", values)
    : t("delta.ratingWorsened", values);
}

function detectedConcernItems(
  entry: CompareResponse["from"],
): NonNullable<
  NonNullable<CompareResponse["from"]>["analysis_observations"]
>["detected_concerns"] {
  return entry?.analysis_observations?.detected_concerns ?? [];
}

export default function JournalComparePage() {
  const t = useTranslations("journal.compare");
  const tDayDetail = useTranslations("journal.dayDetail");
  const tConcerns = useTranslations("journal.concerns");
  const tSeverity = useTranslations("journal.severity");
  const locale = useLocale();
  const compareFrom = useJournalUiStore((state) => state.compareFrom);
  const compareTo = useJournalUiStore((state) => state.compareTo);

  const [fromDraft, setFrom] = useState<string | null>(compareFrom);
  const [toDraft, setTo] = useState<string | null>(compareTo);
  const { data: photoDateIndex, isLoading: photoDatesLoading } =
    usePhotoDates();
  const sortedPhotoDates = [...(photoDateIndex?.dates ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const hasEnoughPhotoDates = sortedPhotoDates.length >= 2;
  const photoDateSet = new Set(sortedPhotoDates.map((item) => item.date));
  const defaultTo = hasEnoughPhotoDates
    ? (sortedPhotoDates[0]?.date ?? null)
    : null;
  const defaultFrom = hasEnoughPhotoDates
    ? (sortedPhotoDates.find((item) => item.date !== defaultTo)?.date ?? null)
    : null;
  const to = toDraft && photoDateSet.has(toDraft) ? toDraft : defaultTo;
  let from = fromDraft && photoDateSet.has(fromDraft) ? fromDraft : defaultFrom;
  if (from && to && from === to) {
    from = sortedPhotoDates.find((item) => item.date !== to)?.date ?? null;
  }
  const canCompare =
    hasEnoughPhotoDates &&
    !!from &&
    !!to &&
    from !== to &&
    photoDateSet.has(from) &&
    photoDateSet.has(to);
  const fromLabel = from ? formatJournalShortDate(from, locale) : "";
  const toLabel = to ? formatJournalShortDate(to, locale) : "";

  const { data, isLoading: compareLoading } = useCompareDays(from, to, {
    enabled: canCompare,
  });

  const swap = () => {
    if (!from || !to) return;
    setFrom(to);
    setTo(from);
  };

  const days =
    from && to
      ? Math.abs(
          Math.round(
            (new Date(`${to}T00:00:00Z`).getTime() -
              new Date(`${from}T00:00:00Z`).getTime()) /
              86400000,
          ),
        )
      : 0;

  if (photoDatesLoading || (canCompare && compareLoading)) {
    return <JournalCompareSkeleton />;
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        leading={
          <BackButton
            href={AppRoute.Journal}
            label={tDayDetail("backToJournal")}
          />
        }
      />

      {!canCompare || !photoDateIndex || !hasEnoughPhotoDates ? (
        <div className="mx-auto mt-4 max-w-5xl rounded-2xl border border-dashed border-border bg-surface-muted p-8 text-center">
          <p className="text-sm font-bold">{t("notEnoughTitle")}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            {t("notEnoughBody")}
          </p>
        </div>
      ) : (
        <>
          <div className="mx-auto mt-3 flex max-w-5xl flex-wrap items-center gap-2 sm:justify-end">
            <div className="min-w-0 flex-1 sm:w-[180px] sm:flex-none">
              <PhotoDatePicker
                value={from}
                onChange={setFrom}
                label={t("fromLabel")}
                photoDates={photoDateIndex}
                disabledDate={to}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("swap")}
              onClick={swap}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1 sm:w-[180px] sm:flex-none">
              <PhotoDatePicker
                value={to}
                onChange={setTo}
                label={t("toLabel")}
                photoDates={photoDateIndex}
                disabledDate={from}
              />
            </div>
          </div>

          <div className="mx-auto mt-4 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-bold">{fromLabel}</p>
              <PhotoFrame
                url={data?.from?.photo_url ?? null}
                alt={t("fromPhotoAlt", { date: fromLabel })}
                aspect="square"
              />
              {data?.from ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1 font-semibold text-foreground">
                    <Images className="h-3 w-3" />
                    {t("angleCount", { count: data.from.angle_count ?? 1 })}
                  </span>
                  {(data.from.angle_count ?? 1) > 1 ? (
                    <Link
                      href={`/journal/days/${data.from.entry_date}`}
                      className="font-semibold text-accent-strong underline-offset-4 hover:underline"
                    >
                      {t("openFullViewer")}
                    </Link>
                  ) : null}
                </div>
              ) : null}
              {data?.from ? (
                <div className="rounded-2xl border border-border bg-surface-muted p-3">
                  <p className="text-sm font-semibold">{t("concernsThen")}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {detectedConcernItems(data.from).length > 0 ? (
                      detectedConcernItems(data.from).map((c, idx) => (
                        <Chip
                          key={`${c.concern}-${idx}`}
                          variant={
                            c.severity === "severe" ||
                            c.severity === "moderate"
                              ? "warning"
                              : "default"
                          }
                          selected
                        >
                          {safeDynamicTranslation(
                            tConcerns,
                            c.concern,
                            c.concern.replace(/_/g, " "),
                          )}{" "}
                          · {tSeverity(c.severity)}
                        </Chip>
                      ))
                    ) : (
                      <Chip>{t("none")}</Chip>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold">{toLabel}</p>
              <PhotoFrame
                url={data?.to?.photo_url ?? null}
                alt={t("toPhotoAlt", { date: toLabel })}
                fallbackTone="cool"
                aspect="square"
              />
              {data?.to ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1 font-semibold text-foreground">
                    <Images className="h-3 w-3" />
                    {t("angleCount", { count: data.to.angle_count ?? 1 })}
                  </span>
                  {(data.to.angle_count ?? 1) > 1 ? (
                    <Link
                      href={`/journal/days/${data.to.entry_date}`}
                      className="font-semibold text-accent-strong underline-offset-4 hover:underline"
                    >
                      {t("openFullViewer")}
                    </Link>
                  ) : null}
                </div>
              ) : null}
              {data?.to ? (
                <div className="rounded-2xl border border-border bg-surface-muted p-3">
                  <p className="text-sm font-semibold">{t("concernsNow")}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {detectedConcernItems(data.to).length > 0 ? (
                      detectedConcernItems(data.to).map((c, idx) => (
                        <Chip key={`${c.concern}-${idx}`} selected>
                          {safeDynamicTranslation(
                            tConcerns,
                            c.concern,
                            c.concern.replace(/_/g, " "),
                          )}{" "}
                          · {tSeverity(c.severity)}
                        </Chip>
                      ))
                    ) : (
                      <Chip>{t("none")}</Chip>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div
            className="mx-auto mt-4 max-w-5xl rounded-2xl border p-4"
            style={{
              borderColor: "var(--ai-border)",
              background:
                "linear-gradient(180deg, var(--ai-soft), transparent 50%)",
            }}
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--ai-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--ai-fg)]">
              <Sparkles className="h-3 w-3" />
              {t("aiDeltaBadge")}
            </span>
            <p className="mt-1.5 text-sm font-semibold">
              {t("deltaTitle", { days })}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
              {data?.delta.bullets.map((bullet, idx) => (
                <li
                  key={idx}
                  className={
                    bullet.tone === "good"
                      ? "text-accent-strong"
                      : bullet.tone === "warn"
                        ? "text-[color:var(--warning)]"
                        : "text-muted"
                  }
                >
                  {deltaText(bullet, t, tConcerns)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted">
              <strong className="text-foreground">
                {t("medicalDisclaimerStrong")}
              </strong>{" "}
              {t("medicalDisclaimerBody")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
