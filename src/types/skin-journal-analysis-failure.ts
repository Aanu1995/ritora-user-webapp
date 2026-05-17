export type AnalysisFailureCode =
  | "provider_unavailable"
  | "provider_rate_limited"
  | "provider_timeout"
  | "provider_invalid_response"
  | "photo_preflight_rejected"
  | "payload_too_large"
  | "cost_limit_exceeded"
  | "configuration_error"
  | "invalid_photo_input"
  | "unknown";
