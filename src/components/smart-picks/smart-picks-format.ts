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
