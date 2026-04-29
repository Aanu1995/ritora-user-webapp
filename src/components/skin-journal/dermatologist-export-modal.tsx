"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { CheckCircle2, Download } from "lucide-react";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useCreateJournalExport } from "@/hooks/use-skin-journal";
import { firstFieldError } from "@/lib/form-errors";
import type { JournalExportJob } from "@/types/skin-journal";

interface DermatologistExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExportDateRangeFormValue {
  from: string;
  to: string;
}

const exportDateRangeSchema = z
  .object({
    from: z.iso.date("validation.invalidDate"),
    to: z.iso.date("validation.invalidDate"),
  })
  .superRefine((value, ctx) => {
    if (value.to < value.from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to"],
        message: "validation.endBeforeStart",
      });
    }
  });

function getDefaultDateRange(): ExportDateRangeFormValue {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

  return {
    from: thirtyDaysAgo.toISOString().slice(0, 10),
    to: today,
  };
}

export function DermatologistExportModal({
  open,
  onOpenChange,
}: DermatologistExportModalProps) {
  const t = useTranslations("journal.export");
  const [createdJob, setCreatedJob] = useState<JournalExportJob | null>(null);
  const createExport = useCreateJournalExport();

  const form = useForm({
    defaultValues: getDefaultDateRange(),
    validators: {
      onChange: exportDateRangeSchema,
      onSubmit: exportDateRangeSchema,
    },
    listeners: {
      onChange: () => {
        setCreatedJob(null);
      },
    },
    onSubmit: ({ value }) => {
      createExport.mutate(value, {
        onSuccess: (job) => {
          setCreatedJob(job);
        },
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          noValidate
        >
          <AlertDialogHeader>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent-strong">
              <Download className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="mt-1.5 text-lg font-bold">
              {t("title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-muted">
              {t("body")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name="from">
              {(field) => (
                <div>
                  <p className="mb-1 block text-xs font-semibold">
                    {t("fromLabel")}
                  </p>
                  <DatePicker
                    value={field.state.value}
                    onChange={field.handleChange}
                    ariaLabel={t("fromLabel")}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="mt-1 text-xs text-danger" role="alert">
                      {firstFieldError(field.state.meta.errors, t)}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>
            <form.Field name="to">
              {(field) => (
                <div>
                  <p className="mb-1 block text-xs font-semibold">
                    {t("toLabel")}
                  </p>
                  <DatePicker
                    value={field.state.value}
                    onChange={field.handleChange}
                    ariaLabel={t("toLabel")}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p className="mt-1 text-xs text-danger" role="alert">
                      {firstFieldError(field.state.meta.errors, t)}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>
          </div>
          {createdJob ? (
            <div className="mt-4 rounded-2xl border border-border bg-accent-soft p-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent-strong" />
                <div>
                  <p className="font-semibold text-accent-strong">
                    {t("readyTitle")}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {t("readyBody", {
                      entries: createdJob.payload?.entries.length ?? 0,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {createExport.error ? (
            <p className="mt-3 rounded-xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-3 py-2 text-xs text-danger">
              {createExport.error.message}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createExport.isPending}>
              {t("cancel")}
            </AlertDialogCancel>
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  type="submit"
                  disabled={
                    createExport.isPending || isSubmitting || !canSubmit
                  }
                >
                  {createExport.isPending || isSubmitting ? (
                    <LoadingIndicator size="sm" label={t("generating")} />
                  ) : (
                    t("submit")
                  )}
                </Button>
              )}
            </form.Subscribe>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
