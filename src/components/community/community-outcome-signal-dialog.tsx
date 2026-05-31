"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type UseMutateFunction } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { cn } from "@/lib/utils";
import type {
  CommunityOutcomeSignal,
  CommunityOutcomeSignalInput,
  CommunityOutcomeSignalResponse,
} from "@/types/community";
import { CommunityCheckboxGroup } from "./community-checkbox-group";
import {
  communityOutcomeSignalFormSchema,
  defaultCommunityOutcomeSignalValues,
} from "./community-form-schemas";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import {
  isPrimarySignal,
  SIGNAL_ICON_CLASS,
  SIGNAL_META,
  SIGNAL_PILL_CLASS,
} from "./community-outcome-signal-meta";
import { CommunityOutcomeProductsFieldFromShelf } from "./community-outcome-products-field";
import {
  CommunityFieldError,
  CommunitySimpleSelect,
  CommunityTextareaField,
  Field,
  FormSection,
  InlineSpinner,
} from "./community-shared";

type OutcomeSignalDialogProps = {
  contentType: "routine" | "review";
  isPending: boolean;
  mutate: UseMutateFunction<
    CommunityOutcomeSignalResponse,
    Error,
    CommunityOutcomeSignalInput,
    unknown
  >;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  selectedSignal: CommunityOutcomeSignal | null;
};

