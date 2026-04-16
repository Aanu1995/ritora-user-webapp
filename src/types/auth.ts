export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  preferredLanguage: string;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type RegisterResponse = {
  accessToken?: string;
  user?: User;
  message?: string;
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
