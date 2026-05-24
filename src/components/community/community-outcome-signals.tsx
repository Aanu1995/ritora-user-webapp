"use client";

import { Activity, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useMutation,
  useQueryClient,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QueryKey } from "@/constants/query-keys";
import {
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import {
  signalCommunityReviewOutcome,
  signalCommunityRoutineOutcome,
} from "@/services/community.service";
import type {
  CommunityOutcomeSignal,
  CommunityOutcomeSignalCounts,
  CommunityOutcomeSignalInput,
} from "@/types/community";
import { CommunityCheckboxGroup } from "./community-checkbox-group";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import {
  communityOutcomeSignalFormSchema,
  defaultCommunityOutcomeSignalValues,
} from "./community-form-schemas";
import {
  Badge,
  CommunityFieldError,
  CommunitySimpleSelect,
  Field,
  InlineSpinner,
} from "./community-shared";

type CommunityOutcomeSignalsProps = {
  contentId: string;
  contentType: "routine" | "review";
  counts: CommunityOutcomeSignalCounts;
};

const primarySignals: CommunityOutcomeSignal[] = [
  "worked_for_me_too",
  "worked_with_changes",
  "mixed_result",
  "did_not_work",
  "caused_irritation",
];

export function CommunityOutcomeSignals({
  contentId,
  contentType,
  counts,
}: CommunityOutcomeSignalsProps) {
  const t = useTranslations("community.outcomeSignals");
  const options = useCommunityTranslatedOptions();
  const queryClient = useQueryClient();
  const [selectedSignal, setSelectedSignal] =
    useState<CommunityOutcomeSignal | null>(null);
  const signal = useMutation({
    mutationFn: (input: CommunityOutcomeSignalInput) =>
      contentType === "review"
        ? signalCommunityReviewOutcome(contentId, input)
        : signalCommunityRoutineOutcome(contentId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QueryKey.CommunityHome] });
      toast.success(t("addedToast"));
      setSelectedSignal(null);
    },
    onError: () => toast.error(t("failedToast")),
  });
  const worked =
    counts.worked_for_me_too + counts.worked_with_changes;
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface-muted/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">
          <Activity className="h-3 w-3" />
          {t("confirmed", { worked, total })}
        </Badge>
        <span className="text-xs leading-5 text-muted">
          {t("helper")}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {primarySignals.map((value) => {
          const option = options.outcomeSignals.find(
            (item) => item.value === value,
          );
          const loading = signal.isPending && signal.variables?.signal === value;
          return (
            <Button
              key={value}
              type="button"
              variant="outline"
              size="sm"
              disabled={signal.isPending}
              onClick={() => setSelectedSignal(value)}
            >
              {loading ? (
                <InlineSpinner />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {option?.label ?? value}
              <span className="tabular-nums">{counts[value]}</span>
            </Button>
          );
        })}
      </div>
      <OutcomeSignalDialog
        isPending={signal.isPending}
        mutate={signal.mutate}
        onOpenChange={(open) => {
          if (!open && !signal.isPending) setSelectedSignal(null);
        }}
        open={selectedSignal !== null}
        selectedSignal={selectedSignal}
      />
    </div>
  );
}

function OutcomeSignalDialog({
  isPending,
  mutate,
  onOpenChange,
  open,
  selectedSignal,
}: {
  isPending: boolean;
  mutate: UseMutateFunction<unknown, Error, CommunityOutcomeSignalInput, unknown>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  selectedSignal: CommunityOutcomeSignal | null;
}) {
  const t = useTranslations("community.outcomeSignals");
  const options = useCommunityTranslatedOptions();
  const form = useForm({
    defaultValues: defaultCommunityOutcomeSignalValues,
    validators: {
      onChange: communityOutcomeSignalFormSchema,
      onSubmit: communityOutcomeSignalFormSchema,
      onSubmitAsync: async ({ value }) => {
        if (!selectedSignal) {
          return { form: t("chooseOutcomeFirst"), fields: {} };
        }
        const input: CommunityOutcomeSignalInput = {
          signal: selectedSignal,
          sameGoal: value.sameGoal === "true",
          trialDuration:
            value.trialDuration as CommunityOutcomeSignalInput["trialDuration"],
          followedParts:
            value.followedParts as CommunityOutcomeSignalInput["followedParts"],
          irritationLevel:
            value.irritationLevel as CommunityOutcomeSignalInput["irritationLevel"],
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("dialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <form
          className="mt-4 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          noValidate
        >
          <form.Field name="sameGoal">
            {(field) => (
              <OutcomeSelect
                errors={field.state.meta.errors}
                label={t("sameGoal")}
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
                label={t("followedParts")}
                onChange={field.handleChange}
                options={options.outcomeFollowedParts}
                required
                value={field.state.value}
              />
            )}
          </form.Field>
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
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <InlineSpinner />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {isPending ? t("adding") : t("addOutcome")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OutcomeSelect({
  errors,
  label,
  name,
  onBlur,
  onChange,
  options,
  placeholder,
  value,
}: {
  errors: readonly unknown[];
  label: string;
  name: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder: string;
  value: string;
}) {
  void onBlur;
  return (
    <Field label={label} required>
      <CommunitySimpleSelect
        name={name}
        options={options}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      <CommunityFieldError errors={errors} />
    </Field>
  );
}
