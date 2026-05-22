"use client";

import {
  isCapabilityDisabled,
  useUserCapabilities,
} from "@/hooks/use-user-capabilities";

export function useJournalCapabilityFlags() {
  const capabilities = useUserCapabilities();
  const aiActionsDisabled = isCapabilityDisabled(capabilities.aiGeneration);

  return {
    aiActionsDisabled,
    photoActionsDisabled:
      aiActionsDisabled || isCapabilityDisabled(capabilities.imageUpload),
  };
}
