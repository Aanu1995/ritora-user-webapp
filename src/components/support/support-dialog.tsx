"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, Send, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSupportFeedback } from "@/hooks/use-support";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import { firstFieldError } from "@/lib/form-errors";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { SupportFeedbackType } from "@/types/support";

const supportFeedbackTypeValues = Object.values(SupportFeedbackType);

const supportFeedbackSchema = z.object({
  description: z
    .string()
    .trim()
    .min(8, "support.descriptionRequired")
    .max(5000, "support.descriptionTooLong"),
  title: z
    .string()
    .trim()
    .min(3, "support.titleRequired")
    .max(160, "support.titleTooLong"),
  type: z.nativeEnum(SupportFeedbackType),
});

type SupportFeedbackFormValues = z.infer<typeof supportFeedbackSchema>;

const supportFeedbackDefaultValues: SupportFeedbackFormValues = {
  description: "",
  title: "",
  type: SupportFeedbackType.Bug,
};

function getSupportBrowserContext(): string | undefined {
  if (typeof navigator === "undefined") {
    return undefined;
  }
  return navigator.userAgent.slice(0, 160);
}

function getSupportRouteContext(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return `${window.location.pathname}${window.location.search}`.slice(0, 160);
}

type SupportDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

/**
 * Reusable support feedback dialog. Owns the form + submit mutation, but the
 * open/close state lives with the caller so the dialog can be triggered from
 * the dashboard header, settings, error panels, or anywhere else without each
 * surface needing to know about feedback type schemas.
 */
export function SupportDialog({ open, onOpenChange }: SupportDialogProps) {
  const t = useTranslations("settings.account");
  const locale = useLocale();
  const createFeedback = useCreateSupportFeedback();

  const form = useForm({
    defaultValues: supportFeedbackDefaultValues,
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: supportFeedbackSchema,
      onSubmit: supportFeedbackSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await executeMutation(createFeedback.mutate, {
          context: {
            browser: getSupportBrowserContext(),
            locale,
            route: getSupportRouteContext(),
          },
          description: value.description.trim(),
          title: value.title.trim(),
          type: value.type,
        });

        if (result.error !== null) {
          if (getApiErrorStatus(result.error) === 429) {
            return t("support.rateLimited");
          }
          return getApiErrorMessage(result.error) ?? t("support.submitFailed");
        }

        return undefined;
      },
    },
    onSubmit: () => {
      toast.success(t("support.sent"));
      onOpenChange(false);
      form.reset(supportFeedbackDefaultValues);
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (createFeedback.isPending) {
      return;
    }
    onOpenChange(nextOpen);
    if (!nextOpen) {
      form.reset(supportFeedbackDefaultValues);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-0 sm:p-0">
        <div className="overflow-y-auto p-6">
          <DialogHeader className="pr-8">
            <DialogTitle>{t("support.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("support.dialogBody")}</DialogDescription>
          </DialogHeader>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
            noValidate
          >
            <form.Field name="type">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>{t("support.typeLabel")}</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(next) =>
                      field.handleChange(next as SupportFeedbackType)
                    }
                    disabled={createFeedback.isPending}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-label={t("support.typeLabel")}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    {/* The Dialog overlay sits at z-[70] and its content at
                        z-[71]; SelectContent defaults to z-50 which renders
                        the dropdown behind the dialog and makes it look
                        broken. Bump it above the dialog so the popover is
                        visible and clickable. */}
                    <SelectContent className="z-[80]">
                      {supportFeedbackTypeValues.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`support.types.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="title">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>{t("support.titleLabel")}</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    disabled={createFeedback.isPending}
                    maxLength={160}
                    aria-invalid={Boolean(field.state.meta.errors.length)}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-sm text-danger" role="alert">
                      {firstFieldError(field.state.meta.errors, t)}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>
                    {t("support.detailsLabel")}
                  </Label>
                  <textarea
                    id={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    disabled={createFeedback.isPending}
                    maxLength={5000}
                    rows={5}
                    aria-invalid={Boolean(field.state.meta.errors.length)}
                    className="min-h-32 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="text-sm text-danger" role="alert">
                      {firstFieldError(field.state.meta.errors, t)}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
              {(submitError) => {
                const message = readSubmissionErrorMessage(submitError);
                return message ? (
                  <p className="text-sm text-danger" role="alert">
                    {message}
                  </p>
                ) : null;
              }}
            </form.Subscribe>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createFeedback.isPending}
              >
                <X className="h-4 w-4" />
                {t("support.cancel")}
              </Button>
              <Button type="submit" disabled={createFeedback.isPending}>
                {createFeedback.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {createFeedback.isPending
                  ? t("support.sending")
                  : t("support.submit")}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
