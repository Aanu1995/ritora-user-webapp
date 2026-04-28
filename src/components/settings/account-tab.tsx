"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, LogOut, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogout, useLogoutAll, useUpdateProfile } from "@/hooks/use-auth";
import { firstFieldError } from "@/lib/form-errors";
import {
  clearSubmitErrors,
  executeMutation,
  readSubmissionErrorMessage,
} from "@/lib/form-submission";
import { getUserProfileSubmitError } from "@/lib/user-profile-submit-errors";
import { useAuthStore } from "@/stores/auth-store";

const nameSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "account.nameRequired")
    .max(100, "account.nameTooLong"),
  lastName: z
    .string()
    .trim()
    .min(1, "account.nameRequired")
    .max(100, "account.nameTooLong"),
});

type NameFormValues = z.infer<typeof nameSchema>;

type AccountSessionsSectionProps = {
  onLogout: () => void;
  onLogoutAll: () => void;
  isLogoutPending: boolean;
  isLogoutAllPending: boolean;
};

function getDefaultValues(
  user: { firstName: string; lastName: string } | null,
): NameFormValues {
  return {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
  };
}

function YourDataSection() {
  const tConsent = useTranslations("skinProfile.consentCenter");

  return (
    <SettingsSection
      title={tConsent("yourDataTitle")}
      description={tConsent("yourDataDesc")}
    >
      <SettingsRow
        label={tConsent("downloadTitle")}
        description={tConsent("downloadDesc")}
      >
        <Button type="button" variant="outline" size="sm" disabled>
          {tConsent("comingSoon")}
        </Button>
      </SettingsRow>
      <SettingsRow
        label={tConsent("deleteTitle")}
        description={tConsent("deleteDesc")}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="border-danger text-danger"
        >
          {tConsent("comingSoon")}
        </Button>
      </SettingsRow>
    </SettingsSection>
  );
}

function AccountSessionsSection({
  onLogout,
  onLogoutAll,
  isLogoutPending,
  isLogoutAllPending,
}: AccountSessionsSectionProps) {
  const t = useTranslations("settings");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <SettingsSection
        title={t("account.sessionsTitle")}
        description={t("account.sessionsDescription")}
      >
        <SettingsRow
          label={t("account.signOut")}
          description={t("account.signOutDescription")}
        >
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onLogout}
            disabled={isLogoutPending}
          >
            <LogOut className="h-3.5 w-3.5" />
            {isLogoutPending
              ? t("account.signingOut")
              : t("account.signOutButton")}
          </Button>
        </SettingsRow>

        <SettingsRow
          label={t("account.signOutAll")}
          description={t("account.signOutAllDescription")}
        >
          <Button
            type="button"
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isLogoutAllPending}
            className="bg-danger/10 text-danger shadow-none hover:bg-danger/15"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isLogoutAllPending
              ? t("account.signingOutAll")
              : t("account.signOutAllButton")}
          </Button>
        </SettingsRow>
      </SettingsSection>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={t("account.signOutAllConfirmTitle")}
        description={t("account.signOutAllConfirmBody")}
        confirmLabel={t("account.signOutAllConfirmAction")}
        cancelLabel={t("account.signOutAllConfirmCancel")}
        onConfirm={onLogoutAll}
        tone={ConfirmDialogTone.Danger}
        isPending={isLogoutAllPending}
      />
    </>
  );
}

