"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { UserCapabilities, UserFeatureAccess } from "@/types/auth";

const ENABLED_ACCESS: UserFeatureAccess = {
  enabled: true,
  blockedBy: null,
  expiresAt: null,
  message: null,
};

export const DEFAULT_USER_CAPABILITIES: UserCapabilities = {
  accountCreation: ENABLED_ACCESS,
  aiGeneration: ENABLED_ACCESS,
  imageUpload: ENABLED_ACCESS,
  productExtraction: ENABLED_ACCESS,
  notifications: ENABLED_ACCESS,
  supportContact: ENABLED_ACCESS,
};

export function useUserCapabilities(): UserCapabilities {
  return useAuthStore(
    (state) => state.user?.capabilities ?? DEFAULT_USER_CAPABILITIES,
  );
}

export function isCapabilityDisabled(
  access: UserFeatureAccess | null | undefined,
): boolean {
  return access?.enabled === false;
}
