import type { Locale } from '@/i18n/config';

export enum AnalysisSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum AnalysisStatus {
  Ok = 'ok',
  InsufficientData = 'insufficient_data',
}

export enum AnalysisConfidence {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export enum AnalysisMode {
  Focus = 'focus',
  Multi = 'multi',
}

export enum IngredientCategory {
  Retinoid = 'retinoid',
  Aha = 'aha',
  Bha = 'bha',
  Pha = 'pha',
  BenzoylPeroxide = 'benzoyl-peroxide',
  VitaminC = 'vitamin-c',
  Niacinamide = 'niacinamide',
  Hydroquinone = 'hydroquinone',
  AzelaicAcid = 'azelaic-acid',
  TyrosinaseInhibitor = 'tyrosinase-inhibitor',
  Bakuchiol = 'bakuchiol',
  Sulphur = 'sulphur',
  Peptide = 'peptide',
  Barrier = 'barrier',
  Humectant = 'humectant',
  Antioxidant = 'antioxidant',
  MineralSpf = 'mineral-spf',
  ChemicalSpf = 'chemical-spf',
}

export type AnalysisActive = {
  slug: string;
  displayName: string;
  category: IngredientCategory;
  summary: string;
  avoidCategories: IngredientCategory[];
  avoidIngredients: Array<{
    slug: string;
    displayName: string;
  }>;
  mitigationHint: string | null;
};

export type IngredientConflict = {
  code: string;
  severity: AnalysisSeverity;
  ingredientA: string;
  ingredientB: string;
  productAId: string;
  productBId: string;
  conditions?: Record<string, unknown>;
  mitigation?: string;
  explanation: string | null;
  description: string;
};

export type IngredientOverlap = {
  ingredient: string;
  productIds: string[];
  severity: AnalysisSeverity;
  explanation: string | null;
  description: string;
};

export type LayeringStep = {
  productId: string;
  brand: string;
  name: string;
  reason: string;
};

export type AnalysisResult = {
  mode: AnalysisMode;
  status: AnalysisStatus;
  confidence: AnalysisConfidence;
  safetyScore: number | null;
  actives: AnalysisActive[];
  conflicts: IngredientConflict[];
  overlaps: IngredientOverlap[];
  layeringOrder: LayeringStep[];
  productsMissingInci: string[];
  engineVersion: string;
  generatedAt: string;
};

export type AnalyzeProductsInput =
  | {
      focusProductId: string;
      language?: Locale;
      withExplanations?: boolean;
    }
  | {
      productIds: string[];
      language?: Locale;
      withExplanations?: boolean;
    };
