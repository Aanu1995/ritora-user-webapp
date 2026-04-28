"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Ref } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AppRoute } from "@/constants/app-routes";
import { Button } from "@/components/ui/button";
import {
  useDeleteSkinProfileHormonalContext,
  useUpdateSkinProfile,
} from "@/hooks/use-skin-profile";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { getSkinProfileSubmitError } from "@/lib/skin-profile-submit-errors";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes-store";
import type { SkinProfile, SkinProfileOptions } from "@/types/skin-profile";
import { HormonalContextConsentDialog } from "./hormonal-context-consent-dialog";
import type { SectionFormHandle } from "./medical-safety-section";
import { FieldHeader, SectionShell, chipClasses } from "./section-shared";
import {
  TRI_STATE_BOOLEAN_OPTIONS,
  TriStateBooleanValue,
} from "./skin-profile-domain-values";
import {
  buildHormonalPayload,
  getHormonalFormValues,
  hormonalSectionSchema,
  type HormonalFormValues,
} from "./section-form-schemas";

interface HormonalSectionProps {
  profile: SkinProfile;
  options: SkinProfileOptions;
  submitRef?: Ref<SectionFormHandle>;
  onPendingChange?: (pending: boolean) => void;
}

export function HormonalSection({
  profile,
  options,
  submitRef,
  onPendingChange,
}: HormonalSectionProps) {
  const t = useTranslations("skinProfile.hormonal");
  const tOptions = useTranslations("skinProfile.options");
  const router = useRouter();
  const updateMutation = useUpdateSkinProfile();
  const deleteMutation = useDeleteSkinProfileHormonalContext();
  const requestLeave = useUnsavedChangesStore((state) => state.requestLeave);
  const pendingConsentSubmitRef = useRef(false);
  const consentAcceptedRef = useRef(profile.hasHormonalContextConsent);
  const [consentAccepted, setConsentAccepted] = useState(
    profile.hasHormonalContextConsent,
  );
  const [consentOpen, setConsentOpen] = useState(
    !profile.hasHormonalContextConsent,
  );

  const form = useForm({
    defaultValues: getHormonalFormValues(profile.hormonalContext ?? {}),
    canSubmitWhenInvalid: true,
    listeners: {
      onChange: ({ formApi }) => clearSubmitErrors(formApi),
    },
    validators: {
      onChange: hormonalSectionSchema,
      onSubmit: hormonalSectionSchema,
      onSubmitAsync: async ({ value }) => {
        if (!consentAcceptedRef.current) {
          setConsentOpen(true);
          return t("consentRequiredError");
        }

        const result = await executeMutation(updateMutation.mutate, {
          hormonalContext: buildHormonalPayload(value),
          hormonalContextConsent: true,
        });

        if (result.error !== null) {
          return getSkinProfileSubmitError(result.error, t);
        }

        return undefined;
      },
    },
    onSubmit: ({ value }) => {
      form.reset(value);
      releaseGuard();
      toast.success(t("saved"));
    },
  });

  const isMutating = updateMutation.isPending || deleteMutation.isPending;
  const isFormDirty = useStore(form.store, (state) => state.isDirty);
  const { releaseGuard } = useUnsavedChangesGuard({
    hasUnsavedChanges: isFormDirty,
  });

  useEffect(() => {
    onPendingChange?.(isMutating);
  }, [isMutating, onPendingChange]);

  const setConsentAcceptedValue = (value: boolean) => {
    consentAcceptedRef.current = value;
    setConsentAccepted(value);
  };

  const setStringField = (field: keyof HormonalFormValues, value: string) => {
    clearSubmitErrors(form);
    form.setFieldValue(field, (previous) => (previous === value ? "" : value));
  };

  const translateBoolean = (value: string) =>
    value === TriStateBooleanValue.Yes
      ? t("yes")
      : value === TriStateBooleanValue.No
        ? t("no")
        : tOptions(value);

  const acceptConsent = () => {
    setConsentAcceptedValue(true);
    setConsentOpen(false);

    if (!pendingConsentSubmitRef.current) {
      return;
    }

    pendingConsentSubmitRef.current = false;
    void form.handleSubmit();
  };

  const declineConsent = () => {
    pendingConsentSubmitRef.current = false;
    setConsentOpen(false);
    requestLeave(() => router.push(AppRoute.SkinProfile));
  };

  const requestSave = () => {
    if (!consentAcceptedRef.current) {
      pendingConsentSubmitRef.current = true;
      setConsentOpen(true);
      return;
    }
    void form.handleSubmit();
  };

  useImperativeHandle(submitRef, () => ({
    submit: requestSave,
  }));

  const revoke = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        form.reset(getHormonalFormValues({}));
        releaseGuard();
        setConsentAcceptedValue(false);
        toast.success(t("deleted"));
      },
    });
  };

  return (
    <>
      <form.Subscribe
        selector={(state) => ({
          values: state.values,
          submitError: state.errorMap.onSubmit,
        })}
      >
        {({ values, submitError }) => {
          const formError = readSubmissionErrorMessage(submitError);

          return (
            <>
              {!consentAccepted ? (
                <div className="mb-4 rounded-2xl border border-accent/25 bg-accent-soft px-4 py-3 text-sm text-foreground">
                  <p className="font-semibold">{t("consentPromptTitle")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {t("consentPromptBody")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setConsentOpen(true)}
                  >
                    {t("reviewConsent")}
                  </Button>
                </div>
              ) : null}

              <SectionShell>
                <div className="space-y-3 py-5">
                  <FieldHeader
                    question={t("questionCyclePattern")}
                    why={t("whyCyclePattern")}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {options.cyclePatterns.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStringField("cyclePattern", value)}
                        className={chipClasses(values.cyclePattern === value)}
                      >
                        {tOptions(value)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 py-5">
                  <FieldHeader
                    question={t("questionBreakoutPattern")}
                    why={t("whyBreakoutPattern")}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {options.hormonalBreakoutPatterns.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStringField("breakoutPattern", value)}
                        className={chipClasses(
                          values.breakoutPattern === value,
                        )}
                      >
                        {tOptions(value)}
                      </button>
                    ))}
                  </div>
                </div>

                <BooleanQuestion
                  question={t("questionCycleRelated")}
                  why={t("whyCycleRelated")}
                  value={values.cycleRelatedBreakouts}
                  onChange={(value) =>
                    setStringField("cycleRelatedBreakouts", value)
                  }
                  translate={translateBoolean}
                />

                <BooleanQuestion
                  question={t("questionHormonalContraception")}
                  why={t("whyHormonalContraception")}
                  value={values.usesHormonalContraception}
                  onChange={(value) =>
                    setStringField("usesHormonalContraception", value)
                  }
                  translate={translateBoolean}
                />

                <BooleanQuestion
                  question={t("questionMenopause")}
                  why={t("whyMenopause")}
                  value={values.menopauseRelatedChanges}
                  onChange={(value) =>
                    setStringField("menopauseRelatedChanges", value)
                  }
                  translate={translateBoolean}
                />
              </SectionShell>

              {formError ? (
                <p className="mt-4 text-sm text-danger" role="alert">
                  {formError}
                </p>
              ) : null}

              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">{t("footerHint")}</p>
                {profile.hasHormonalContextConsent ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-danger hover:bg-danger/5"
                    disabled={isMutating}
                    onClick={revoke}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("deleteThisData")}
                  </Button>
                ) : null}
              </div>
            </>
          );
        }}
      </form.Subscribe>

      <HormonalContextConsentDialog
        open={consentOpen}
        pending={isMutating}
        onAccept={acceptConsent}
        onDecline={declineConsent}
      />
    </>
  );
}

function BooleanQuestion({
  question,
  why,
  value,
  onChange,
  translate,
}: {
  question: string;
  why: string;
  value: string;
  onChange: (value: string) => void;
  translate: (value: string) => string;
}) {
  return (
    <div className="space-y-3 py-5">
      <FieldHeader question={question} why={why} />
      <div className="flex flex-wrap gap-1.5">
        {TRI_STATE_BOOLEAN_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={chipClasses(value === option)}
          >
            {translate(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
