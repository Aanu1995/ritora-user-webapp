"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { useUpdateSkinProfile } from "@/hooks/use-skin-profile";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import type { UnsavedChangesGuardRelease } from "@/hooks/use-unsaved-changes-guard";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { getSkinProfileSubmitError } from "@/lib/skin-profile-submit-errors";
import type { SkinProfile, SkinProfileOptions } from "@/types/skin-profile";
import { chipClasses } from "./section-shared";
import type { SectionFormHandle } from "./medical-safety-section";
import { SkinProfileValue } from "./skin-profile-domain-values";
import {
  activeToleranceSectionSchema,
  getActiveToleranceFormValues,
} from "./section-form-schemas";

interface ActiveToleranceSectionProps {
  profile: SkinProfile;
  options: SkinProfileOptions;
  onPendingChange?: (pending: boolean) => void;
  onSaved?: (release: UnsavedChangesGuardRelease) => void;
}

export const ActiveToleranceSection = forwardRef<
  SectionFormHandle,
  ActiveToleranceSectionProps
>(function ActiveToleranceSection(
  { profile, options, onPendingChange, onSaved },
  ref,
) {
  const t = useTranslations("skinProfile.activeTolerance");
  const tOptions = useTranslations("skinProfile.options");
  const updateMutation = useUpdateSkinProfile();

  const form = useForm({
    defaultValues: getActiveToleranceFormValues(profile),
    canSubmitWhenInvalid: true,
    listeners: {
      onChange: ({ formApi }) => clearSubmitErrors(formApi),
    },
    validators: {
      onChange: activeToleranceSectionSchema,
      onSubmit: activeToleranceSectionSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await executeMutation(updateMutation.mutate, {
          activeTolerances: value.activeTolerances,
        });

        if (result.error !== null) {
          return getSkinProfileSubmitError(result.error, t);
        }

        return undefined;
      },
    },
    onSubmit: ({ value }) => {
      form.reset(value);
      const release = releaseGuard({ removeHistoryEntry: false });
      toast.success(t("saved"));
      onSaved?.(release);
    },
  });

  const isFormDirty = useStore(form.store, (state) => state.isDirty);
  const { releaseGuard } = useUnsavedChangesGuard({
    hasUnsavedChanges: isFormDirty,
  });

  useEffect(() => {
    onPendingChange?.(updateMutation.isPending);
  }, [updateMutation.isPending, onPendingChange]);

  useImperativeHandle(ref, () => ({
    submit: () => {
      void form.handleSubmit();
    },
  }));

  const setTolerance = (key: string, level: string | null) => {
    form.setFieldValue("activeTolerances", (prev) => {
      const next = { ...prev };
      if (level === null) {
        delete next[key];
      } else {
        next[key] = {
          tolerance: level,
          last_used: prev[key]?.last_used ?? null,
        };
      }
      return next;
    });
  };

  const setLastUsed = (key: string, date: string) => {
    form.setFieldValue("activeTolerances", (prev) => ({
      ...prev,
      [key]: {
        tolerance: prev[key]?.tolerance ?? SkinProfileValue.ToleratesWell,
        last_used: date || null,
      },
    }));
  };

  return (
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
            <p className="mb-3 text-xs text-muted">{t("introHint")}</p>
            <div className="space-y-3">
              {options.activeIngredients.map((ingredient) => {
                const current = values.activeTolerances[ingredient];
                return (
                  <div
                    key={ingredient}
                    className="rounded-2xl border border-border bg-surface p-4"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {tOptions(ingredient)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {options.activeToleranceLevels.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            setTolerance(
                              ingredient,
                              current?.tolerance === level ? null : level,
                            )
                          }
                          className={chipClasses(current?.tolerance === level)}
                        >
                          {tOptions(level)}
                        </button>
                      ))}
                    </div>
                    {current &&
                    current.tolerance !== SkinProfileValue.NeverTried ? (
                      <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                        <span className="text-xs font-medium text-muted">
                          {t("lastUsed")}
                        </span>
                        <DatePicker
                          value={current.last_used ?? ""}
                          onChange={(next) => setLastUsed(ingredient, next)}
                          ariaLabel={`${t("lastUsed")} · ${tOptions(ingredient)}`}
                          maxDate={new Date()}
                          className="sm:w-56"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {formError ? (
              <p className="mt-4 text-sm text-danger" role="alert">
                {formError}
              </p>
            ) : null}
          </>
        );
      }}
    </form.Subscribe>
  );
});
