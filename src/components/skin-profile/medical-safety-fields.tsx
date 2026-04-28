"use client";

import { useTranslations } from "next-intl";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { RecentProcedure, SkinProfileOptions } from "@/types/skin-profile";
import {
  DERM_CARE_OPTIONS,
  SkinProfileValue,
} from "./skin-profile-domain-values";

function chipClasses(selected: boolean, muted = false) {
  return [
    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer",
    selected
      ? "border-accent-strong bg-accent-soft text-accent-strong"
      : muted
        ? "border-border text-muted hover:border-accent/40"
        : "border-border text-foreground hover:border-accent/40",
  ].join(" ");
}

function FieldHeader({ question, why }: { question: string; why: string }) {
  const t = useTranslations("skinProfile.medicalSafety");

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-foreground">{question}</p>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="cursor-pointer rounded-full border border-dashed border-border-strong px-2.5 py-0.5 text-[11px] text-muted hover:bg-surface-muted"
          >
            ? {t("whyWeAsk")}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 text-xs leading-relaxed">
          {why}
        </PopoverContent>
      </Popover>
    </div>
  );
}

type StateUpdater<T> = (updater: T | ((previous: T) => T)) => void;

interface MedicalSafetyFieldsProps {
  options: SkinProfileOptions;
  sexAtBirth: string | null;
  pregnancyStatus: string | null;
  setPregnancyStatus: StateUpdater<string | null>;
  conditions: string[];
  setConditions: StateUpdater<string[]>;
  medications: string[];
  setMedications: StateUpdater<string[]>;
  photosensitizingOther: boolean;
  setPhotosensitizingOther: StateUpdater<boolean>;
  recentProcedures: RecentProcedure[];
  setRecentProcedures: StateUpdater<RecentProcedure[]>;
  dermCare: string | null;
  setDermCare: StateUpdater<string | null>;
}

export function MedicalSafetyFields({
  options,
  sexAtBirth,
  pregnancyStatus,
  setPregnancyStatus,
  conditions,
  setConditions,
  medications,
  setMedications,
  photosensitizingOther,
  setPhotosensitizingOther,
  recentProcedures,
  setRecentProcedures,
  dermCare,
  setDermCare,
}: MedicalSafetyFieldsProps) {
  const t = useTranslations("skinProfile.medicalSafety");
  const tOptions = useTranslations("skinProfile.options");

  const toggleArrayValue = (setter: StateUpdater<string[]>, value: string) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };
  const toggleProcedure = (type: string) => {
    setRecentProcedures((prev) => {
      const exists = prev.find((p) => p.type === type);
      return exists
        ? prev.filter((p) => p.type !== type)
        : [...prev, { type, performed_at: null }];
    });
  };
  const updateProcedureDate = (type: string, date: string) => {
    setRecentProcedures((prev) =>
      prev.map((p) =>
        p.type === type ? { ...p, performed_at: date || null } : p,
      ),
    );
  };

  const isMale = sexAtBirth === SkinProfileValue.Male;

  return (
    <div className="space-y-1 divide-y divide-border rounded-2xl border border-border bg-surface px-5">
      <div className="space-y-3 py-5">
        <FieldHeader
          question={t("questionPregnancy")}
          why={t("whyPregnancy")}
        />
        {isMale ? (
          <>
            <p className="text-xs text-muted">
              {t("pregnancyNotApplicableHint")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span
                className="rounded-full border border-accent-strong bg-accent-soft px-3.5 py-1.5 text-xs font-medium text-accent-strong"
                aria-label={tOptions(SkinProfileValue.NotPregnant)}
              >
                {tOptions(SkinProfileValue.NotPregnant)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {options.pregnancyStatuses.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setPregnancyStatus(pregnancyStatus === value ? null : value)
                }
                className={chipClasses(
                  pregnancyStatus === value,
                  value === SkinProfileValue.PreferNotToSay,
                )}
              >
                {tOptions(value)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 py-5">
        <FieldHeader
          question={t("questionConditions")}
          why={t("whyConditions")}
        />
        <p className="text-xs text-muted">{t("questionConditionsHint")}</p>
        <div className="flex flex-wrap gap-1.5">
          {options.conditions
            .filter((condition) => condition !== SkinProfileValue.Other)
            .map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayValue(setConditions, value)}
                className={chipClasses(conditions.includes(value))}
              >
                {tOptions(value)}
              </button>
            ))}
          <button
            type="button"
            onClick={() => setConditions([])}
            className={chipClasses(conditions.length === 0, true)}
          >
            {t("none")}
          </button>
        </div>
      </div>

      <div className="space-y-3 py-5">
        <FieldHeader
          question={t("questionMedications")}
          why={t("whyMedications")}
        />
        <div className="flex flex-wrap gap-1.5">
          {options.medications
            .filter(
              (medication) =>
                medication !== SkinProfileValue.OtherPhotosensitizing,
            )
            .map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayValue(setMedications, value)}
                className={chipClasses(medications.includes(value))}
              >
                {tOptions(value)}
              </button>
            ))}
          <button
            type="button"
            onClick={() => setMedications([])}
            className={chipClasses(medications.length === 0, true)}
          >
            {t("none")}
          </button>
        </div>
        <label className="mt-2 flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border-strong accent-accent-strong"
            checked={photosensitizingOther}
            onChange={(e) => setPhotosensitizingOther(e.target.checked)}
          />
          <span className="text-sm text-foreground">
            {t("questionPhotosensitizingOther")}
          </span>
        </label>
      </div>

      <div className="space-y-3 py-5">
        <FieldHeader
          question={t("questionProcedures")}
          why={t("whyProcedures")}
        />
        <div className="space-y-2">
          {options.procedureTypes.map((type) => {
            const procedure = recentProcedures.find((p) => p.type === type);
            const isChecked = Boolean(procedure);
            return (
              <div
                key={type}
                className="flex items-center gap-3 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border-strong accent-accent-strong"
                  checked={isChecked}
                  onChange={() => toggleProcedure(type)}
                />
                <span className="flex-1">{tOptions(type)}</span>
                {isChecked ? (
                  <div className="w-44">
                    <DatePicker
                      value={procedure?.performed_at ?? ""}
                      onChange={(next) => updateProcedureDate(type, next)}
                      ariaLabel={`${tOptions(type)} date`}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setRecentProcedures([])}
            className={chipClasses(recentProcedures.length === 0, true)}
          >
            {t("noneOrPreferNotToSay")}
          </button>
        </div>
      </div>

      <div className="space-y-3 py-5">
        <FieldHeader question={t("questionDermCare")} why={t("whyDermCare")} />
        <div className="flex flex-wrap gap-1.5">
          {DERM_CARE_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDermCare(dermCare === value ? null : value)}
              className={chipClasses(dermCare === value)}
            >
              {tOptions(value)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDermCare(null)}
            className={chipClasses(dermCare === null, true)}
          >
            {t("preferNotToSay")}
          </button>
        </div>
      </div>
    </div>
  );
}
