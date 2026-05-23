"use client";

import { Check, ShieldCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryKey } from "@/constants/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { cn } from "@/lib/utils";
import {
  createCommunityReview,
  createCommunityRoutine,
} from "@/services/community.service";
import {
  communityReviewFormSchema,
  communityRoutineFormSchema,
  defaultCommunityReviewValues,
  defaultCommunityRoutineValues,
} from "./community-form-schemas";
import {
  CommunityDisclosureSelect,
  CommunityFieldError,
  CommunityTextareaField,
  Field,
  FormGrid,
  FormSection,
  InlineSpinner,
} from "./community-shared";

export function WriteReviewForm() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createCommunityReview,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: [QueryKey.CommunityHome] });
      toast.success(
        result.moderationStatus === "published"
          ? "Review published."
          : "Review sent to moderation.",
      );
    },
  });
  const form = useForm({
    defaultValues: defaultCommunityReviewValues,
    validators: {
      onChange: communityReviewFormSchema,
      onSubmit: communityReviewFormSchema,
      onSubmitAsync: async ({ value, formApi }) => {
        const result = await executeMutation(mutation.mutate, {
          productBrand: value.productBrand,
          productName: value.productName,
          productCategory: value.productCategory,
          disclosureType: value.disclosureType,
          usageDuration: value.usageDuration,
          frequency: value.frequency,
          outcomes: value.outcomes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          repurchase: value.repurchase,
          routineContext: [{ category: value.contextCategory }],
          body: value.body,
        });

        if (result.error !== null) {
          return {
            form:
              getApiErrorMessage(result.error) ??
              "Review could not be submitted.",
            fields: {},
          };
        }

        if (result.data.moderationStatus === "published") {
          formApi.reset();
        } else {
          formApi.setFieldValue(
            "body",
            "Your review was received and is pending moderation.",
          );
        }
        return undefined;
      },
    },
    onSubmit: () => undefined,
  });

  const textField = (
    name: "productBrand" | "productName" | "outcomes",
    label: string,
    placeholder?: string,
  ) => (
    <form.Field name={name}>
      {(field) => {
        const invalid = field.state.meta.errors.length > 0;
        return (
          <Field label={label} required>
            <Input
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder={placeholder}
              aria-invalid={invalid}
              className={cn(
                invalid && "border-danger focus-visible:ring-danger/30",
              )}
            />
            <CommunityFieldError errors={field.state.meta.errors} />
          </Field>
        );
      }}
    </form.Field>
  );

  return (
    <form
      className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      noValidate
    >
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
          Write a review
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Disclosure, usage, outcome and routine context are all required so the
          review can be ranked for people like you.
        </p>
      </div>

      <div className="grid gap-6">
        <FormSection title="Product">
          <FormGrid>
            {textField("productBrand", "Brand", "e.g. La Roche-Posay")}
            {textField("productName", "Product", "e.g. Toleriane Sensitive Fluid")}
          </FormGrid>
        </FormSection>

        <FormSection
          title="Context"
          description="Outcomes are routine-dependent — Ritora ranks reviews against the rest of your shelf."
        >
          <FormGrid>
            <form.Field name="disclosureType">
              {(field) => <CommunityDisclosureSelect field={field} />}
            </form.Field>
            {textField(
              "outcomes",
              "Outcomes",
              "Comma-separated: helped, repurchased…",
            )}
          </FormGrid>
        </FormSection>

        <FormSection
          title="In your own words"
          description="Optional. Avoid medical claims like cure, treat or diagnose — they will be sent to moderation."
        >
          <form.Field name="body">
            {(field) => (
              <CommunityTextareaField
                field={field}
                label="Review text"
                placeholder="I switched after my niacinamide-and-AHA combo wrecked my cheeks for a week. This fluid is the only thing that didn't sting…"
                maxLength={1200}
              />
            )}
          </form.Field>
        </FormSection>
      </div>

      <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
        {(submitError) => {
          const message = readSubmissionErrorMessage(submitError);
          return message ? (
            <p
              className="mt-4 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {message}
            </p>
          ) : null;
        }}
      </form.Subscribe>

      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => {
          const busy = isSubmitting || mutation.isPending;
          return (
            <Button
              className="mt-5 w-full sm:w-auto"
              type="submit"
              disabled={!canSubmit || busy}
            >
              {busy ? <InlineSpinner /> : <Check className="h-4 w-4" />}
              {busy ? "Submitting…" : "Submit review"}
            </Button>
          );
        }}
      </form.Subscribe>
    </form>
  );
}

