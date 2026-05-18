"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useId } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { firstFieldError, type FieldIssue } from "@/lib/form-errors";
import type { ReactionEntry, SkinProfileOptions } from "@/types/skin-profile";
import { chipClasses } from "./section-shared";
import {
  buildReactionEntry,
  DEFAULT_REACTION_FORM_VALUES,
  reactionFormSchema,
  type ReactionFormValues,
} from "./section-form-schemas";

interface AddReactionFormProps {
  options: SkinProfileOptions;
  pending: boolean;
  onAdd: (entry: ReactionEntry) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const REACTION_TYPE_TRANSLATION_KEYS: Record<string, string> = {
  redness: "redness_reaction",
  itch: "itch",
  stinging: "stinging",
  dryness: "dryness_reaction",
  breakout: "breakout_reaction",
  hives: "hives",
  swelling: "swelling",
};

export function reactionLabelFor(
  key: string,
  tOptions: (key: string) => string,
) {
  return tOptions(REACTION_TYPE_TRANSLATION_KEYS[key] ?? key);
}

export function AddReactionForm({
  options,
  pending,
  onAdd,
  onDirtyChange,
}: AddReactionFormProps) {
  const t = useTranslations("skinProfile.reactions");
  const tValidation = useTranslations("skinProfile");
  const tOptions = useTranslations("skinProfile.options");
  const form = useForm({
    defaultValues: DEFAULT_REACTION_FORM_VALUES,
    validators: {
      onChange: reactionFormSchema,
      onSubmit: reactionFormSchema,
    },
    onSubmit: ({ value }) => {
      onAdd(buildReactionEntry(value));
      form.reset(DEFAULT_REACTION_FORM_VALUES);
    },
  });
  const isFormDirty = useStore(form.store, (state) => state.isDirty);

  useEffect(() => {
    onDirtyChange?.(isFormDirty);
  }, [isFormDirty, onDirtyChange]);

  useEffect(() => {
    return () => {
      onDirtyChange?.(false);
    };
  }, [onDirtyChange]);

  const setStringField = (field: keyof ReactionFormValues, value: string) => {
    form.setFieldValue(field, value);
  };

  const toggleReactionType = (value: string) => {
    form.setFieldValue("reactionTypes", (current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  };

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values,
        fieldMeta: state.fieldMeta as ReactionFieldMeta,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ values, fieldMeta, isSubmitting }) => {
        const triggerError = fieldError(fieldMeta, "trigger", tValidation);
        const reactionTypesError = fieldError(
          fieldMeta,
          "reactionTypes",
          tValidation,
        );
        const isBusy = pending || isSubmitting;
        const canAdd = values.trigger.trim() && values.reactionTypes.length > 0;

        return (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">{t("addNewHint")}</p>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  {t("fieldTrigger")}
                </label>
                <Input
                  type="text"
                  value={values.trigger}
                  onChange={(event) =>
                    setStringField("trigger", event.target.value)
                  }
                  placeholder={t("fieldTriggerPlaceholder")}
                />
                {triggerError ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {triggerError}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-muted">
                    {t("fieldTriggerHint")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  label={t("fieldTriggerType")}
                  value={values.triggerType}
                  options={options.reactionTriggerTypes}
                  translateOption={(value) => tOptions(value)}
                  onChange={(value) => setStringField("triggerType", value)}
                />
                <SelectField
                  label={t("fieldCertainty")}
                  value={values.certainty}
                  options={options.reactionCertainties}
                  translateOption={(value) => tOptions(value)}
                  onChange={(value) => setStringField("certainty", value)}
                />
              </div>

              <ChipField
                label={t("fieldReactions")}
                error={reactionTypesError}
                options={options.reactionTypes}
                selected={values.reactionTypes}
                translate={(value) =>
                  reactionLabelFor(value, (key) => tOptions(key))
                }
                onToggle={toggleReactionType}
              />

              <ChipField
                label={t("fieldSeverity")}
                options={options.reactionSeverities}
                selected={[values.severity]}
                translate={(value) => tOptions(value)}
                onToggle={(value) => setStringField("severity", value)}
              />

              <PatchTestField
                checked={values.patchTest}
                onCheckedChange={(checked) =>
                  form.setFieldValue("patchTest", checked === true)
                }
                label={t("fieldPatchTest")}
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => void form.handleSubmit()}
                disabled={!canAdd || isBusy}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-soft hover:bg-accent-strong disabled:opacity-50"
              >
                {isBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                {t("addReaction")}
              </button>
            </div>
          </div>
        );
      }}
    </form.Subscribe>
  );
}

type ReactionFieldMeta = Partial<
  Record<keyof ReactionFormValues, { errors?: ReadonlyArray<FieldIssue> }>
>;

function fieldError(
  fieldMeta: ReactionFieldMeta,
  field: keyof ReactionFormValues,
  translate: (key: string) => string,
): string | undefined {
  return firstFieldError(fieldMeta[field]?.errors, translate);
}

function SelectField({
  label,
  value,
  options,
  translateOption,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  translateOption: (value: string) => string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold text-foreground"
      >
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {translateOption(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PatchTestField({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean | "indeterminate") => void;
  label: string;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="cursor-pointer"
      />
      <label
        htmlFor={id}
        className="cursor-pointer text-sm text-foreground"
      >
        {label}
      </label>
    </div>
  );
}

function ChipField({
  label,
  error,
  options,
  selected,
  translate,
  onToggle,
}: {
  label: string;
  error?: string;
  options: string[];
  selected: string[];
  translate: (value: string) => string;
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-foreground">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={chipClasses(selected.includes(option))}
          >
            {translate(option)}
          </button>
        ))}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
