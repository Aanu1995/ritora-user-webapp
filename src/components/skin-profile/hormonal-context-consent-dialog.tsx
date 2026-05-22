"use client";

import { useTranslations } from "next-intl";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface HormonalContextConsentDialogProps {
  open: boolean;
  pending?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function HormonalContextConsentDialog({
  open,
  pending,
  onAccept,
  onDecline,
}: HormonalContextConsentDialogProps) {
  const t = useTranslations("skinProfile.hormonal");

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent showClose={false}>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-xl bg-ai-bg text-ai-fg"
          >
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ai-bg px-2 py-0.5 text-[10px] font-semibold text-ai-fg">
            <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
            {t("encryptedBadge")}
          </span>
        </div>

        <DialogTitle className="mt-3">{t("consentTitle")}</DialogTitle>
        <DialogDescription>{t("consentLede")}</DialogDescription>

        <div className="mt-4 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
            {t("consentAskTitle")}
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-foreground">
            <li>{t("consentAsk1")}</li>
            <li>{t("consentAsk2")}</li>
            <li>{t("consentAsk3")}</li>
          </ul>
        </div>

        <p className="mt-3 rounded-xl bg-surface-muted px-4 py-3 text-xs leading-relaxed text-muted">
          {t("consentSafety")}
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={pending}
            onClick={onDecline}
          >
            {t("consentDecline")}
          </Button>
          <Button
            type="button"
            className="flex-1 bg-accent text-white hover:bg-accent-strong"
            disabled={pending}
            onClick={onAccept}
          >
            {t("consentAccept")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
