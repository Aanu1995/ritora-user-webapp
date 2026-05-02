import type { SkinProfile } from "@/types/skin-profile";

export type StoredDataItem = { label: string; value: string | null };

function formatStoredList<T>(
  values: T[] | undefined,
  format: (value: T) => string,
): string | null {
  if (!values || values.length === 0) {
    return null;
  }
  return values.map(format).join(", ");
}

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
      value: formatStoredList(profile.safetyContext?.conditions, tOptions),
    },
    {
      label: tConsent("storedMedications"),
      value: formatStoredList(profile.safetyContext?.medications, tOptions),
    },
    {
      label: tConsent("storedRecentProcedures"),
      value: formatStoredList(
        profile.safetyContext?.recent_procedures,
        (procedure) =>
          procedure.performed_at
            ? `${tOptions(procedure.type)} (${procedure.performed_at})`
            : tOptions(procedure.type),
      ),
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
