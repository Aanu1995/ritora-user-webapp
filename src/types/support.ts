export enum SupportFeedbackType {
  Bug = "bug",
  Suggestion = "suggestion",
  ConfusingResult = "confusing_result",
  UnsafeRecommendation = "unsafe_recommendation",
  ProductDataIssue = "product_data_issue",
  BillingPricing = "billing_pricing",
  Account = "account",
  Other = "other",
}

export enum SupportFeedbackStatus {
  New = "new",
  Triaged = "triaged",
  Planned = "planned",
  Fixed = "fixed",
  Closed = "closed",
}

export type SupportFeedbackContext = {
  appVersion?: string;
  browser?: string;
  locale?: string;
  requestId?: string;
  route?: string;
};

export type CreateSupportFeedbackPayload = {
  context?: SupportFeedbackContext;
  description: string;
  title: string;
  type: SupportFeedbackType;
};

export type SupportFeedbackCreated = {
  createdAt: string;
  id: string;
  status: SupportFeedbackStatus;
};
