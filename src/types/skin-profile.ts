export type SkinProfile = {
  id: string;
  skinType: string | null;
  skinTone: string | null;
  ageRange: string | null;
  ethnicity: string | null;
  currentConcerns: string[];
  knownSensitivities: string[];
  skinGoals: string[];
  countryCode: string | null;
  city: string | null;
  routineComplexity: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SkinProfileOptions = {
  skinTypes: string[];
  skinTones: string[];
  ageRanges: string[];
  ethnicities: string[];
  concerns: string[];
  goals: string[];
  complexities: string[];
};

export type SkinProfileInput = {
  skinType?: string | null;
  skinTone?: string | null;
  ageRange?: string | null;
  ethnicity?: string | null;
  currentConcerns?: string[];
  knownSensitivities?: string[];
  skinGoals?: string[];
  countryCode?: string | null;
  city?: string | null;
  routineComplexity?: string | null;
  locationConsent?: boolean;
};
