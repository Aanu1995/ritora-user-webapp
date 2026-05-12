import { useTranslations } from "next-intl";
import { CheckCircle2, Layers2 } from "lucide-react";
import type { SmartPicksOverview } from "@/types/smart-picks";
import { roleLabel } from "./smart-picks-format";

interface SupportingSectionsProps {
  overview: SmartPicksOverview;
}

export function SupportingSections({ overview }: SupportingSectionsProps) {
  const t = useTranslations("smartPicks.page");

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {t("covered.title")}
        </h2>
        {overview.covered.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {overview.covered.map((item) => (
              <li key={`${item.role}-${item.productName}`}>
                <div className="text-sm font-semibold text-foreground">
                  {roleLabel(item.role)}
                </div>
                <div className="text-sm text-muted">
                  {item.productName} · {item.reason}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">{t("covered.empty")}</p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Layers2 className="h-4 w-4 text-accent-strong" />
          {t("redundancy.title")}
        </h2>
        {overview.redundancy.length > 0 ? (
          <div className="mt-3 space-y-4">
            {overview.redundancy.map((group) => (
              <div key={group.activeTag}>
                <div className="text-sm font-semibold text-foreground">
                  {group.activeTag.replace(/_/g, " ")}
                </div>
                <p className="text-sm text-muted">{group.hint}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">{t("redundancy.empty")}</p>
        )}
      </section>
    </div>
  );
}
