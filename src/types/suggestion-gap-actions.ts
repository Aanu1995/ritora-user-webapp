export type SuggestionGapActionKind = "saved" | "dismissed";
export type SuggestionGapActionSourceType = "today" | "smart_pick";

export type RecordSuggestionGapActionPayload = {
  sourceType?: SuggestionGapActionSourceType;
  suggestionInstanceId?: string;
  smartPickProductSuggestionId?: string;
  ingredientOrCategory?: string;
  action: SuggestionGapActionKind;
};

export type SuggestionGapActionResponse = {
  sourceType: SuggestionGapActionSourceType;
  suggestionInstanceId: string | null;
  smartPickProductSuggestionId: string | null;
  ingredientOrCategory: string;
  normalizedKey: string;
  action: SuggestionGapActionKind;
};
