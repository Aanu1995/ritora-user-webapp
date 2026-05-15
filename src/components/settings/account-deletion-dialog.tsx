"use client";

import { AlertTriangle, Clock, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PasswordInputField } from "@/components/auth/password-input-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useDeleteAccount } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { AccountDeletionStatus } from "@/types/auth";

interface AccountDeletionDialogProps {
  open: boolean;
  hasPassword: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDeletionDialog({
  open,
  hasPassword,
  onOpenChange,
}: AccountDeletionDialogProps) {
  const t = useTranslations("skinProfile.consentCenter");
  const tAuth = useTranslations("auth");
  const deleteAccount = useDeleteAccount();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitLabel = hasPassword
    ? t("deleteScheduleAction")
    : t("deleteOAuthAction");
  const loadingLabel = hasPassword
    ? t("deleteScheduling")
    : t("deleteConfirmationSending");
  const canSubmit = !hasPassword || password.trim().length > 0;

  function resetDialogState(): void {
    setPassword("");
    setShowPassword(false);
    setSubmitError(null);
  }

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen) {
      resetDialogState();
    }

    onOpenChange(nextOpen);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (hasPassword && password.trim().length === 0) {
      setSubmitError(t("deletePasswordRequired"));
      return;
    }

    setSubmitError(null);
    deleteAccount.mutate(
      { password: hasPassword ? password : "" },
      {
        onSuccess: (response) => {
          const toastMessage =
            response.status === AccountDeletionStatus.Scheduled
              ? t("deleteScheduledToast")
              : t("deleteConfirmationRequiredToast");

          toast.success(toastMessage);
          handleOpenChange(false);
        },
        onError: (error) => {
          setSubmitError(getApiErrorMessage(error) ?? t("deleteFailed"));
        },
      },
    );
  }

  const whatHappensItems = [
    t("deleteDialogWhatHappensItem1"),
    t("deleteDialogWhatHappensItem2"),
    t("deleteDialogWhatHappensItem3"),
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-0 sm:p-0">
        <div className="shrink-0 rounded-t-3xl bg-danger/5 px-5 pt-6 pb-5 sm:px-8 sm:pt-8">
          <DialogHeader className="items-start gap-3 pr-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger/15 text-danger ring-1 ring-inset ring-danger/20 sm:h-12 sm:w-12">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <DialogTitle className="text-lg sm:text-xl">
                {t("deleteDialogTitle")}
              </DialogTitle>
              <DialogDescription>
                {hasPassword
                  ? t("deleteDialogPasswordBody")
                  : t("deleteDialogOAuthBody")}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pt-5 pb-5 sm:px-8 sm:pb-8"
          noValidate
        >
          <section
            aria-label={t("deleteDialogWhatHappensTitle")}
            className="space-y-2.5"
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              {t("deleteDialogWhatHappensTitle")}
            </h3>
            <ul className="space-y-2">
              {whatHappensItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[7px] block h-1.5 w-1.5 shrink-0 rounded-full bg-danger"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-label={t("deleteDialogGraceTitle")}
            className="flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent-soft px-4 py-3.5"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-accent-strong">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {t("deleteDialogGraceTitle")}
              </p>
              <p className="text-[13px] leading-relaxed text-muted">
                {t("deleteDialogGraceBody")}
              </p>
            </div>
          </section>

          {hasPassword ? (
            <PasswordInputField
              id="account-deletion-password"
              label={t("deletePasswordLabel")}
              value={password}
              errorText={submitError ?? undefined}
              autoComplete="current-password"
              showPassword={showPassword}
              showLabel={tAuth("showPassword")}
              hideLabel={tAuth("hidePassword")}
              onBlur={() => undefined}
              onChange={(value) => {
                setPassword(value);
                setSubmitError(null);
              }}
              onToggleVisibility={() => setShowPassword((current) => !current)}
            />
          ) : submitError ? (
            <p
              className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          <DialogFooter className="mt-2 sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={deleteAccount.isPending}
              className="w-full sm:w-auto sm:min-w-[140px]"
            >
              {t("deleteCancel")}
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || deleteAccount.isPending}
              className="w-full bg-danger text-surface hover:bg-danger/90 focus-visible:ring-danger/30 sm:w-auto sm:min-w-[180px]"
            >
              {deleteAccount.isPending ? (
                <LoadingIndicator label={loadingLabel} />
              ) : (
                <>
                  {hasPassword ? (
                    <AlertTriangle
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  ) : (
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{submitLabel}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
