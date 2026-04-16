"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SkinProfileOptions } from "@/types/skin-profile";

interface ContextStepFieldsProps {
  options: SkinProfileOptions;
  skinTone: string;
  ageRange: string;
  ethnicity: string;
  countryCode: string;
  city: string;
  locationConsent: boolean;
  showConsent: boolean;
  countryCodeError?: string;
  cityError?: string;
  locationConsentError?: string;
  onSkinToneChange: (value: string) => void;
  onAgeRangeChange: (value: string) => void;
  onEthnicityChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onLocationConsentChange: (value: boolean) => void;
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <Label className="text-sm text-muted">{label}</Label>
      <div className="sm:w-48">{children}</div>
    </div>
  );
}

export function ContextStepFields({
  options,
  skinTone,
  ageRange,
  ethnicity,
  countryCode,
  city,
  locationConsent,
  showConsent,
  countryCodeError,
  cityError,
  locationConsentError,
  onSkinToneChange,
  onAgeRangeChange,
  onEthnicityChange,
  onCountryCodeChange,
  onCityChange,
  onLocationConsentChange,
}: ContextStepFieldsProps) {
  const t = useTranslations("skinProfile");
  const translateOption = (value: string) => t(`options.${value}`);

  return (
    <div>
      <FieldRow label={t("fieldLabels.skinTone")}>
        <Select value={skinTone || undefined} onValueChange={onSkinToneChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {options.skinTones.map((v) => (
              <SelectItem key={v} value={v}>
                {translateOption(v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow label={t("fieldLabels.ageRange")}>
        <Select value={ageRange || undefined} onValueChange={onAgeRangeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {options.ageRanges.map((v) => (
              <SelectItem key={v} value={v}>
                {translateOption(v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow label={t("fieldLabels.ethnicity")}>
        <Select value={ethnicity || undefined} onValueChange={onEthnicityChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {options.ethnicities.map((v) => (
              <SelectItem key={v} value={v}>
                {translateOption(v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow label={t("fieldLabels.countryCode")}>
        <Input
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value.toUpperCase())}
          placeholder="SE"
          maxLength={2}
          className="w-full uppercase"
          aria-invalid={Boolean(countryCodeError)}
          aria-describedby={countryCodeError ? "country-code-error" : undefined}
        />
        {countryCodeError ? (
          <p id="country-code-error" className="mt-2 text-sm text-danger" role="alert">
            {countryCodeError}
          </p>
        ) : null}
      </FieldRow>

      <FieldRow label={t("fieldLabels.city")}>
        <Input
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder="Stockholm"
          maxLength={100}
          className="w-full"
          aria-invalid={Boolean(cityError)}
          aria-describedby={cityError ? "city-error" : undefined}
        />
        {cityError ? (
          <p id="city-error" className="mt-2 text-sm text-danger" role="alert">
            {cityError}
          </p>
        ) : null}
      </FieldRow>

      {showConsent ? (
        <div className="mt-4 flex items-start gap-3">
          <Checkbox
            id="location-consent"
            checked={locationConsent}
            onCheckedChange={(checked) =>
              onLocationConsentChange(Boolean(checked))
            }
            aria-invalid={Boolean(locationConsentError)}
            aria-describedby={
              locationConsentError ? "location-consent-error" : undefined
            }
            className="mt-0.5"
          />
          <Label
            htmlFor="location-consent"
            className="text-sm leading-relaxed text-muted"
          >
            {t("locationConsent")}
          </Label>
          {locationConsentError ? (
            <p
              id="location-consent-error"
              className="text-sm text-danger"
              role="alert"
            >
              {locationConsentError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
