"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";

interface RegisterVerificationMessageProps {
  submittedEmail: string;
}

function buildResendVerificationHref(email: string) {
  const params = new URLSearchParams({ email });
  return `${AppRoute.ResendVerification}?${params.toString()}`;
}

export function RegisterVerificationMessage({
  submittedEmail,
}: RegisterVerificationMessageProps) {
  const t = useTranslations("auth");

  return (
    <div className="space-y-6 text-center sm:text-left">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {t("verifyEmail")}
        </h1>
        <p className="text-sm text-muted">
          {t("verifyEmailAfterRegistrationDescription", {
            email: submittedEmail,
          })}
        </p>
      </div>

      <div className="rounded-2xl border border-accent/20 bg-accent-soft/60 p-4">
        <p className="text-sm font-medium text-accent-strong">
          {t("verifyEmailSent")}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="w-full sm:w-auto">
          <Link href={AppRoute.Login}>{t("backToLogin")}</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full rounded-full sm:w-auto"
        >
          <Link href={buildResendVerificationHref(submittedEmail)}>
            {t("resendVerification")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
