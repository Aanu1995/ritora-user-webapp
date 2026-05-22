import { useTranslations } from "next-intl";
import { Camera, ClipboardCheck, ShoppingBag, ShieldAlert } from "lucide-react";

export function SmartPicksTrustNotice() {
  const t = useTranslations("smartPicks.page.trust");

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ShieldAlert className="h-4 w-4 text-amber-600" aria-hidden />
        {t("title")}
      </h2>
      <div className="mt-3 grid gap-3 text-xs leading-5 text-muted sm:grid-cols-3">
        <p className="flex gap-2">
          <Camera className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" />
          <span>{t("photos")}</span>
        </p>
        <p className="flex gap-2">
          <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" />
          <span>{t("shopping")}</span>
        </p>
        <p className="flex gap-2">
          <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" />
          <span>{t("consistency")}</span>
        </p>
      </div>
    </section>
  );
}