export function AccountTab() {
  const t = useTranslations("settings");
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const updateProfile = useUpdateProfile();
  const [isEditingName, setIsEditingName] = useState(false);

  const currentFirstName = user?.firstName ?? "";
  const currentLastName = user?.lastName ?? "";
  const currentFullName = `${currentFirstName} ${currentLastName}`.trim();

  const form = useForm({
    defaultValues: getDefaultValues(user),
    listeners: {
      onChange: ({ formApi }) => {
        clearSubmitErrors(formApi);
      },
    },
    validators: {
      onChange: nameSchema,
      onSubmit: nameSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await executeMutation(updateProfile.mutate, {
          firstName: value.firstName.trim(),
          lastName: value.lastName.trim(),
        });

        if (result.error !== null) {
          return getUserProfileSubmitError(result.error, t);
        }

        return undefined;
      },
    },
    onSubmit: () => {
      toast.success(t("account.nameUpdated"));
      setIsEditingName(false);
    },
  });

  const resetForm = () => {
    form.reset(getDefaultValues(user));
  };

  const handleStartEdit = () => {
    resetForm();
    setIsEditingName(true);
  };

  const handleCancel = () => {
    setIsEditingName(false);
    resetForm();
  };

  const handleLogoutAll = () => {
    logoutAll.mutate(undefined, {
      onError: () => {
        toast.error(t("account.signOutAllFailed"));
      },
    });
  };

  if (!isEditingName) {
    return (
      <div className="space-y-8">
        <SettingsSection
          title={t("account.profileTitle")}
          description={t("account.profileDescription")}
        >
          <SettingsRow label={t("account.name")}>
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground">{currentFullName}</span>
              <button
                type="button"
                onClick={handleStartEdit}
                className="cursor-pointer text-sm text-accent-strong hover:underline"
              >
                {t("account.editName")}
              </button>
            </div>
          </SettingsRow>
          <SettingsRow label={t("account.email")}>
            <span className="text-sm text-foreground">{user?.email ?? ""}</span>
          </SettingsRow>
        </SettingsSection>

        <AccountSessionsSection
          onLogout={() => logout.mutate()}
          onLogoutAll={handleLogoutAll}
          isLogoutPending={logout.isPending}
          isLogoutAllPending={logoutAll.isPending}
        />

        <YourDataSection />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SettingsSection
        title={t("account.profileTitle")}
        description={t("account.profileDescription")}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="border-b border-border px-5 py-5"
          noValidate
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <form.Field name="firstName">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-sm text-muted">
                    {t("account.firstName")}
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    disabled={updateProfile.isPending}
                    maxLength={100}
                    autoFocus
                    aria-invalid={Boolean(field.state.meta.errors.length)}
                    aria-describedby={
                      field.state.meta.errors.length
                        ? `${field.name}-error`
                        : undefined
                    }
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p
                      id={`${field.name}-error`}
                      className="text-sm text-danger"
                      role="alert"
                    >
                      {firstFieldError(field.state.meta.errors, t)}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field name="lastName">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-sm text-muted">
                    {t("account.lastName")}
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    disabled={updateProfile.isPending}
                    maxLength={100}
                    aria-invalid={Boolean(field.state.meta.errors.length)}
                    aria-describedby={
                      field.state.meta.errors.length
                        ? `${field.name}-error`
                        : undefined
                    }
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <p
                      id={`${field.name}-error`}
                      className="text-sm text-danger"
                      role="alert"
                    >
                      {firstFieldError(field.state.meta.errors, t)}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>
          </div>

          <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
            {(submitError) => {
              const message = readSubmissionErrorMessage(submitError);

              return message ? (
                <p
                  id="name-submit-error"
                  className="mt-3 text-sm text-danger"
                  role="alert"
                >
                  {message}
                </p>
              ) : null;
            }}
          </form.Subscribe>

          <form.Subscribe
            selector={(state) => ({
              values: state.values,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ values, isSubmitting }) => {
              const hasChanges =
                values.firstName.trim() !== currentFirstName ||
                values.lastName.trim() !== currentLastName;

              return (
                <div className="mt-5 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSubmitting || updateProfile.isPending}
                    className="min-w-24 gap-1.5 px-4"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("account.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      !hasChanges || isSubmitting || updateProfile.isPending
                    }
                    className="min-w-24 gap-1.5 px-4"
                  >
                    {isSubmitting || updateProfile.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    {isSubmitting || updateProfile.isPending
                      ? t("account.saving")
                      : t("account.save")}
                  </Button>
                </div>
              );
            }}
          </form.Subscribe>
        </form>

        <SettingsRow label={t("account.email")}>
          <span className="text-sm text-foreground">{user?.email ?? ""}</span>
        </SettingsRow>
      </SettingsSection>

      <AccountSessionsSection
        onLogout={() => logout.mutate()}
        onLogoutAll={handleLogoutAll}
        isLogoutPending={logout.isPending}
        isLogoutAllPending={logoutAll.isPending}
      />

      <YourDataSection />
    </div>
  );
}
