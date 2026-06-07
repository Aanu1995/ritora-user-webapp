import type {
  SmartPicksBudgetTier,
  SmartPicksCoverageRole,
} from "@/types/smart-picks";
import type { useTranslations } from "next-intl";

const BUDGET_LABEL: Record<SmartPicksBudgetTier, string> = {
  drugstore: "Drugstore",
  mid: "Mid",
  premium: "Premium",
  luxury: "Luxury",
};

const ROLE_LABEL: Record<SmartPicksCoverageRole, string> = {
  cleanse: "Cleanse",
  hydrate: "Hydrate",
  treat: "Treat",
  moisturise: "Moisturise",
  spf: "SPF",
  eye: "Eye",
  "treatment-secondary": "Second treatment",
  "dark-spot-treatment": "Pigment serum",
  antioxidant: "Vitamin C",
  "exfoliation-mask": "Mask or peel",
  "acne-treatment": "Acne treatment",
  "barrier-support": "Barrier support",
  "congestion-mask": "Congestion mask",
  "texture-exfoliant": "Texture exfoliant",
  retinoid: "Retinoid",
  peptide: "Peptide support",
  "recovery-mask": "Recovery mask",
  "goal-primary": "Goal product",
  "goal-support": "Goal support",
};

const KNOWN_SKIN_PROFILE_OPTION_KEYS = new Set([
  "oily", "dry", "combination", "normal",
  "sensitive", "very_light", "light", "light_medium",
  "medium", "medium_dark", "dark", "very_dark",
  "under_18", "18_24", "25_34", "35_44",
  "45_54", "55_plus", "black", "white_caucasian",
  "asian", "hispanic_latino", "middle_eastern", "mixed",
  "other", "unknown", "soft", "hard",
  "confirmed", "acne", "dark_marks", "dryness",
  "oiliness", "texture", "redness", "large_pores",
  "fine_lines", "barrier_damage", "eczema", "uneven_tone",
  "post-breakout marks", "clear_acne", "fade_dark_marks", "improve_texture",
  "anti_aging", "strengthen_barrier", "minimize_pores", "even_tone",
  "general_maintenance", "moderate", "I", "II",
  "III", "IV", "V", "VI",
  "low", "moderate_level", "high", "very_high",
  "well_hydrated", "dehydrated", "very_dehydrated", "not_pregnant",
  "trying_to_conceive", "pregnant", "breastfeeding", "prefer_not_to_say",
  "female", "male", "intersex", "rosacea",
  "psoriasis", "perioral_dermatitis", "seborrheic_dermatitis", "melasma",
  "vitiligo", "keratosis_pilaris", "isotretinoin", "topical_retinoid",
  "topical_antibiotic", "oral_antibiotic", "hormonal_contraceptive", "hrt",
  "topical_corticosteroid", "other_photosensitizing", "chemical_peel", "laser",
  "microneedling", "microdermabrasion", "botox", "filler",
  "yes_actively", "yes_occasional", "no", "never",
  "sometimes", "often", "always", "rarely",
  "when_outside", "most_days", "every_day", "fine",
  "a_bit_irritating", "often_irritating", "havent_tried_many", "chemical",
  "mineral", "hybrid", "matte", "dewy",
  "tinted", "natural", "ingredient", "product",
  "category", "fragrance", "preservative", "redness_reaction",
  "itch", "stinging", "dryness_reaction", "breakout",
  "breakout_reaction", "hives", "swelling", "mild",
  "severe", "suspected", "confirmed_repeat", "confirmed_patch_test",
  "under_6", "6_to_8", "over_8", "high_sugar",
  "high_dairy", "low_sugar", "low_dairy", "vegan_diet",
  "vegetarian", "occasional", "regular", "dry_air",
  "humidity", "cold", "pollution", "heat",
  "retinoids", "aha", "bha", "pha",
  "benzoyl_peroxide", "vitamin_c", "niacinamide", "azelaic_acid",
  "exfoliation", "never_tried", "tolerates_well", "sensitive_to_it",
  "cannot_use", "slow", "cautious", "aggressive",
  "drugstore", "mid", "premium", "luxury",
  "lightweight", "rich", "gel", "cream",
  "oil_free", "vegan", "cruelty_free", "fragrance_free",
  "clean", "none", "irregular", "not_applicable",
  "not_sure", "before_period", "during_period", "ovulation",
  "random",
]);

export function budgetLabel(value: SmartPicksBudgetTier | null): string {
  return value ? BUDGET_LABEL[value] : "Unset";
}

export function normalizeFocusKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function roleLabel(role: SmartPicksCoverageRole | string): string {
  return role in ROLE_LABEL
    ? ROLE_LABEL[role as SmartPicksCoverageRole]
    : role.replace(/-/g, " ");
}

type SkinProfileTranslator = ReturnType<typeof useTranslations>;

export function translateSmartPicksProfileValue(
  t: SkinProfileTranslator,
  value: string,
): string {
  const translated = translateKnownProfileOption(t, value);

  if (translated) {
    return translated;
  }

  if (!value.includes(",")) {
    return value;
  }

  return value
    .split(",")
    .map((part) => translateProfileOptionPart(t, part))
    .join(",");
}

function translateProfileOptionPart(
  t: SkinProfileTranslator,
  value: string,
): string {
  const leadingWhitespace = value.match(/^\s*/)?.[0] ?? "";
  const trailingWhitespace = value.match(/\s*$/)?.[0] ?? "";
  const option = value.trim();
  const translated = translateKnownProfileOption(t, option);

  return translated
    ? `${leadingWhitespace}${translated}${trailingWhitespace}`
    : value;
}

function translateKnownProfileOption(
  t: SkinProfileTranslator,
  value: string,
): string | null {
  for (const candidate of profileOptionCandidates(value)) {
    const key = `options.${candidate}`;

    if (hasProfileOption(t, key, candidate)) {
      return t(key);
    }
  }

  return null;
}

function hasProfileOption(
  t: SkinProfileTranslator,
  key: string,
  candidate: string,
): boolean {
  if (KNOWN_SKIN_PROFILE_OPTION_KEYS.has(candidate)) {
    return true;
  }

  if (t.has?.(key)) {
    return true;
  }

  try {
    const options = t.raw("options");

    return (
      typeof options === "object" &&
      options !== null &&
      Object.prototype.hasOwnProperty.call(options, candidate)
    );
  } catch {
    return false;
  }
}

function profileOptionCandidates(value: string): string[] {
  const trimmed = value.trim().replace(/^_+|_+$/g, "");

  if (!trimmed) {
    return [];
  }

  const lowerCase = trimmed.toLowerCase();

  return Array.from(
    new Set([
      trimmed,
      lowerCase,
      lowerCase.replace(/[-\s]+/g, "_"),
    ]),
  );
}
