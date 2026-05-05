"use client";

import { Stethoscope } from "lucide-react";
import { useTranslations } from "next-intl";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  MAX_SPECIALIST_CLINIC_NAME_LENGTH,
  MAX_SPECIALIST_PROVIDER_NAME_LENGTH,
  MAX_SPECIALIST_SAFETY_NOTES_LENGTH,
} from "@/types/schedule";

type SlotSpecialistFieldsProps = {
  activeSince: string;
  clinicName: string;
  disabled?: boolean;
  onActiveSinceChange: (value: string) => void;
  onClinicNameChange: (value: string) => void;
  onProviderNameChange: (value: string) => void;
  onSafetyNotesChange: (value: string) => void;
  providerName: string;
  safetyNotes: string;
};

export function SlotSpecialistFields({
  activeSince,
  clinicName,
  disabled,
  onActiveSinceChange,
  onClinicNameChange,
  onProviderNameChange,
  onSafetyNotesChange,
  providerName,
  safetyNotes,
}: SlotSpecialistFieldsProps) {
  const t = useTranslations("schedule.editor.specialist");
  return (
    <section className="border-b border-border px-5 py-4">
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg bg-accent-soft text-accent-strong">
          <Stethoscope className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t("title")}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {t("body")}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SpecialistInput
          id="specialist-provider-name"
          label={t("providerName")}
          value={providerName}
          maxLength={MAX_SPECIALIST_PROVIDER_NAME_LENGTH}
          disabled={disabled}
          onChange={onProviderNameChange}
        />
        <SpecialistInput
          id="specialist-clinic-name"
          label={t("clinicName")}
          value={clinicName}
          maxLength={MAX_SPECIALIST_CLINIC_NAME_LENGTH}
          disabled={disabled}
          onChange={onClinicNameChange}
        />
        <label className="block" htmlFor="specialist-active-since">
          <span className="text-xs font-semibold text-foreground">
            {t("activeSince")}
          </span>
          <div className="mt-1">
            <DatePicker
              value={activeSince}
              onChange={onActiveSinceChange}
              disabled={disabled}
              ariaLabel={t("activeSince")}
              maxDate={new Date()}
            />
          </div>
        </label>
      </div>

      <label className="mt-3 block" htmlFor="specialist-safety-notes">
        <span className="text-xs font-semibold text-foreground">
          {t("safetyNotes")}
        </span>
        <textarea
          id="specialist-safety-notes"
          value={safetyNotes}
          rows={3}
          disabled={disabled}
          maxLength={MAX_SPECIALIST_SAFETY_NOTES_LENGTH}
          onChange={(event) =>
            onSafetyNotesChange(
              event.target.value.slice(0, MAX_SPECIALIST_SAFETY_NOTES_LENGTH),
            )
          }
          placeholder={t("safetyNotesPlaceholder")}
          className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {t("privacyHint")}
      </p>
    </section>
  );
}

type SpecialistInputProps = {
  disabled?: boolean;
  id: string;
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  value: string;
};

function SpecialistInput({
  disabled,
  id,
  label,
  maxLength,
  onChange,
  value,
}: SpecialistInputProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11"
      />
    </label>
  );
}
