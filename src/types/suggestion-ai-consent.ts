export type SuggestionAiConsent = {
  granted: boolean;
  grantedAt: string | null;
  canReadSensitiveContext: boolean;
  blockedReason: string | null;
  activeSensitiveConsentTypes: string[];
};

export type UpdateSuggestionAiConsentPayload = {
  granted: boolean;
};
