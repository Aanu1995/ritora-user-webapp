"use client";

import { useForm } from "@tanstack/react-form";
import {
  Activity,
  Droplets,
  Ellipsis,
  Loader2,
  Plane,
  Sparkles,
  Star,
  Sun,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { firstFieldError } from "@/lib/form-errors";
import type {
  CreateOnDemandSuggestionPayload,
  OnDemandSuggestionIntensity,
  OnDemandSuggestionIntent,
} from "@/types/suggestions";
import {
  onDemandSuggestionDefaultValues,
  onDemandSuggestionSchema,
} from "./on-demand-suggestion-validation";

const NOTE_MAX_LENGTH = 280;

type IntentOption = {
  value: OnDemandSuggestionIntent;
  Icon: LucideIcon;
};

const INTENT_OPTIONS: readonly IntentOption[] = [
  { value: "post_workout", Icon: Activity },
  { value: "post_sun", Icon: Sun },
  { value: "post_swim", Icon: Waves },
  { value: "travel_refresh", Icon: Plane },
  { value: "quick_refresh", Icon: Sparkles },
  { value: "event_prep", Icon: Star },
  { value: "post_makeup_or_shower", Icon: Droplets },
  { value: "other", Icon: Ellipsis },
];

type IntensityOption = {
  value: OnDemandSuggestionIntensity;
  labelKey: string;
  descriptionKey: string;
};

const INTENSITY_OPTIONS: readonly IntensityOption[] = [
  {
    value: "minimal",
    labelKey: "intensity.minimal",
    descriptionKey: "intensity.minimalDescription",
  },
  {
    value: "standard",
    labelKey: "intensity.standard",
    descriptionKey: "intensity.standardDescription",
  },
];

type Props = {
  disabled?: boolean;
  open: boolean;
  isSubmitting: boolean;
  requestId: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateOnDemandSuggestionPayload) => void;
};

export function OnDemandSuggestionDialog({
  disabled = false,
  open,
  isSubmitting,
  requestId,
  onOpenChange,
  onSubmit,
}: Props) {
  const t = useTranslations("todaysSuggestion.onDemandDialog");
  // Intent labels are owned by the canonical snake-case `onDemand.intent.*`
  // block so the dialog and the post-submit list section share one source.
  const tIntent = useTranslations("todaysSuggestion.onDemand.intent");
  const form = useForm({
    defaultValues: onDemandSuggestionDefaultValues,
    validators: {
      onChange: onDemandSuggestionSchema,
      onSubmit: onDemandSuggestionSchema,
    },
    onSubmit: ({ value }) => {
      if (disabled) {
        return;
      }

      onSubmit({
        intent: value.intent,
        intensity: value.intensity,
        note: value.note?.trim() || undefined,
        requestId: requestId ?? undefined,
      });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) form.reset(onDemandSuggestionDefaultValues);
      }}
    >
      <DialogContent className="flex max-h-[min(640px,calc(100vh-2rem))] flex-col gap-0 p-0">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (disabled) {
              return;
            }
            void form.handleSubmit();
          }}
          noValidate
        >
          <div className="flex flex-col gap-2 px-6 pb-3 pt-6">
            <div
              aria-hidden
              className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--ai-soft)] text-[color:var(--ai-strong)]"
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("body")}</DialogDescription>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <form.Field name="intent">
              {(field) => (
                <fieldset className="mt-2">
                  <legend className="mb-2 text-xs font-semibold text-foreground">
                    {t("intentLabel")}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {INTENT_OPTIONS.map(({ value, Icon }) => {
                      const selected = field.state.value === value;
                      return (
                        <ChipButton
                          key={value}
                          selected={selected}
                          onClick={() => field.handleChange(value)}
                        >
                          <Icon
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              selected ? "text-accent-strong" : "text-muted",
                            )}
                          />
                          <span className="min-w-0 truncate">
                            {tIntent(value)}
                          </span>
                        </ChipButton>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            </form.Field>

            <form.Field name="intensity">
              {(field) => (
                <fieldset className="mt-4">
                  <legend className="mb-2 text-xs font-semibold text-foreground">
                    {t("intensityLabel")}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {INTENSITY_OPTIONS.map((option) => (
                      <IntensityChip
                        key={option.value}
                        selected={field.state.value === option.value}
                        onClick={() => field.handleChange(option.value)}
                        label={t(option.labelKey)}
                        description={t(option.descriptionKey)}
                      />
                    ))}
                  </div>
                </fieldset>
              )}
            </form.Field>

            <form.Field name="note">
              {(field) => {
                const value = field.state.value ?? "";
                const length = value.length;
                const overLimit = length > NOTE_MAX_LENGTH;
                return (
                  <div className="mt-4">
                    <label
                      htmlFor={field.name}
                      className="text-xs font-semibold text-foreground"
                    >
                      {t("noteLabel")}
                    </label>
                    <textarea
                      id={field.name}
                      value={value}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder={t("notePlaceholder")}
                      maxLength={NOTE_MAX_LENGTH}
                      className="mt-1.5 min-h-24 w-full resize-y rounded-2xl border border-[color:var(--border-strong)] bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                    />
                    <div className="mt-1 flex items-start justify-between gap-2 text-xs">
                      {field.state.meta.errors.length > 0 ? (
                        <p className="text-danger" role="alert">
                          {firstFieldError(field.state.meta.errors, t)}
                        </p>
                      ) : (
                        <span aria-hidden />
                      )}
                      <span
                        aria-live="polite"
                        className={cn(
                          "shrink-0 tabular-nums",
                          overLimit ? "text-danger" : "text-muted",
                        )}
                      >
                        {length}/{NOTE_MAX_LENGTH}
                      </span>
                    </div>
                  </div>
                );
              }}
            </form.Field>
          </div>

          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || disabled}
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {t("submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChipButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-3 py-2 text-left text-xs font-semibold transition",
        selected
          ? "border-[color:var(--accent)] bg-accent-soft text-accent-strong"
          : "border-[color:var(--border-strong)] bg-surface text-foreground hover:bg-accent-soft hover:text-accent-strong",
      )}
    >
      {children}
    </button>
  );
}

function IntensityChip({
  selected,
  onClick,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-2xl border px-3 py-2.5 text-left transition",
        selected
          ? "border-[color:var(--accent)] bg-accent-soft text-accent-strong"
          : "border-[color:var(--border-strong)] bg-surface text-foreground hover:bg-accent-soft hover:text-accent-strong",
      )}
    >
      <span className="text-xs font-semibold">{label}</span>
      <span
        className={cn(
          "text-[11px] font-medium leading-snug",
          selected ? "text-accent-strong/80" : "text-muted",
        )}
      >
        {description}
      </span>
    </button>
  );
}
