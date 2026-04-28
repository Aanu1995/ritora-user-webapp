import type { SkinProfile } from "@/types/skin-profile";

export type StoredDataItem = { label: string; value: string | null };

export function buildHealthStoredItems(
  profile: SkinProfile,
  tOptions: (key: string) => string,
  tConsent: (key: string) => string,
): StoredDataItem[] {
  return [
    {
      label: tConsent("storedPregnancy"),
      value: profile.pregnancyStatus ? tOptions(profile.pregnancyStatus) : null,
    },
    {
      label: tConsent("storedConditions"),
      value:
        profile.safetyContext?.conditions
          ?.map((condition) => tOptions(condition))
          .join(", ") ?? null,
    },
    {
      label: tConsent("storedMedications"),
      value:
        profile.safetyContext?.medications
          ?.map((medication) => tOptions(medication))
          .join(", ") ?? null,
    },
    {
      label: tConsent("storedRecentProcedures"),
      value:
        profile.safetyContext?.recent_procedures
          ?.map((procedure) =>
            procedure.performed_at
              ? `${tOptions(procedure.type)} (${procedure.performed_at})`
              : tOptions(procedure.type),
          )
          .join(", ") ?? null,
    },
    {
      label: tConsent("storedDermatologistCare"),
      value: profile.underDermatologistCare
        ? tOptions(profile.underDermatologistCare)
        : null,
    },
  ];
}

export function buildLocationStoredItems(
  profile: SkinProfile,
  tConsent: (key: string) => string,
): StoredDataItem[] {
  return [
    { label: tConsent("storedCountry"), value: profile.countryCode ?? null },
    { label: tConsent("storedCity"), value: profile.city ?? null },
  ];
}

export function buildHormonalStoredItems(
  profile: SkinProfile,
  tOptions: (key: string) => string,
  tConsent: (key: string) => string,
): StoredDataItem[] {
  const context = profile.hormonalContext ?? {};
  const booleanLabel = (value: boolean | undefined) => {
    if (value === true) return tConsent("yes");
    if (value === false) return tConsent("no");
    return null;
  };

  return [
    {
      label: tConsent("storedCyclePattern"),
      value: context.cycle_pattern ? tOptions(context.cycle_pattern) : null,
    },
    {
      label: tConsent("storedBreakoutPattern"),
      value: context.breakout_pattern
        ? tOptions(context.breakout_pattern)
        : null,
    },
    {
      label: tConsent("storedCycleRelated"),
      value: booleanLabel(context.cycle_related_breakouts),
    },
    {
      label: tConsent("storedHormonalContraception"),
      value: booleanLabel(context.uses_hormonal_contraception),
    },
    {
      label: tConsent("storedMenopause"),
      value: booleanLabel(context.menopause_related_changes),
    },
  ];
}
