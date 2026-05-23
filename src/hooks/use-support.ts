"use client";

import { useMutation } from "@tanstack/react-query";
import { createSupportFeedback } from "@/services/support.service";
import type { CreateSupportFeedbackPayload } from "@/types/support";

export function useCreateSupportFeedback() {
  return useMutation({
    mutationFn: (payload: CreateSupportFeedbackPayload) =>
      createSupportFeedback(payload),
  });
}
