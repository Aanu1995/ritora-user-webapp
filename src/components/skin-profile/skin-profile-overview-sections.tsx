"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { AppRoute } from "@/constants/app-routes";
import { saveCurrentAppScrollPosition } from "@/lib/app-scroll-restoration";
import type { SkinProfile } from "@/types/skin-profile";
import {
  compactStrings,
  translateOptionValue,
} from "./skin-profile-overview-format";

export function CompletenessCard({ value }: { value: number }) {
  const t = useTranslations("skinProfile.overview");
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {t("completenessTitle")}
          </p>
          <p className="mt-0.5 text-xs text-muted">{t("completenessHint")}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong">
          {t("completenessPercent", { value: safe })}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle: string;
  trailing: ReactNode;
}) {
  return (
    <div className="mb-3 px-1">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {title}
        </p>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {trailing}
        </span>
      </div>
      <p className="pt-0.5 text-xs text-muted">{subtitle}</p>
    </div>
  );
}

function OverviewRow({
  label,
  step,
  onEdit,
  href,
  children,
}: {
  label: string;
  step?: number;
  onEdit?: (step: number) => void;
  href?: string;
  children: ReactNode;
}) {
  const t = useTranslations("skinProfile");
  const editLabel = t("overview.edit");
  const editClass =
    "shrink-0 cursor-pointer text-sm text-accent-strong hover:underline";

  return (
    <div className="flex items-start justify-between border-b border-border py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
      {href ? (
        <Link href={href} className={editClass}>
          {editLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => step !== undefined && onEdit?.(step)}
          className={editClass}
        >
          {editLabel}
        </button>
      )}
    </div>
  );
}

function EnumTagList({ values }: { values: string[] }) {
  const t = useTranslations("skinProfile");

  if (values.length === 0) {
    return (
      <span className="text-sm italic text-muted">{t("overview.notSet")}</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v, index) => (
        <span
          key={`${v}-${index}`}
          className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong"
        >
          {translateOptionValue(t, v)}
        </span>
      ))}
    </div>
  );
}

function EnumValue({ value }: { value: string | null }) {
  const t = useTranslations("skinProfile");

  if (!value) {
    return (
      <span className="text-sm italic text-muted">{t("overview.notSet")}</span>
    );
  }

  return (
    <span className="text-sm font-medium text-foreground">
      {translateOptionValue(t, value)}
    </span>
  );
}

