"use client";

import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onGrant: () => void;
};

export function AiSuggestionConsentDialog({
  open,
  pending,
  onOpenChange,
  onGrant,
}: Props) {
  const t = useTranslations("todaysSuggestion.aiConsentDialog");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div
          aria-hidden
          className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--ai-soft)] text-[color:var(--ai-strong)]"
        >
          <ShieldCheck className="h-5 w-5" />
        </div>
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription className="mt-2">{t("body")}</DialogDescription>

        <div className="mt-4 rounded-2xl border border-border bg-surface-muted px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            {t("controlTitle")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("controlBody")}
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {t("cancel")}
          </Button>
          <Button type="button" onClick={onGrant} disabled={pending}>
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {t("confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
