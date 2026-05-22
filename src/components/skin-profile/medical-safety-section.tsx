"use client";

import { useForm, useStore } from "@tanstack/react-form";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import { AppRoute } from "@/constants/app-routes";
import {
  useDeleteSkinProfileHealthContext,
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
import type {
  SafetyContext,
  SkinProfile,
  SkinProfileOptions,
} from "@/types/skin-profile";
import { MedicalSafetyConsentDialog } from "./medical-safety-consent-dialog";
import { MedicalSafetyFields } from "./medical-safety-fields";
import {
  buildMedicalSafetyPayload,
  getMedicalSafetyFormValues,
  medicalSafetySectionSchema,
} from "./section-form-schemas";

interface MedicalSafetySectionProps {
  profile: SkinProfile;
  options: SkinProfileOptions;
  onPendingChange?: (pending: boolean) => void;
}

export interface SectionFormHandle {
  submit: () => void;
}

type Updater<T> = T | ((previous: T) => T);

function applyUpdater<T>(current: T, updater: Updater<T>): T {
  return typeof updater === "function"
    ? (updater as (previous: T) => T)(current)
    : updater;
}

type AnsweredKey =
  | "pregnancy"
  | "conditions"
  | "medications"
  | "procedures"
  | "dermCare";

const ALL_ANSWERED_KEYS: AnsweredKey[] = [
  "pregnancy",
  "conditions",
  "medications",
  "procedures",
  "dermCare",
];

export const MedicalSafetySection = forwardRef<
  SectionFormHandle,
  MedicalSafetySectionProps
>(function MedicalSafetySection({ profile, options, onPendingChange }, ref) {
  const t = useTranslations("skinProfile.medicalSafety");
  const router = useRouter();
  const updateMutation = useUpdateSkinProfile();
  const deleteMutation = useDeleteSkinProfileHealthContext();
  const requestLeave = useUnsavedChangesStore((state) => state.requestLeave);
  const includeConsentRef = useRef(false);
  const pendingConsentSubmitRef = useRef(false);

  const [localConsentAccepted, setLocalConsentAccepted] = useState(
    profile.hasHealthContextConsent,
  );
  const [consentDialogOpen, setConsentDialogOpen] = useState(
    !profile.hasHealthContextConsent,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [answeredKeys, setAnsweredKeys] = useState<Set<AnsweredKey>>(
    () => new Set(ALL_ANSWERED_KEYS),
  );

  const markAnswered = (key: AnsweredKey) => {
    setAnsweredKeys((current) => {
      if (current.has(key)) return current;
      const next = new Set(current);
      next.add(key);
      return next;
    });
  };

  const form = useForm({
    defaultValues: getMedicalSafetyFormValues(profile),
    canSubmitWhenInvalid: true,
    listeners: {
      onChange: ({ formApi }) => clearSubmitErrors(formApi),
    },
    validators: {
      onChange: medicalSafetySectionSchema,
      onSubmit: medicalSafetySectionSchema,
      onSubmitAsync: async ({ value }) => {
        const consentPayload = includeConsentRef.current
          ? { healthContextConsent: true }
          : {};
        const result = await executeMutation(updateMutation.mutate, {
          ...buildMedicalSafetyPayload(value),
          ...consentPayload,
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
      includeConsentRef.current = false;
      setConsentDialogOpen(false);
    },
  });

  const isFormDirty = useStore(form.store, (state) => state.isDirty);
  const { releaseGuard } = useUnsavedChangesGuard({
    hasUnsavedChanges: isFormDirty,
  });

  useEffect(() => {
    onPendingChange?.(updateMutation.isPending);
  }, [updateMutation.isPending, onPendingChange]);

  const submitWithConsent = (includeConsent: boolean) => {
    pendingConsentSubmitRef.current = false;
    includeConsentRef.current = includeConsent;
    void form.handleSubmit();
  };

  const onSaveClick = () => {
    if (!localConsentAccepted) {
      pendingConsentSubmitRef.current = true;
      setConsentDialogOpen(true);
      return;
    }
    submitWithConsent(!profile.hasHealthContextConsent);
  };

  const onConsentAccept = () => {
    setLocalConsentAccepted(true);
    setConsentDialogOpen(false);

    if (pendingConsentSubmitRef.current) {
      submitWithConsent(true);
    }
  };

  const onConsentDecline = () => {
    pendingConsentSubmitRef.current = false;
    setConsentDialogOpen(false);
    requestLeave(() => router.push(AppRoute.SkinProfile));
  };

  useImperativeHandle(ref, () => ({
    submit: onSaveClick,
  }));

  const onDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        form.reset({
          pregnancyStatus: null,
          underDermatologistCare: null,
          safetyContext: {
            conditions: [],
            medications: [],
            photosensitizing_other: false,
            recent_procedures: [],
          },
        });
        releaseGuard();
        toast.success(t("deleted"));
        setDeleteDialogOpen(false);
      },
    });
  };

  const setSafetyContext = (updater: Updater<SafetyContext>) => {
    form.setFieldValue("safetyContext", (current) =>
      applyUpdater(current, updater),
    );
  };

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values,
        submitError: state.errorMap.onSubmit,
      })}
    >
      {({ values, submitError }) => {
        const safety = values.safetyContext;
        const formError = readSubmissionErrorMessage(submitError);

        return (
          <>
            {profile.hasHealthContextConsent ? (
              <div className="mb-4 rounded-2xl border border-accent/20 bg-accent-soft/50 p-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="grid h-7 w-7 flex-none place-items-center rounded-full bg-accent text-white"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t("consentActiveTitle")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {t("consentActiveBody", {
                        date: new Date(profile.updatedAt).toLocaleDateString(),
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <MedicalSafetyFields
              options={options}
              sexAtBirth={profile.sexAtBirth}
              pregnancyStatus={values.pregnancyStatus}
              setPregnancyStatus={(updater) => {
                markAnswered("pregnancy");
                form.setFieldValue("pregnancyStatus", (current) =>
                  applyUpdater(current, updater),
                );
              }}
              conditions={safety.conditions ?? []}
              setConditions={(updater) => {
                markAnswered("conditions");
                setSafetyContext((current) => ({
                  ...current,
                  conditions: applyUpdater(current.conditions ?? [], updater),
                }));
              }}
              medications={safety.medications ?? []}
              setMedications={(updater) => {
                markAnswered("medications");
                setSafetyContext((current) => ({
                  ...current,
                  medications: applyUpdater(current.medications ?? [], updater),
                }));
              }}
              photosensitizingOther={Boolean(safety.photosensitizing_other)}
              setPhotosensitizingOther={(updater) => {
                markAnswered("medications");
                setSafetyContext((current) => ({
                  ...current,
                  photosensitizing_other: applyUpdater(
                    Boolean(current.photosensitizing_other),
                    updater,
                  ),
                }));
              }}
              recentProcedures={safety.recent_procedures ?? []}
              setRecentProcedures={(updater) => {
                markAnswered("procedures");
                setSafetyContext((current) => ({
                  ...current,
                  recent_procedures: applyUpdater(
                    current.recent_procedures ?? [],
                    updater,
                  ),
                }));
              }}
              dermCare={values.underDermatologistCare}
              setDermCare={(updater) => {
                markAnswered("dermCare");
                form.setFieldValue("underDermatologistCare", (current) =>
                  applyUpdater(current, updater),
                );
              }}
            />

            {formError ? (
              <p className="mt-4 text-sm text-danger" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("questionsAnswered", {
                    answered: answeredKeys.size,
                    total: 5,
                  })}
                </p>
                <p className="text-xs text-muted">
                  {t("questionsAnsweredHint")}
                </p>
              </div>
              {profile.hasHealthContextConsent ? (
                <Button
                  variant="ghost"
                  type="button"
                  size="sm"
                  className="text-danger hover:bg-danger/5"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  {t("deleteThisData")}
                </Button>
              ) : null}
            </div>

            <MedicalSafetyConsentDialog
              open={consentDialogOpen}
              pending={updateMutation.isPending}
              onAccept={onConsentAccept}
              onDecline={onConsentDecline}
            />

            <ConfirmDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              title={t("deleteConfirmTitle")}
              description={t("deleteConfirmBody")}
              confirmLabel={t("deleteConfirmAction")}
              cancelLabel={t("deleteCancel")}
              tone={ConfirmDialogTone.Danger}
              onConfirm={onDelete}
              isPending={deleteMutation.isPending}
            />
          </>
        );
      }}
    </form.Subscribe>
  );
});
