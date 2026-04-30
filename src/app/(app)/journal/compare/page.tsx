"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeftRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { AppRoute } from "@/constants/app-routes";
import { useCompareDays } from "@/hooks/use-skin-journal";
import { BackButton } from "@/components/skin-journal/back-button";
import { PhotoFrame } from "@/components/skin-journal/photo-frame";
import { Chip } from "@/components/skin-journal/chip";
import { JournalCompareSkeleton } from "@/components/skin-journal/journal-loading-skeletons";
import { formatJournalShortDate } from "@/components/skin-journal/journal-date";
import { safeDynamicTranslation } from "@/components/skin-journal/safe-translation";

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function thirtyDaysAgo(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 30);
  return d.toISOString().slice(0, 10);
}

export default function JournalComparePage() {
  const t = useTranslations("journal.compare");
  const tDayDetail = useTranslations("journal.dayDetail");
  const tConcerns = useTranslations("journal.concerns");
  const tSeverity = useTranslations("journal.severity");
  const locale = useLocale();

  const [from, setFrom] = useState(thirtyDaysAgo());
  const [to, setTo] = useState(todayYmd());
  const fromLabel = formatJournalShortDate(from, locale);
  const toLabel = formatJournalShortDate(to, locale);

  const { data, isLoading } = useCompareDays(from, to);

  const swap = () => {
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

  if (isLoading) {
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

      <div className="mx-auto mt-3 flex max-w-5xl flex-wrap items-center gap-2 sm:justify-end">
        <div className="min-w-0 flex-1 sm:w-[180px] sm:flex-none">
          <DatePicker value={from} onChange={setFrom} ariaLabel={t("fromLabel")} />
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
          <DatePicker value={to} onChange={setTo} ariaLabel={t("toLabel")} />
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
            <div className="rounded-2xl border border-border bg-surface-muted p-3">
              <p className="text-sm font-semibold">{t("concernsThen")}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {data.from.analysis_observations?.detected_concerns?.map(
                  (c, idx) => (
                    <Chip
                      key={idx}
                      variant={
                        c.severity === "severe" || c.severity === "moderate"
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
                  ),
                ) ?? <Chip>{t("none")}</Chip>}
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
            <div className="rounded-2xl border border-border bg-surface-muted p-3">
              <p className="text-sm font-semibold">{t("concernsNow")}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {data.to.analysis_observations?.detected_concerns?.map(
                  (c, idx) => (
                    <Chip key={idx} selected>
                      {safeDynamicTranslation(
                        tConcerns,
                        c.concern,
                        c.concern.replace(/_/g, " "),
                      )}{" "}
                      · {tSeverity(c.severity)}
                    </Chip>
                  ),
                ) ?? <Chip>{t("none")}</Chip>}
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
              {bullet.text}
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
    </div>
  );
}
