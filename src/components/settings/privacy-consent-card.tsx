"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoredDataItem } from "@/components/settings/privacy-stored-items";
import {
  SkinProfileAccessEventType,
  SkinProfileAccessPurpose,
  type SkinProfileAccessLog,
} from "@/types/skin-profile";

const ACCESS_EVENT_LABEL_KEYS: Record<SkinProfileAccessEventType, string> = {
  [SkinProfileAccessEventType.DataAccessed]: "accessEventDataAccessed",
  [SkinProfileAccessEventType.ConsentGranted]: "accessEventConsentGranted",
  [SkinProfileAccessEventType.ConsentRevoked]: "accessEventConsentRevoked",
};

const ACCESS_PURPOSE_LABEL_KEYS: Record<SkinProfileAccessPurpose, string> = {
  [SkinProfileAccessPurpose.SkinProfileRead]: "accessPurposeSkinProfileRead",
  [SkinProfileAccessPurpose.RecommendationAnalysis]:
    "accessPurposeRecommendationAnalysis",
  [SkinProfileAccessPurpose.AccountExport]: "accessPurposeAccountExport",
  [SkinProfileAccessPurpose.ConsentGrant]: "accessPurposeConsentGrant",
  [SkinProfileAccessPurpose.ConsentRevoke]: "accessPurposeConsentRevoke",
};

interface ConsentCardProps {
  title: string;
  description: string;
  active: boolean;
  comingSoon?: boolean;
  encrypted?: boolean;
  grantedAt?: string | null;
  lastAccessedAt?: string | null;
  storedDataItems?: StoredDataItem[];
  accessLogs?: SkinProfileAccessLog[];
  accessLogsLoading?: boolean;
  onGrant?: () => void;
  onRevoke?: () => void;
  pending?: boolean;
}

function formatDateTime(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
}

export function ConsentCard({
  title,
  description,
  active,
  comingSoon,
  encrypted,
  grantedAt,
  lastAccessedAt,
  storedDataItems,
  accessLogs,
  accessLogsLoading,
  onGrant,
  onRevoke,
  pending,
}: ConsentCardProps) {
  const t = useTranslations("skinProfile.consentCenter");
  const [storedOpen, setStoredOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const formattedGrantedAt = formatDateTime(grantedAt);
  const formattedLastAccessedAt = formatDateTime(lastAccessedAt);

  return (
    <div
      className={[
        "rounded-2xl border bg-surface p-4",
        active
          ? "border-border"
          : "border-dashed border-border-strong opacity-90",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {encrypted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-ai-bg px-2 py-0.5 text-[10px] font-semibold text-ai-fg">
                <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
                {t("encrypted")}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            active
              ? "bg-accent-soft text-accent-strong"
              : "bg-surface-muted text-muted",
          ].join(" ")}
        >
          {active ? t("active") : t("notGranted")}
        </span>
      </div>

      {active ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 border-y border-border py-3 text-xs sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">
                {t("grantedOn")}
              </p>
              <p className="text-foreground">{formattedGrantedAt ?? "-"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">
                {t("noticeVersion")}
              </p>
              <p className="text-foreground">{t("noticeVersionValue")}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">
                {t("lastAccessed")}
              </p>
              <p className="text-foreground">
                {formattedLastAccessedAt ?? t("neverAccessed")}
              </p>
            </div>
          </div>

          {storedOpen ? (
            <div className="mb-3 rounded-xl bg-surface-muted px-3 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {t("viewStored")}
              </p>
              {storedDataItems && storedDataItems.length > 0 ? (
                <dl className="space-y-1.5 text-xs">
                  {storedDataItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between gap-3"
                    >
                      <dt className="text-muted">{item.label}</dt>
                      <dd className="text-right text-foreground">
                        {item.value && item.value.length > 0 ? (
                          item.value
                        ) : (
                          <span className="italic text-muted">-</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-xs italic text-muted">{t("noStoredData")}</p>
              )}
            </div>
          ) : null}

          {logOpen ? (
            <div className="mb-3 rounded-xl bg-surface-muted px-3 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {t("viewLog")}
              </p>
              {accessLogsLoading ? (
                <p className="text-xs italic text-muted">{t("loadingLog")}</p>
              ) : accessLogs && accessLogs.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  {accessLogs.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <span>
                        <span className="font-medium text-foreground">
                          {t(ACCESS_EVENT_LABEL_KEYS[log.eventType])}
                        </span>
                        <span className="block text-muted">
                          {t(ACCESS_PURPOSE_LABEL_KEYS[log.purpose])}
                        </span>
                      </span>
                      <time
                        dateTime={log.createdAt}
                        className="shrink-0 text-right text-muted"
                      >
                        {formatDateTime(log.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs italic text-muted">{t("noAccessLog")}</p>
              )}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStoredOpen((value) => !value)}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-muted"
              >
                {storedOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                {storedOpen ? t("hideStored") : t("viewStored")}
              </button>
              <button
                type="button"
                onClick={() => setLogOpen((value) => !value)}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-muted"
              >
                {logOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                {t("viewLog")}
              </button>
            </div>
            {onRevoke ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRevoke}
                disabled={pending}
                className="border-danger text-danger hover:bg-danger/5"
              >
                {t("revoke")}
              </Button>
            ) : null}
          </div>
        </>
      ) : (
        <div className="mt-3 flex justify-end">
          {comingSoon ? (
            <Button type="button" variant="outline" size="sm" disabled>
              {t("comingSoon")}
            </Button>
          ) : onGrant ? (
            <Button
              type="button"
              size="sm"
              onClick={onGrant}
              disabled={pending}
              className="bg-accent text-white hover:bg-accent-strong"
            >
              {t("grant")}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
