"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import {
  useCreateOnDemandSuggestion,
  useSuggestionAiConsent,
  useUpdateSuggestionAiConsent,
} from "@/hooks/use-suggestions";
import { AiSuggestionConsentDialog } from "./ai-suggestion-consent-dialog";
import { OnDemandSuggestionDialog } from "./on-demand-suggestion-dialog";
import { useOnDemandDialogState } from "./use-on-demand-dialog-state";

const AI_CONSENT_ERROR_TEXT = "ai suggestion consent";

export function useTodayQuickSuggestionFlow() {
  const t = useTranslations("todaysSuggestion.page");
  const quickSuggestion = useOnDemandDialogState();
  const createOnDemandSuggestion = useCreateOnDemandSuggestion();
  const aiConsent = useSuggestionAiConsent();
  const updateAiConsent = useUpdateSuggestionAiConsent();
  const [consentOpen, setConsentOpen] = useState(false);
  const aiConsentMissing = aiConsent.data?.granted === false;

  const openQuickSuggestion = () => {
    if (aiConsent.data?.granted) {
      quickSuggestion.openDialog();
      return;
    }
    setConsentOpen(true);
  };

  const grantAiConsent = (onSuccess: () => void) => {
    updateAiConsent.mutate(
      { granted: true },
      {
        onSuccess: () => {
          onSuccess();
          toast.success(t("aiConsentGranted"));
        },
        onError: () => {
          toast.error(t("aiConsentFailed"));
        },
      },
    );
  };

  const dialogs = (
    <>
      <AiSuggestionConsentDialog
        open={consentOpen}
        pending={updateAiConsent.isPending}
        onOpenChange={setConsentOpen}
        onGrant={() =>
          grantAiConsent(() => {
            setConsentOpen(false);
            quickSuggestion.openDialog();
          })
        }
      />
      <OnDemandSuggestionDialog
        open={quickSuggestion.open}
        isSubmitting={createOnDemandSuggestion.isPending}
        requestId={quickSuggestion.requestId}
        onOpenChange={quickSuggestion.handleOpenChange}
        onSubmit={(payload) => {
          createOnDemandSuggestion.mutate(payload, {
            onSuccess: () => {
              quickSuggestion.closeDialog();
              toast.success(t("quickSuggestionQueued"));
            },
            onError: (error) => {
              if (isAiConsentError(error)) {
                setConsentOpen(true);
                toast.error(t("quickSuggestionConsentRequired"));
                return;
              }
              toast.error(
                getApiErrorMessage(error) ?? t("quickSuggestionFailed"),
              );
            },
          });
        }}
      />
    </>
  );

  return {
    aiConsentMissing,
    dialogs,
    grantAiConsentForScheduled: () => grantAiConsent(() => undefined),
    isGrantingAiConsent: updateAiConsent.isPending,
    openQuickSuggestion,
  };
}

function isAiConsentError(error: unknown): boolean {
  const message = getApiErrorMessage(error)?.toLowerCase() ?? "";
  return (
    getApiErrorStatus(error) === 403 &&
    message.includes(AI_CONSENT_ERROR_TEXT)
  );
}
