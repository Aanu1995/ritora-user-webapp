"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CountrySelect } from "@/components/ui/country-select";

interface GrantLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGrant: (countryCode: string, city: string) => void;
  pending: boolean;
}

export function GrantLocationDialog({
  open,
  onOpenChange,
  onGrant,
  pending,
}: GrantLocationDialogProps) {
  const t = useTranslations("skinProfile.consentCenter");
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [consent, setConsent] = useState(false);

  const reset = () => {
    setCountryCode("");
    setCity("");
    setConsent(false);
  };

  const onSubmit = () => {
    if (!countryCode.trim()) {
      toast.error(t("errorMissingFields"));
      return;
    }

    if (!consent) {
      return;
    }

    onGrant(countryCode.trim().toUpperCase(), city.trim());
    reset();
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) reset();
      }}
    >
      <AlertDialogContent>
        <AlertDialogTitle>{t("grantLocationTitle")}</AlertDialogTitle>
        <AlertDialogDescription>
          {t("grantLocationBody")}
        </AlertDialogDescription>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-foreground">
              {t("storedCountry")}
            </label>
            <div className="mt-1.5">
              <CountrySelect
                value={countryCode || null}
                onChange={(next) => setCountryCode(next ?? "")}
                ariaLabel={t("storedCountry")}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground">
              {t("storedCity")}
            </label>
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder={t("cityPlaceholder")}
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-lg bg-surface-muted p-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-accent-strong"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>{t("grantLocationConsentLabel")}</span>
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            disabled={pending}
          >
            {t("grantLocationCancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSubmit}
            disabled={pending || !consent || !countryCode.trim()}
            className="bg-accent text-white hover:bg-accent-strong"
          >
            {t("grantLocationConfirm")}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