function TextValue({ value }: { value: string | null }) {
  const t = useTranslations("skinProfile");

  if (!value) {
    return (
      <span className="text-sm italic text-muted">{t("overview.notSet")}</span>
    );
  }

  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

function BooleanTag({
  value,
  label,
}: {
  value: boolean | undefined;
  label: string;
}) {
  if (typeof value !== "boolean") {
    return null;
  }

  return (
    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong">
      {label}
    </span>
  );
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function EssentialsSection({
  profile,
  onEdit,
}: {
  profile: SkinProfile;
  onEdit: (step: number) => void;
}) {
  const t = useTranslations("skinProfile");
  const tOverview = useTranslations("skinProfile.overview");
  const aboutParts = compactStrings([
    profile.dateOfBirth,
    profile.sexAtBirth ? translateOptionValue(t, profile.sexAtBirth) : null,
    profile.ethnicity ? translateOptionValue(t, profile.ethnicity) : null,
  ]);
  const sunValues = compactStrings([
    profile.skinBehavior?.pih_tendency,
    profile.skinBehavior?.melasma_tendency,
    profile.skinBehavior?.keloid_tendency,
    profile.skinBehavior?.sunscreen_habit,
    profile.skinBehavior?.sunscreen_tolerance,
  ]);
  const preferenceValues = compactStrings([
    profile.budgetTier,
    profile.routinePreferences?.sunscreen_filter,
    profile.routinePreferences?.sunscreen_finish,
  ]);
  const locationValue =
    compactStrings([profile.city, profile.countryCode]).join(" · ") || null;

  return (
    <div>
      <SectionHeading
        title={tOverview("essentialsTitle")}
        subtitle={tOverview("essentialsHint")}
        trailing={tOverview("allMandatoryLabel")}
      />
      <div className="rounded-2xl border border-border bg-surface px-5">
        <OverviewRow label={t("fieldLabels.skinType")} step={1} onEdit={onEdit}>
          <EnumValue value={profile.skinType} />
        </OverviewRow>
        <OverviewRow label={t("fieldLabels.skinTone")} step={1} onEdit={onEdit}>
          <EnumValue value={profile.skinTone} />
        </OverviewRow>
        <OverviewRow label={t("fieldLabels.concerns")} step={2} onEdit={onEdit}>
          <EnumTagList values={profile.currentConcerns} />
        </OverviewRow>
        <OverviewRow
          label={t("fieldLabels.primaryGoal")}
          step={2}
          onEdit={onEdit}
        >
          <EnumValue value={profile.primaryGoal} />
        </OverviewRow>
        <OverviewRow
          label={t("fieldLabels.sunBehavior")}
          step={3}
          onEdit={onEdit}
        >
          <div className="flex flex-col gap-2">
            <EnumValue value={profile.fitzpatrickPhototype} />
            {sunValues.length > 0 ? <EnumTagList values={sunValues} /> : null}
          </div>
        </OverviewRow>
        <OverviewRow
          label={t("fieldLabels.routinePace")}
          step={4}
          onEdit={onEdit}
        >
          <EnumValue value={profile.routinePreferences?.pace ?? null} />
        </OverviewRow>
        <OverviewRow
          label={t("fieldLabels.preferences")}
          step={5}
          onEdit={onEdit}
        >
          <div className="flex flex-wrap gap-1.5">
            <EnumTagList values={preferenceValues} />
            <BooleanTag
              value={profile.routinePreferences?.fragrance_free}
              label={t("preferences.fragranceFreeLabel")}
            />
            <BooleanTag
              value={profile.routinePreferences?.non_comedogenic}
              label={t("preferences.nonComedogenicLabel")}
            />
          </div>
        </OverviewRow>
        <OverviewRow label={t("fieldLabels.aboutYou")} step={1} onEdit={onEdit}>
          {aboutParts.length > 0 ? (
            <span className="text-sm font-medium text-foreground">
              {aboutParts.join(" · ")}
            </span>
          ) : (
            <span className="text-sm italic text-muted">
              {t("overview.notSet")}
            </span>
          )}
        </OverviewRow>
        <OverviewRow
          label={t("fieldLabels.location")}
          href="/settings?tab=privacy"
        >
          <TextValue value={locationValue} />
        </OverviewRow>
      </div>
    </div>
  );
}

interface OptionalCardProps {
  href: string;
  icon: ReactNode;
  iconTone?: "accent" | "warning" | "warm" | "violet";
  title: string;
  description: string;
  time: string;
  encrypted?: boolean;
  consentRequired?: boolean;
  filled?: boolean;
  filledLabel?: string;
  notApplicable?: boolean;
  notApplicableLabel?: string;
}

export function OptionalCard({
  href,
  icon,
  iconTone = "accent",
  title,
  description,
  time,
  encrypted,
  consentRequired,
  filled,
  filledLabel,
  notApplicable,
  notApplicableLabel,
}: OptionalCardProps) {
  const tOverview = useTranslations("skinProfile.overview");
  const toneClass =
    iconTone === "warning"
      ? "bg-warning-soft text-warning"
      : iconTone === "warm"
        ? "bg-secondary-soft text-secondary"
        : iconTone === "violet"
          ? "bg-ai-bg text-ai-fg"
          : "bg-accent-soft text-accent-strong";

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors">
      <div
        className={`grid h-10 w-10 flex-none place-items-center rounded-xl text-base font-semibold ${toneClass}`}
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {encrypted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ai-bg px-2 py-0.5 text-[10px] font-semibold text-ai-fg">
              <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
              {tOverview("encryptedBadge")}
            </span>
          ) : null}
          {notApplicable ? (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted">
              {notApplicableLabel ?? tOverview("notApplicable")}
            </span>
          ) : filled && filledLabel ? (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-strong">
              {filledLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-muted">{description}</p>
        {!notApplicable ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
            <span>{time}</span>
            {consentRequired ? (
              <>
                <span aria-hidden>·</span>
                <span>{tOverview("consentRequired")}</span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      {!notApplicable ? (
        <div className="flex flex-none flex-col items-end gap-2">
          <Link
            href={href}
            onClick={(event) => {
              if (isPlainLeftClick(event)) {
                saveCurrentAppScrollPosition(AppRoute.SkinProfile);
              }
            }}
            className={
              filled
                ? "rounded-full border border-border-strong bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent-soft"
                : "rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-soft hover:bg-accent-strong"
            }
          >
            {filled ? tOverview("review") : tOverview("addNow")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