export function OutcomeSignalDialog({
  contentType,
  isPending,
  mutate,
  onOpenChange,
  open,
  selectedSignal,
}: OutcomeSignalDialogProps) {
  const t = useTranslations("community.outcomeSignals");
  const options = useCommunityTranslatedOptions();
  const isReview = contentType === "review";
  const followedPartOptions = isReview
    ? options.reviewOutcomeFollowedParts
    : options.outcomeFollowedParts;
  const form = useForm({
    defaultValues: defaultCommunityOutcomeSignalValues,
    validators: {
      onChange: communityOutcomeSignalFormSchema,
      onSubmit: communityOutcomeSignalFormSchema,
      onSubmitAsync: async ({ value }) => {
        if (!selectedSignal) {
          return { form: t("chooseOutcomeFirst"), fields: {} };
        }
        const baseInput: CommunityOutcomeSignalInput = {
          signal: selectedSignal,
          sameGoal: value.sameGoal === "true",
          trialDuration:
            value.trialDuration as CommunityOutcomeSignalInput["trialDuration"],
          followedParts:
            value.followedParts as CommunityOutcomeSignalInput["followedParts"],
          irritationLevel:
            value.irritationLevel as CommunityOutcomeSignalInput["irritationLevel"],
        };
        const input: CommunityOutcomeSignalInput = {
          ...baseInput,
          note: value.note.trim() || null,
          routineSlot:
            (value.routineSlot as CommunityOutcomeSignalInput["routineSlot"]) ||
            null,
          usedWithProducts: value.usedWithProducts
            .filter((item) => item.productId || item.productName.trim())
            .map((item) => ({
              category: item.category,
              productBrand: item.productBrand.trim() || null,
              productId: item.productId || null,
              productName: item.productName.trim() || null,
            })),
        };
        const result = await executeMutation(mutate, input);
        if (result.error !== null) {
          return { form: t("addFailed"), fields: {} };
        }
        form.reset();
        return undefined;
      },
    },
    onSubmit: () => undefined,
  });

  const tShort = useTranslations("community.outcomeSignals.shortLabels");
  const selectedMeta = isPrimarySignal(selectedSignal)
    ? SIGNAL_META[selectedSignal]
    : null;
  const selectedFullLabel = selectedSignal
    ? (options.outcomeSignals.find((item) => item.value === selectedSignal)
        ?.label ?? selectedSignal)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          noValidate
        >
          <div className="flex flex-col gap-3 px-6 pb-3 pt-6">
            <DialogHeader>
              <DialogTitle>
                {isReview ? t("reviewDialogTitle") : t("dialogTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs leading-5">
                {isReview
                  ? t("reviewDialogDescription")
                  : t("dialogDescription")}
              </DialogDescription>
            </DialogHeader>

            {selectedSignal && selectedMeta ? (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                  SIGNAL_PILL_CLASS[selectedMeta.tone],
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    SIGNAL_ICON_CLASS[selectedMeta.tone],
                  )}
                >
                  <selectedMeta.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {t("yourOutcome")}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {tShort(selectedSignal)}
                  </p>
                </div>
                <p className="hidden text-xs leading-snug text-muted sm:block sm:max-w-[12rem] sm:text-right">
                  {selectedFullLabel}
                </p>
              </div>
            ) : null}
          </div>

          {/* Form body — required experience first, optional
              context second. Notes and product context are
              moderated before public display for both product
              reviews and playbooks. */}
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
            <FormSection title={t("yourExperienceGroup")}>
              <form.Field name="sameGoal">
                {(field) => (
                  <OutcomeSelect
                    errors={field.state.meta.errors}
                    hint={t("sameGoalHint")}
                    label={isReview ? t("reviewSameGoal") : t("sameGoal")}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    options={[
                      { value: "true", label: t("sameGoalYes") },
                      { value: "false", label: t("sameGoalNo") },
                    ]}
                    placeholder={t("choose")}
                    value={field.state.value}
                  />
                )}
              </form.Field>
              <form.Field name="trialDuration">
                {(field) => (
                  <OutcomeSelect
                    errors={field.state.meta.errors}
                    hint={
                      isReview
                        ? t("reviewTrialDurationHint")
                        : t("trialDurationHint")
                    }
                    label={t("trialDuration")}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    options={options.outcomeTrialDurations}
                    placeholder={t("chooseDuration")}
                    value={field.state.value}
                  />
                )}
              </form.Field>
              <form.Field name="irritationLevel">
                {(field) => (
                  <OutcomeSelect
                    errors={field.state.meta.errors}
                    hint={t("irritationHint")}
                    label={t("irritation")}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    options={options.outcomeIrritations}
                    placeholder={t("chooseIrritation")}
                    value={field.state.value}
                  />
                )}
              </form.Field>
              <form.Field name="followedParts">
                {(field) => (
                  <CommunityCheckboxGroup
                    errors={field.state.meta.errors}
                    hint={
                      isReview
                        ? t("reviewFollowedPartsHint")
                        : t("followedPartsHint")
                    }
                    label={
                      isReview ? t("reviewFollowedParts") : t("followedParts")
                    }
                    onChange={field.handleChange}
                    options={followedPartOptions}
                    required
                    value={field.state.value}
                  />
                )}
              </form.Field>
            </FormSection>

            <FormSection
              title={t("routineContextGroup")}
              description={t("routineContextGroupDescription")}
            >
              <form.Field name="routineSlot">
                {(field) => (
                  <OutcomeSelect
                    errors={field.state.meta.errors}
                    hint={t("resultRoutineSlotHint")}
                    label={t("resultRoutineSlot")}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    options={options.reviewRoutineSlots}
                    placeholder={t("choose")}
                    required={false}
                    value={field.state.value}
                  />
                )}
              </form.Field>
              <form.Field name="usedWithProducts">
                {(field) => (
                  <CommunityOutcomeProductsFieldFromShelf
                    errors={field.state.meta.errors}
                    onChange={field.handleChange}
                    value={field.state.value}
                  />
                )}
              </form.Field>
              <form.Field name="note">
                {(field) => (
                  <CommunityTextareaField
                    field={field}
                    hint={t("resultNoteHint")}
                    label={t("resultNote")}
                    maxLength={500}
                    placeholder={t("resultNotePlaceholder")}
                  />
                )}
              </form.Field>
            </FormSection>

            <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
              {(submitError) => {
                const message = readSubmissionErrorMessage(submitError);
                return message ? (
                  <p
                    className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
                    role="alert"
                  >
                    {message}
                  </p>
                ) : null;
              }}
            </form.Subscribe>

            {/* Submit button flows inline with the form body so it
                scrolls with the fields instead of being pinned at
                the bottom of the dialog. Spacing above (mt-2) and
                below (pb-6 on the parent) keeps it from butting up
                against the last field or the dialog edge. */}
            <div className="mt-2 flex justify-end">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? (
                  <InlineSpinner />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isPending
                  ? t("adding")
                  : isReview
                    ? t("reviewAddOutcome")
                    : t("addOutcome")}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OutcomeSelect({
  errors,
  hint,
  label,
  name,
  onBlur,
  onChange,
  options,
  placeholder,
  required = true,
  value,
}: {
  errors: readonly unknown[];
  hint?: string;
  label: string;
  name: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  void onBlur;
  return (
    <Field hint={hint} label={label} required={required}>
      <CommunitySimpleSelect
        name={name}
        options={options}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      <CommunityFieldError errors={errors} />
    </Field>
  );
}
