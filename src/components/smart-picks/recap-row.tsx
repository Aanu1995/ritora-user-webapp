import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { MapPin, Target, WalletCards, Waves } from "lucide-react";
import type { SmartPicksOverview } from "@/types/smart-picks";

interface RecapRowProps {
  recap: SmartPicksOverview["recap"];
}

export function RecapRow({ recap }: RecapRowProps) {
  const t = useTranslations("smartPicks.page");
  const city = recap.location.city ?? recap.location.countryCode;

  return (
    <div className="flex flex-wrap gap-1.5">
      <RecapPill
        icon={<Target className="h-3 w-3" aria-hidden="true" />}
        label={t("recap.goal")}
        value={recap.primaryGoal ?? t("recap.unset")}
      />
      <RecapPill
        icon={<Waves className="h-3 w-3" aria-hidden="true" />}
        label={t("recap.skinType")}
        value={recap.skinType ?? t("recap.unset")}
      />
      <RecapPill
        icon={<MapPin className="h-3 w-3" aria-hidden="true" />}
        label={t("recap.location")}
        value={city ?? t("recap.unset")}
      />
      <RecapPill
        icon={<WalletCards className="h-3 w-3" aria-hidden="true" />}
        label={t("recap.budget")}
        value={
          recap.budgetTier ? t(`budget.${recap.budgetTier}`) : t("recap.unset")
        }
      />
    </div>
  );
}

function RecapPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11.5px] text-muted">
      <span className="text-accent" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
      <span className="text-[color:var(--border-strong)]" aria-hidden="true">
        ·
      </span>
      <strong className="font-semibold text-foreground">{value}</strong>
    </span>
  );
}
