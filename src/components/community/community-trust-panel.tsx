"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CommunityHome } from "@/types/community";
import { useCommunityTranslatedOptions } from "./community-i18n-options";
import { DisclosureBadge, EmptyState } from "./community-shared";

export function TrustPanel({ data }: { data: CommunityHome }) {
  const t = useTranslations("community.trust");
  const options = useCommunityTranslatedOptions();
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold tracking-tight text-foreground">
              {t("disclosureTitle")}
            </h2>
            <p className="text-xs leading-5 text-muted">
              {t("disclosureSubtitle")}
            </p>
          </div>
        </div>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {options.disclosureDescriptions.map((item) => (
            <li
              key={item.value}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted/50 p-3"
            >
              <DisclosureBadge value={item.value} />
              <p className="flex-1 text-xs leading-5 text-muted">
                {item.label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-foreground">
          <AlertTriangle className="h-5 w-5 text-warning" />
          {t("warningsTitle")}
        </h2>
        {data.warnings.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title={t("warningsEmptyTitle")}
            body={t("warningsEmptyBody")}
          />
        ) : (
          <div className="grid gap-3">
            {data.warnings.map((warning) => (
              <article
                key={warning.id}
                className="flex gap-3 rounded-2xl border border-warning/30 bg-warning-soft p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning text-white">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-bold tracking-tight text-warning">
                    {warning.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    {warning.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
