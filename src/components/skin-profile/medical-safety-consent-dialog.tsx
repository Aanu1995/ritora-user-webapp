"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Lock, Stethoscope } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MedicalSafetyConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  pending?: boolean;
}

function ProtectionToggle() {
  const t = useTranslations("skinProfile.medicalSafety");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-foreground"
      >
        <span>{t("consentDialogProtectionTitle")}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      {isOpen ? (
        <ul className="space-y-1.5 border-t border-border px-4 py-3 text-xs leading-relaxed text-muted">
          <li>{t("consentDialogProtection1")}</li>
          <li>{t("consentDialogProtection2")}</li>
          <li>{t("consentDialogProtection3")}</li>
          <li>{t("consentDialogProtection4")}</li>
        </ul>
      ) : null}
    </div>
  );
}

export function MedicalSafetyConsentDialog({
  open,
  onAccept,
  onDecline,
  pending,
}: MedicalSafetyConsentDialogProps) {
  const t = useTranslations("skinProfile.medicalSafety");

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent className="max-w-lg" showClose={false}>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-xl bg-warning-soft text-base text-warning"
          >
            <Stethoscope className="h-4 w-4" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ai-bg px-2 py-0.5 text-[10px] font-semibold text-ai-fg">
            <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
            {t("consentDialogEncryptedBadge")}
          </span>
        </div>

        <DialogTitle className="mt-3">{t("consentDialogTitle")}</DialogTitle>
        <DialogDescription>{t("consentDialogLede")}</DialogDescription>

        <div className="mt-4 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
            {t("consentDialogAskTitle")}
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-foreground">
            <li>{t("consentDialogAsk1")}</li>
            <li>{t("consentDialogAsk2")}</li>
            <li>{t("consentDialogAsk3")}</li>
            <li>{t("consentDialogAsk4")}</li>
          </ul>
        </div>

        <div className="mt-3 rounded-xl bg-surface-muted px-4 py-3 text-xs leading-relaxed text-muted">
          <span className="font-semibold text-foreground">
            {t("consentDialogSafety")}
          </span>
        </div>

        <div className="mt-3">
          <ProtectionToggle />
        </div>

        <p className="mt-3 text-xs text-muted">
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-strong underline-offset-2 hover:underline"
          >
            {t("consentDialogPrivacyLink")}
          </a>
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onDecline}
            disabled={pending}
          >
            {t("consentDialogDecline")}
          </Button>
          <button
            type="button"
            onClick={onAccept}
            disabled={pending}
            className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-accent-strong disabled:opacity-50"
          >
            {t("consentDialogAccept")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
