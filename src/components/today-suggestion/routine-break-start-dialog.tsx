"use client";

import { useForm } from "@tanstack/react-form";
import { Hourglass, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  getMinimumRoutineBreakResumeDate,
  routineBreakResumeDefaultValues,
  routineBreakResumeSchema,
  toRoutineBreakEndsAt,
} from "@/components/today-suggestion/routine-break-validation";
import { firstFieldError } from "@/lib/form-errors";
import type { StartRoutineBreakPayload } from "@/types/suggestions";

type Props = {
  open: boolean;
  isStarting: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (payload: StartRoutineBreakPayload) => void;
};

export function RoutineBreakStartDialog({
  open,
  isStarting,
  onOpenChange,
  onStart,
}: Props) {
  const t = useTranslations("todaysSuggestion.routineBreakStart");
  const form = useForm({
    defaultValues: routineBreakResumeDefaultValues,
    validators: {
      onChange: routineBreakResumeSchema,
      onSubmit: routineBreakResumeSchema,
    },
    onSubmit: ({ value }) => {
      onStart({
        endsAt: toRoutineBreakEndsAt(value.endsAt),
      });
    },
  });

  const [minimumResumeDate] = useState(getMinimumRoutineBreakResumeDate);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) form.reset(routineBreakResumeDefaultValues);
      }}
    >
      <AlertDialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          noValidate
        >
          <div
            aria-hidden
            className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--note-warm-bg)] text-[color:var(--note-warm-fg)]"
          >
            <Hourglass className="h-5 w-5" />
          </div>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("body")}</AlertDialogDescription>

          <form.Field name="endsAt">
            {(field) => (
              <div className="mt-4">
                <label
                  htmlFor={field.name}
                  className="text-xs font-semibold text-foreground"
                >
                  {t("resumeDateLabel")}
                </label>
                <div className="mt-1.5">
                  <DatePicker
                    value={field.state.value}
                    onChange={(next) => field.handleChange(next)}
                    ariaLabel={t("resumeDateLabel")}
                    minDate={minimumResumeDate}
                    allowClear
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  {t("resumeDateHint")}
                </p>
                {field.state.meta.errors.length > 0 ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {firstFieldError(field.state.meta.errors, t)}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isStarting}
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={isStarting}>
              {isStarting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              {t("start")}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
