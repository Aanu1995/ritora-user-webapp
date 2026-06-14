"use client";

import {
  Check,
  Loader2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ProductIntroductionStatus,
  type ProductIntroduction,
  type UpdateProductIntroductionPayload,
} from "@/types/shelf";
import { ProductIntroductionInfoDialog } from './product-introduction-info-dialog';
import {
  PRODUCT_INTRODUCTION_JOURNEY,
  PRODUCT_INTRODUCTION_OFF_RAMP,
  PRODUCT_INTRODUCTION_STATUS_META,
  PRODUCT_INTRODUCTION_TONE,
} from './product-introduction-status-data';

type ProductIntroductionBadgeProps = {
  introduction?: ProductIntroduction | null;
  className?: string;
};

export function ProductIntroductionBadge({
  introduction,
  className,
}: ProductIntroductionBadgeProps) {
  const t = useTranslations("shelf.introduction.statusShort");
  if (!introduction) {
    return null;
  }

  const meta = PRODUCT_INTRODUCTION_STATUS_META[introduction.status];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        meta.chip,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{t(introduction.status)}</span>
    </span>
  );
}

type ProductIntroductionPanelProps = {
  introduction?: ProductIntroduction | null;
  isPending: boolean;
  onChange: (payload: UpdateProductIntroductionPayload) => void;
};

export function ProductIntroductionPanel({
  introduction,
  isPending,
  onChange,
}: ProductIntroductionPanelProps) {
  const t = useTranslations("shelf.introduction");
  const tStatus = useTranslations("shelf.introduction.status");
  const tInfo = useTranslations("shelf.introduction.info");
  const locale = useLocale();
  const currentStatus = introduction?.status ?? null;
  const currentIndex = currentStatus
    ? PRODUCT_INTRODUCTION_JOURNEY.indexOf(currentStatus)
    : -1;
  const nextStatus =
    currentIndex >= 0 && currentIndex < PRODUCT_INTRODUCTION_JOURNEY.length - 1
      ? PRODUCT_INTRODUCTION_JOURNEY[currentIndex + 1]
      : null;

  return (
    <section className="space-y-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">
            {t("title")}
          </h3>
          <ProductIntroductionInfoDialog />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {introduction ? t("body") : t("legacyBody")}
        </p>
      </div>

      {introduction ? (
        <CurrentStageCard
          status={introduction.status}
          startedAt={introduction.startedAt}
          nextStatus={nextStatus}
          locale={locale}
          t={t}
          tStatus={tStatus}
          tInfo={tInfo}
        />
      ) : null}

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
          {t("journeyTitle")}
        </p>
        <ol className="flex items-start">
          {PRODUCT_INTRODUCTION_JOURNEY.map((status, index) => (
            <JourneyStep
              key={status}
              status={status}
              index={index}
              currentIndex={currentIndex}
              isPending={isPending}
              label={tStatus(status)}
              onSelect={() => onChange({ status })}
            />
          ))}
        </ol>
      </div>

      <p className="rounded-xl border border-warning/20 bg-warning-soft/60 px-3 py-2 text-xs leading-relaxed text-warning">
        {t("paceRule")}
      </p>

      <div className="space-y-2">
        <p className="text-xs leading-relaxed text-muted">{t("offRampHint")}</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_INTRODUCTION_OFF_RAMP.map((status) => {
            const selected = status === currentStatus;
            const Icon = PRODUCT_INTRODUCTION_STATUS_META[status].icon;
            return (
              <Button
                key={status}
                type="button"
                variant={selected ? "default" : "outline"}
                size="sm"
                disabled={isPending || selected}
                onClick={() => onChange({ status })}
              >
                {isPending && selected ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {status === ProductIntroductionStatus.Paused
                    ? t("actions.pause")
                    : t("actions.fail")}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CurrentStageCard({
  status,
  startedAt,
  nextStatus,
  locale,
  t,
  tStatus,
  tInfo,
}: {
  status: ProductIntroductionStatus;
  startedAt: string;
  nextStatus: ProductIntroductionStatus | null;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  tStatus: ReturnType<typeof useTranslations>;
  tInfo: ReturnType<typeof useTranslations>;
}) {
  const meta = PRODUCT_INTRODUCTION_STATUS_META[status];
  const tone = PRODUCT_INTRODUCTION_TONE[meta.tone];
  const Icon = meta.icon;

  return (
    <div className={cn("rounded-2xl border p-4", tone.hero)}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
            tone.tile,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
            {t("currentStage")}
          </p>
          <p className={cn("font-display text-lg font-bold leading-tight", tone.label)}>
            {tStatus(status)}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">
            {tInfo(`details.${status}.meaning`)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/70 pt-3 text-xs text-muted">
        <span>{t("started", { date: formatDate(startedAt, locale) })}</span>
        {nextStatus ? (
          <span className="font-semibold text-foreground">
            {t("nextUp", { stage: tStatus(nextStatus) })}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function JourneyStep({
  status,
  index,
  currentIndex,
  isPending,
  label,
  onSelect,
}: {
  status: ProductIntroductionStatus;
  index: number;
  currentIndex: number;
  isPending: boolean;
  label: string;
  onSelect: () => void;
}) {
  const Icon = PRODUCT_INTRODUCTION_STATUS_META[status].icon;
  const state =
    currentIndex >= 0 && index < currentIndex
      ? "done"
      : index === currentIndex
        ? "current"
        : "upcoming";

  const nodeClass =
    state === "done"
      ? "bg-accent text-white"
      : state === "current"
        ? "border-2 border-accent bg-accent-soft text-accent-strong"
        : "bg-surface-muted text-muted";

  const labelClass =
    state === "current"
      ? "font-bold text-accent-strong"
      : state === "done"
        ? "text-foreground"
        : "text-muted";

  return (
    <li className="relative flex min-w-0 flex-1 flex-col items-center px-0.5">
      {index > 0 ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 right-1/2 top-5 h-0.5",
            index <= currentIndex ? "bg-accent" : "bg-border",
          )}
        />
      ) : null}
      {index < PRODUCT_INTRODUCTION_JOURNEY.length - 1 ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-1/2 right-0 top-5 h-0.5",
            index < currentIndex ? "bg-accent" : "bg-border",
          )}
        />
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        disabled={isPending || state === "current"}
        aria-current={state === "current" ? "step" : undefined}
        className="group flex flex-col items-center gap-2 rounded-xl px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-default"
      >
        <span
          className={cn(
            "relative z-10 grid h-10 w-10 place-items-center rounded-full ring-4 ring-surface transition",
            nodeClass,
            state === "upcoming" && !isPending
              ? "group-hover:bg-accent-soft group-hover:text-accent-strong"
              : "",
          )}
        >
          {state === "done" ? (
            <Check className="h-[18px] w-[18px]" aria-hidden="true" />
          ) : (
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          )}
        </span>
        <span
          className={cn(
            "max-w-[5.5rem] text-center text-[11px] leading-tight",
            labelClass,
          )}
        >
          {label}
        </span>
      </button>
    </li>
  );
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(value),
  );
}
