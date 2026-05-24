"use client";

import { useForm, useStore } from "@tanstack/react-form";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useUpdateSkinProfile } from "@/hooks/use-skin-profile";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import type { UnsavedChangesGuardRelease } from "@/hooks/use-unsaved-changes-guard";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { cn } from "@/lib/utils";
import { getSkinProfileSubmitError } from "@/lib/skin-profile-submit-errors";
import type {
  ReactionEntry,
  SkinProfile,
  SkinProfileOptions,
} from "@/types/skin-profile";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import type { SectionFormHandle } from "./medical-safety-section";
import { AddReactionForm, reactionLabelFor } from "./add-reaction-form";
import {
  getReactionHistoryFormValues,
  reactionHistorySectionSchema,
} from "./section-form-schemas";
import { SkinProfileValue } from "./skin-profile-domain-values";

interface ReactionsSectionProps {
  profile: SkinProfile;
  options: SkinProfileOptions;
  onPendingChange?: (pending: boolean) => void;
  onSaved?: (release: UnsavedChangesGuardRelease) => void;
}

export const ReactionsSection = forwardRef<
  SectionFormHandle,
  ReactionsSectionProps
>(function ReactionsSection(
  { profile, options, onPendingChange, onSaved },
  ref,
) {
  const t = useTranslations("skinProfile.reactions");
  const tOptions = useTranslations("skinProfile.options");
  const updateMutation = useUpdateSkinProfile();
  const draftDirtyRef = useRef(false);
  const includeConsentRef = useRef(false);
  const pendingConsentSubmitRef = useRef(false);
  const [draftDirty, setDraftDirty] = useState(false);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: getReactionHistoryFormValues(profile),
    canSubmitWhenInvalid: true,
    listeners: {
      onChange: ({ formApi }) => clearSubmitErrors(formApi),
    },
    validators: {
      onChange: reactionHistorySectionSchema,
      onSubmit: reactionHistorySectionSchema,
      onSubmitAsync: async ({ value }) => {
        const consentPayload = includeConsentRef.current
          ? { healthContextConsent: true }
          : {};
        const result = await executeMutation(updateMutation.mutate, {
          reactionHistory: value.reactionHistory,
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
      if (!draftDirtyRef.current) {
        const release = releaseGuard({ removeHistoryEntry: false });
        onSaved?.(release);
      }
      includeConsentRef.current = false;
      setConsentDialogOpen(false);
      toast.success(t("savedChanges"));
    },
  });

  const isFormDirty = useStore(form.store, (state) => state.isDirty);
  const { releaseGuard } = useUnsavedChangesGuard({
    hasUnsavedChanges: isFormDirty || draftDirty,
  });

  useEffect(() => {
    onPendingChange?.(updateMutation.isPending);
  }, [updateMutation.isPending, onPendingChange]);

  const submitWithConsent = (includeConsent: boolean) => {
    pendingConsentSubmitRef.current = false;
    includeConsentRef.current = includeConsent;
    void form.handleSubmit();
  };

  const reactionHistoryTouchesHealthData = () => {
    const reactionHistory = form.getFieldValue("reactionHistory");
    return (
      typeof reactionHistory.has_known_reactions === "boolean" ||
      (reactionHistory.entries?.length ?? 0) > 0
    );
  };

  const submitReactionHistory = () => {
    if (draftDirtyRef.current) {
      toast.error(t("draftUnsavedError"));
      return;
    }

    if (
      !profile.hasHealthContextConsent &&
      reactionHistoryTouchesHealthData()
    ) {
      pendingConsentSubmitRef.current = true;
      setConsentDialogOpen(true);
      return;
    }

    submitWithConsent(false);
  };

  const onConsentAccept = () => {
    setConsentDialogOpen(false);

    if (pendingConsentSubmitRef.current) {
      submitWithConsent(true);
    }
  };

  const onConsentDecline = () => {
    pendingConsentSubmitRef.current = false;
    setConsentDialogOpen(false);
  };

  useImperativeHandle(ref, () => ({
    submit: () => submitReactionHistory(),
  }));

  const setKnownReactionStatus = (hasKnownReactions: boolean) => {
    clearSubmitErrors(form);
    form.setFieldValue("reactionHistory", (current) => ({
      ...current,
      has_known_reactions: hasKnownReactions,
      entries: hasKnownReactions ? (current.entries ?? []) : [],
    }));
  };

  const setEntries = (
    updater: (entries: ReactionEntry[]) => ReactionEntry[],
  ) => {
    clearSubmitErrors(form);
    form.setFieldValue("reactionHistory", (current) => ({
      ...current,
      has_known_reactions: true,
      entries: updater(current.entries ?? []),
    }));
  };

  const handleDraftDirtyChange = (dirty: boolean) => {
    draftDirtyRef.current = dirty;
    setDraftDirty(dirty);
  };

  const onAdd = (entry: ReactionEntry) => {
    setEntries((entries) => [...entries, entry]);
    toast.success(t("saved"));
  };

  const onRemove = (index: number) => {
    setEntries((entries) => entries.filter((_, i) => i !== index));
    toast.success(t("removed"));
  };

  const labelForReaction = (key: string) =>
    reactionLabelFor(key, (optionKey) => tOptions(optionKey));

  return (
    <form.Subscribe
      selector={(state) => ({
        entries: state.values.reactionHistory.entries ?? [],
        hasKnownReactions: state.values.reactionHistory.has_known_reactions,
        submitError: state.errorMap.onSubmit,
      })}
    >
      {({ entries, hasKnownReactions, submitError }) => {
        const formError = readSubmissionErrorMessage(submitError);

        return (
          <>
            <div className="mb-5 rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-foreground">
                {t("historyQuestion")}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {t("historyQuestionHint")}
              </p>
              <div
                className="mt-3 grid gap-2 sm:grid-cols-2"
                role="group"
                aria-label={t("historyQuestion")}
              >
                <button
                  type="button"
                  aria-pressed={hasKnownReactions === true}
                  onClick={() => setKnownReactionStatus(true)}
                  disabled={updateMutation.isPending}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-sm font-semibold transition",
                    hasKnownReactions === true
                      ? "border-accent bg-accent-soft text-accent-strong"
                      : "border-border bg-surface text-foreground hover:border-accent/50",
                  )}
                >
                  {t("hasReactions")}
                </button>
                <button
                  type="button"
                  aria-pressed={hasKnownReactions === false}
                  onClick={() => setKnownReactionStatus(false)}
                  disabled={updateMutation.isPending}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-sm font-semibold transition",
                    hasKnownReactions === false
                      ? "border-accent bg-accent-soft text-accent-strong"
                      : "border-border bg-surface text-foreground hover:border-accent/50",
                  )}
                >
                  {t("noKnownReactions")}
                </button>
              </div>
              {hasKnownReactions === false ? (
                <p className="mt-3 rounded-lg bg-surface-muted px-3 py-2 text-xs text-muted">
                  {t("noKnownReactionsHint")}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {t("logged")}
                </p>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between pb-3">
                    <p className="text-sm font-semibold text-foreground">
                      {t("logged")}
                    </p>
                    <span className="text-xs text-muted">
                      {t("entriesCount", { count: entries.length })}
                    </span>
                  </div>
                  {entries.length === 0 ? (
                    <p className="rounded-lg bg-surface-muted px-3 py-3 text-xs italic text-muted">
                      {t("entriesNone")}
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {entries.map((entry, index) => (
                        <div
                          key={`${entry.trigger}-${index}`}
                          className="rounded-xl border border-border bg-surface p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {entry.trigger}
                              </p>
                              <p className="mt-0.5 text-xs text-muted">
                                {entry.trigger_type
                                  ? `${t("fieldTriggerType")}: ${tOptions(entry.trigger_type)}`
                                  : null}
                                {entry.certainty
                                  ? ` · ${tOptions(entry.certainty)}`
                                  : null}
                              </p>
                            </div>
                            {entry.severity ? (
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  entry.severity === SkinProfileValue.Severe
                                    ? "bg-secondary-soft text-secondary"
                                    : entry.severity ===
                                        SkinProfileValue.Moderate
                                      ? "bg-warning-soft text-warning"
                                      : "bg-surface-muted text-muted"
                                }`}
                              >
                                {tOptions(entry.severity)}
                              </span>
                            ) : null}
                          </div>
                          {entry.reaction_types &&
                          entry.reaction_types.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {entry.reaction_types.map((rt) => (
                                <span
                                  key={rt}
                                  className="rounded-full border border-border px-2 py-0.5 text-[10px] text-foreground"
                                >
                                  {labelForReaction(rt)}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => onRemove(index)}
                              disabled={updateMutation.isPending}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-danger hover:bg-danger/5"
                            >
                              <Trash2 className="h-3 w-3" />
                              {t("remove")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {t("addNew")}
                </p>
                {hasKnownReactions === false ? (
                  <div className="rounded-2xl border border-border bg-surface-muted p-4 text-sm text-muted">
                    {t("addDisabledNoHistory")}
                  </div>
                ) : (
                  <AddReactionForm
                    options={options}
                    pending={updateMutation.isPending}
                    onAdd={onAdd}
                    onDirtyChange={handleDraftDirtyChange}
                  />
                )}
              </div>
            </div>

            {formError ? (
              <p className="mt-4 text-sm text-danger" role="alert">
                {formError}
              </p>
            ) : null}

            <ConfirmDialog
              open={consentDialogOpen}
              onOpenChange={(open) =>
                open ? setConsentDialogOpen(true) : onConsentDecline()
              }
              title={t("consentTitle")}
              description={t("consentDescription")}
              confirmLabel={t("consentAccept")}
              cancelLabel={t("consentDecline")}
              onConfirm={onConsentAccept}
              tone={ConfirmDialogTone.Neutral}
              isPending={updateMutation.isPending}
            />
          </>
        );
      }}
    </form.Subscribe>
  );
});
