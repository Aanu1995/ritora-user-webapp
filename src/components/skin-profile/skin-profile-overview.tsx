"use client";

import { useTranslations } from "next-intl";
import type { SkinProfile } from "@/types/skin-profile";

interface SkinProfileOverviewProps {
  profile: SkinProfile;
  onEdit: (step: number) => void;
}

function OverviewRow({
  label,
  step,
  onEdit,
  children,
}: {
  label: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  const t = useTranslations("skinProfile");

  return (
    <div className="flex items-start justify-between border-b border-border py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="shrink-0 cursor-pointer text-sm text-accent-strong hover:underline"
      >
        {t("overview.edit")}
      </button>
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
      {values.map((v) => (
        <span
          key={v}
          className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong"
        >
          {t(`options.${v}`)}
        </span>
      ))}
    </div>
  );
}

function FreeTextTagList({ values }: { values: string[] }) {
  const t = useTranslations("skinProfile");

  if (values.length === 0) {
    return (
      <span className="text-sm italic text-muted">{t("overview.notSet")}</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground"
        >
          {v}
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
      {t(`options.${value}`)}
    </span>
  );
}

export function SkinProfileOverview({
  profile,
  onEdit,
}: SkinProfileOverviewProps) {
  const t = useTranslations("skinProfile");

  const contextParts = [
    profile.ethnicity ? t(`options.${profile.ethnicity}`) : null,
    profile.city,
    profile.countryCode,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-xl">
      <OverviewRow
        label={t("fieldLabels.skinType")}
        step={1}
        onEdit={onEdit}
      >
        <EnumValue value={profile.skinType} />
      </OverviewRow>

      <OverviewRow
        label={t("fieldLabels.concerns")}
        step={2}
        onEdit={onEdit}
      >
        <EnumTagList values={profile.currentConcerns} />
      </OverviewRow>

      <OverviewRow
        label={t("fieldLabels.sensitivities")}
        step={2}
        onEdit={onEdit}
      >
        <FreeTextTagList values={profile.knownSensitivities} />
      </OverviewRow>

      <OverviewRow
        label={t("fieldLabels.goals")}
        step={3}
        onEdit={onEdit}
      >
        <EnumTagList values={profile.skinGoals} />
      </OverviewRow>

      <OverviewRow
        label={t("fieldLabels.routine")}
        step={4}
        onEdit={onEdit}
      >
        <EnumValue value={profile.routineComplexity} />
      </OverviewRow>

      <OverviewRow
        label={t("fieldLabels.aboutYou")}
        step={5}
        onEdit={onEdit}
      >
        {contextParts.length > 0 ? (
          <span className="text-sm font-medium text-foreground">
            {contextParts.join(" · ")}
          </span>
        ) : (
          <span className="text-sm italic text-muted">
            {t("overview.notSet")}
          </span>
        )}
      </OverviewRow>
    </div>
  );
}
