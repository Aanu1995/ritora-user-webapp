"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, LogOut, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { useLogout, useUpdateProfile } from "@/hooks/use-auth";
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

function getDefaultValues(
  user: { firstName: string; lastName: string } | null,
): NameFormValues {
  return {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
  };
}

export function AccountTab() {
  const t = useTranslations("settings");
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
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

        <SettingsSection
          title={t("account.sessionsTitle")}
          description={t("account.sessionsDescription")}
        >
          <SettingsRow
            label={t("account.signOut")}
            description={t("account.signOutDescription")}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {logout.isPending
                ? t("account.signingOut")
                : t("account.signOutButton")}
            </Button>
          </SettingsRow>
        </SettingsSection>
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
          className="border-b border-border py-5"
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
                      field.state.meta.errors.length ? `${field.name}-error` : undefined
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
                      field.state.meta.errors.length ? `${field.name}-error` : undefined
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
                <p id="name-submit-error" className="mt-3 text-sm text-danger" role="alert">
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
                    disabled={!hasChanges || isSubmitting || updateProfile.isPending}
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

      <SettingsSection
        title={t("account.sessionsTitle")}
        description={t("account.sessionsDescription")}
      >
        <SettingsRow
          label={t("account.signOut")}
          description={t("account.signOutDescription")}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            {logout.isPending
              ? t("account.signingOut")
              : t("account.signOutButton")}
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
