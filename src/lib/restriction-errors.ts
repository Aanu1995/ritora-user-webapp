import { getApiErrorCode } from "@/lib/api-error";

export enum RestrictionApiErrorCode {
  AccountRestrictionCapabilityBlocked = "ACCOUNT_RESTRICTION_CAPABILITY_BLOCKED",
  PlatformGlobalRestrictionActive = "PLATFORM_GLOBAL_RESTRICTION_ACTIVE",
}

const RESTRICTION_API_ERROR_CODES = new Set<string>(
  Object.values(RestrictionApiErrorCode),
);

export function isRestrictionApiError(error: unknown): boolean {
  const code = getApiErrorCode(error);
  return typeof code === "string" && RESTRICTION_API_ERROR_CODES.has(code);
}
