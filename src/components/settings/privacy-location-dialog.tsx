"use client";

import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { z } from "@/lib/zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CountrySelect } from "@/components/ui/country-select";
import { firstFieldError } from "@/lib/form-errors";

interface GrantLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGrant: (countryCode: string, city: string) => void;
  pending: boolean;
}

const locationConsentSchema = z.object({
  countryCode: z
    .string()
    .trim()
    .min(1, "errorMissingFields")
    .regex(/^[A-Za-z]{2}$/, "errorMissingFields"),
  city: z.string().trim().max(100, "errorMissingFields"),
  consent: z.boolean().refine((value) => value, {
    message: "errorConsentRequired",
  }),
});

type LocationConsentFormValues = z.infer<typeof locationConsentSchema>;

const defaultLocationConsentValues: LocationConsentFormValues = {
  countryCode: "",
  city: "",
  consent: false,
};

export function GrantLocationDialog({
  open,
  onOpenChange,
  onGrant,
  pending,
}: GrantLocationDialogProps) {
  const t = useTranslations("skinProfile.consentCenter");

  const form = useForm({
    defaultValues: defaultLocationConsentValues,
    validators: {
      onChange: locationConsentSchema,
      onSubmit: locationConsentSchema,
    },
    onSubmit: ({ value }) => {
      onGrant(value.countryCode.trim().toUpperCase(), value.city.trim());
      form.reset(defaultLocationConsentValues);
    },
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) form.reset(defaultLocationConsentValues);
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
          <AlertDialogTitle>{t("grantLocationTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("grantLocationBody")}
          </AlertDialogDescription>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name="countryCode">
              {(field) => (
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    {t("storedCountry")}
                  </label>
                  <div className="mt-1.5">
                    <CountrySelect
                      value={field.state.value || null}
                      onChange={(next) => field.handleChange(next ?? "")}
                      ariaLabel={t("storedCountry")}
                    />
                  </div>
                  {field.state.meta.errors.length > 0 ? (
                    <p className="mt-1 text-xs text-danger" role="alert">
                      {firstFieldError(field.state.meta.errors, t)}
                    </p>
                  ) : null}
                </div>
              )}
            </form.Field>
            <form.Field name="city">
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="text-xs font-semibold text-foreground"
                  >
                    {t("storedCity")}
                  </label>
                  <input
                    id={field.name}
                    type="text"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={t("cityPlaceholder")}
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="consent">
            {(field) => (
              <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-lg bg-surface-muted p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-accent-strong"
                  checked={field.state.value}
                  onChange={(event) => field.handleChange(event.target.checked)}
                />
                <span>{t("grantLocationConsentLabel")}</span>
              </label>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values}>
            {(values) => (
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    form.reset(defaultLocationConsentValues);
                  }}
                  disabled={pending}
                >
                  {t("grantLocationCancel")}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    pending || !values.consent || !values.countryCode.trim()
                  }
                  className="bg-accent text-white hover:bg-accent-strong"
                >
                  {t("grantLocationConfirm")}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
