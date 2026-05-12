import type {
  SmartPicksBudgetTier,
  SmartPicksCoverageRole,
} from "@/types/smart-picks";

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
};

export function budgetLabel(value: SmartPicksBudgetTier | null): string {
  return value ? BUDGET_LABEL[value] : "Unset";
}

export function formatPrice(
  priceCents: number | null,
  currency: string | null,
): string | null {
  if (priceCents === null || !currency) return null;
  const normalizedCurrency = currency.trim().toUpperCase();
  if (!normalizedCurrency) return null;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: normalizedCurrency,
    }).format(priceCents / 100);
  } catch {
    return `${normalizedCurrency} ${(priceCents / 100).toFixed(2)}`;
  }
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
