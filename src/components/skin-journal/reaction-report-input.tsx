"use client";

import type { ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  REACTION_REPORT_LOCATIONS,
  REACTION_REPORT_ONSETS,
  REACTION_REPORT_RED_FLAGS,
  REACTION_REPORT_SEVERITIES,
  REACTION_REPORT_SYMPTOMS,
  REACTION_REPORT_TRIGGERS,
  type ReactionReport,
  type ReactionReportLocation,
  type ReactionReportRedFlag,
  type ReactionReportSymptom,
} from "@/types/skin-journal";
import { Chip } from "./chip";
import { createEmptyReactionReport } from "./daily-check-in-validation";

type ReactionReportInputProps = {
  value: ReactionReport | null | undefined;
  onChange: (next: ReactionReport | null) => void;
};

export function ReactionReportInput({
  value,
  onChange,
}: ReactionReportInputProps) {
  const t = useTranslations("journal.upload.reactionReport");
  const report = value ?? createEmptyReactionReport();

  const update = (patch: Partial<ReactionReport>) => {
    onChange({
      ...createEmptyReactionReport(),
      ...report,
      ...patch,
    });
  };

  const toggleSymptom = (symptom: ReactionReportSymptom) => {
    update({ symptoms: toggle(report.symptoms, symptom) });
  };

  const toggleLocation = (location: ReactionReportLocation) => {
    update({ locations: toggle(report.locations ?? [], location) });
  };

  const toggleRedFlag = (flag: ReactionReportRedFlag) => {
    update({ red_flags: toggle(report.red_flags ?? [], flag) });
  };

  return (
    <div className="rounded-2xl border border-danger/30 bg-danger-soft/40 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger text-white">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{t("title")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {t("body")}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 shrink-0 rounded-full px-0 text-muted hover:bg-danger/10 hover:text-danger focus-visible:ring-danger/30"
          aria-label={t("clear")}
          onClick={() => onChange(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-5 space-y-4">
        <Field label={t("symptomsLabel")}>
          {REACTION_REPORT_SYMPTOMS.map((symptom) => (
            <Chip
              key={symptom}
              asButton
              variant="danger"
              selected={report.symptoms.includes(symptom)}
              onClick={() => toggleSymptom(symptom)}
            >
              {t(`symptoms.${symptom}`)}
            </Chip>
          ))}
        </Field>

        <Field label={t("severityLabel")}>
          {REACTION_REPORT_SEVERITIES.map((severity) => (
            <Chip
              key={severity}
              asButton
              variant={severity === "severe" ? "danger" : "warning"}
              selected={report.severity === severity}
              onClick={() => update({ severity })}
            >
              {t(`severity.${severity}`)}
            </Chip>
          ))}
        </Field>

        <Field label={t("onsetLabel")}>
          {REACTION_REPORT_ONSETS.map((onset) => (
            <Chip
              key={onset}
              asButton
              selected={report.onset === onset}
              onClick={() => update({ onset })}
            >
              {t(`onset.${onset}`)}
            </Chip>
          ))}
        </Field>

        <Field label={t("locationsLabel")}>
          {REACTION_REPORT_LOCATIONS.map((location) => (
            <Chip
              key={location}
              asButton
              selected={(report.locations ?? []).includes(location)}
              onClick={() => toggleLocation(location)}
            >
              {t(`locations.${location}`)}
            </Chip>
          ))}
        </Field>

        <Field label={t("triggerLabel")}>
          {REACTION_REPORT_TRIGGERS.map((trigger) => (
            <Chip
              key={trigger}
              asButton
              selected={report.suspected_trigger === trigger}
              onClick={() => update({ suspected_trigger: trigger })}
            >
              {t(`triggers.${trigger}`)}
            </Chip>
          ))}
        </Field>

        <Field label={t("redFlagsLabel")} hint={t("redFlagsHint")}>
          {REACTION_REPORT_RED_FLAGS.map((flag) => (
            <Chip
              key={flag}
              asButton
              variant="danger"
              selected={(report.red_flags ?? []).includes(flag)}
              onClick={() => toggleRedFlag(flag)}
            >
              {t(`redFlags.${flag}`)}
            </Chip>
          ))}
        </Field>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            {t("noteLabel")}
          </label>
          <Textarea
            rows={2}
            maxLength={1000}
            placeholder={t("notePlaceholder")}
            value={report.note ?? ""}
            onChange={(event) => update({ note: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      {hint ? <p className="mb-2 text-xs leading-relaxed text-muted">{hint}</p> : null}
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function toggle<T>(items: T[], item: T): T[] {
  return items.includes(item)
    ? items.filter((current) => current !== item)
    : [...items, item];
}