export function PublishRoutineForm() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createCommunityRoutine,
    onSuccess: (routine) => {
      void queryClient.invalidateQueries({ queryKey: [QueryKey.CommunityHome] });
      toast.success(
        routine.moderationStatus === "published"
          ? "Routine published."
          : "Routine sent to moderation.",
      );
    },
  });
  const form = useForm({
    defaultValues: defaultCommunityRoutineValues,
    validators: {
      onChange: communityRoutineFormSchema,
      onSubmit: communityRoutineFormSchema,
      onSubmitAsync: async ({ value, formApi }) => {
        const result = await executeMutation(mutation.mutate, {
          title: value.title,
          summary: value.summary,
          disclosureType: value.disclosureType,
          concernTags: ["barrier"],
          goalTags: ["maintenance"],
          steps: [
            {
              slot: "am",
              category: value.category,
              frequency: "daily",
              notes: value.summary,
            },
          ],
        });

        if (result.error !== null) {
          return {
            form:
              getApiErrorMessage(result.error) ??
              "Routine could not be submitted.",
            fields: {},
          };
        }

        if (result.data.moderationStatus === "published") {
          formApi.reset();
        } else {
          formApi.setFieldValue(
            "summary",
            "Your routine was received and is pending moderation.",
          );
        }
        return undefined;
      },
    },
    onSubmit: () => undefined,
  });

  const textField = (
    name: "title" | "category",
    label: string,
    placeholder?: string,
  ) => (
    <form.Field name={name}>
      {(field) => {
        const invalid = field.state.meta.errors.length > 0;
        return (
          <Field label={label} required>
            <Input
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder={placeholder}
              aria-invalid={invalid}
              className={cn(
                invalid && "border-danger focus-visible:ring-danger/30",
              )}
            />
            <CommunityFieldError errors={field.state.meta.errors} />
          </Field>
        );
      }}
    </form.Field>
  );

  return (
    <form
      className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      noValidate
    >
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
          Publish a routine
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Ritora safety-scans every routine before publish. Risky text and
          health claims are routed to moderation automatically.
        </p>
      </div>

      <div className="grid gap-6">
        <FormSection title="Basics">
          {textField(
            "title",
            "Title",
            "e.g. Quiet AM for dry-sensitive in Nordic winter",
          )}
        </FormSection>

        <FormSection title="Context">
          <FormGrid>
            <form.Field name="disclosureType">
              {(field) => <CommunityDisclosureSelect field={field} />}
            </form.Field>
            {textField("category", "First step category", "e.g. cleanser")}
          </FormGrid>
        </FormSection>

        <FormSection
          title="Summary"
          description="Notes shown to people adapting your routine. Skip diagnosis, prescription instructions and 'cured' claims."
        >
          <form.Field name="summary">
            {(field) => (
              <CommunityTextareaField
                field={field}
                label="Summary and notes"
                placeholder="Built this after I gave up on the 8-step thing. Niacinamide does the brightening work; the moisturiser is the workhorse…"
                maxLength={500}
              />
            )}
          </form.Field>
        </FormSection>
      </div>

      <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
        {(submitError) => {
          const message = readSubmissionErrorMessage(submitError);
          return message ? (
            <p
              className="mt-4 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {message}
            </p>
          ) : null;
        }}
      </form.Subscribe>

      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => {
          const busy = isSubmitting || mutation.isPending;
          return (
            <Button
              className="mt-5 w-full sm:w-auto"
              type="submit"
              disabled={!canSubmit || busy}
            >
              {busy ? <InlineSpinner /> : <ShieldCheck className="h-4 w-4" />}
              {busy ? "Scanning…" : "Safety scan and publish"}
            </Button>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
