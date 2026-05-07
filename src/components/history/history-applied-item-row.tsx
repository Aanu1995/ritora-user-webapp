"use client";

import { CheckCheck, CircleSlash, Clock4, Repeat2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatIsoTime12h } from "@/lib/suggestion-daypart";
import { cn } from "@/lib/utils";
import type { ApplicationLogItem } from "@/types/application-tracking";

export function HistoryAppliedItemRow({
  item,
  fallbackAppliedAt,
}: {
  item: ApplicationLogItem;
  fallbackAppliedAt: string | null;
}) {
  const t = useTranslations("history.day");
  const source = item.itemSource ?? "recommended";
  const appliedAt = item.appliedAt ?? fallbackAppliedAt;
  const productName = appliedProductName(item);
  const productBrand = appliedProductBrand(item);
  const substitutedOriginal =
    item.recommendedSnapshot?.name ?? item.productName;
  const Icon =
    item.status === "substituted"
      ? Repeat2
      : item.status === "skipped"
        ? CircleSlash
        : CheckCheck;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-2.5",
        item.status === "applied" &&
          "border-[color:rgba(47,122,82,0.26)] bg-accent-soft/50",
        item.status === "substituted" &&
          "border-[color:var(--note-warm-border)] bg-[color:var(--note-warm-bg)]/50",
        item.status === "skipped" && "border-border bg-surface-muted",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full",
          item.status === "applied" && "bg-[color:var(--accent)] text-white",
          item.status === "substituted" &&
            "bg-[color:var(--note-warm-fg)] text-white",
          item.status === "skipped" &&
            "border border-border bg-surface text-muted",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        {productBrand ? (
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {productBrand}
          </div>
        ) : null}
        <div className="text-sm font-semibold leading-tight text-foreground">
          {productName}
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[10.5px] font-medium text-muted">
            {t(`appliedStatus.${item.status}`)}
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[10.5px] font-medium text-muted">
            {t(`itemSource.${source}`)}
          </span>
          {item.status !== "skipped" && appliedAt ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[10.5px] font-medium text-muted">
              <Clock4 className="h-3 w-3" />
              {t("itemAppliedAt", { time: formatIsoTime12h(appliedAt) })}
            </span>
          ) : null}
        </div>
        {item.status === "substituted" && substitutedOriginal ? (
          <p className="mt-1 text-[11.5px] leading-snug text-muted">
            {t("substitutedFor", {
              product: substitutedOriginal,
            })}
          </p>
        ) : null}
        {item.substitutionReason ? (
          <p className="mt-1 text-[11.5px] leading-snug text-muted">
            {item.substitutionReason}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function appliedProductName(item: ApplicationLogItem): string {
  if (item.status === "substituted") {
    return (
      item.appliedSnapshot?.name ??
      item.substitutedWithProduct?.name ??
      item.adHocName ??
      item.stepLabel ??
      ""
    );
  }
  return (
    item.appliedSnapshot?.name ??
    item.productName ??
    item.product?.name ??
    item.adHocName ??
    item.stepLabel ??
    ""
  );
}

function appliedProductBrand(item: ApplicationLogItem): string | null {
  if (item.status === "substituted") {
    return (
      item.appliedSnapshot?.brand ??
      item.substitutedWithProduct?.brand ??
      item.adHocBrand ??
      null
    );
  }
  return (
    item.appliedSnapshot?.brand ??
    item.productBrand ??
    item.product?.brand ??
    item.adHocBrand
  );
}
