export enum UserFeatureAccessBlockedBy {
  UserRestriction = "user_restriction",
  PlatformGlobalRestriction = "platform_global_restriction",
}

export type UserFeatureAccess = {
  enabled: boolean;
  blockedBy: UserFeatureAccessBlockedBy | null;
  expiresAt: string | null;
  message: string | null;
};

export type UserCapabilities = {
  accountCreation: UserFeatureAccess;
  aiGeneration: UserFeatureAccess;
  imageUpload: UserFeatureAccess;
  productExtraction: UserFeatureAccess;
  notifications: UserFeatureAccess;
  supportContact: UserFeatureAccess;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  hasPassword?: boolean;
  preferredLanguage: string;
  timeZone: string | null;
  createdAt: string;
  capabilities?: UserCapabilities;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type RegisterResponse = {
  message: string;
  user: User;
};

export type RefreshResponse = {
  accessToken: string;
};

export type Session = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
};

export type MessageResponse = {
  message: string;
};

export enum AccountDeletionStatus {
  Scheduled = 'scheduled',
  ConfirmationRequired = 'confirmation_required',
}

export enum AccountDeletionTokenMode {
  Confirm = 'confirm',
  Cancel = 'cancel',
}

export type AccountDeletionInput = {
  password: string;
};

export type AccountDeletionResponse = {
  status: AccountDeletionStatus;
  message: string;
  scheduledFor?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export type UpdateProfileInput = {
  firstName: string;
  lastName: string;
};

export type UpdatePreferredLanguageInput = {
  preferredLanguage: string;
};

export type UpdateTimeZoneInput = {
  timeZone: string;
};
