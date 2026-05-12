"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ExternalLink,
  Heart,
  Info,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SMART_PICKS_AVAILABILITY_STATUS,
  SMART_PICKS_VERIFICATION_STATUS,
} from "@/types/smart-picks";
import type {
  SmartPicksProductPick,
  SmartPicksRetailer,
} from "@/types/smart-picks";
import type { SuggestionGapActionKind } from "@/types/suggestions";
import { formatPrice } from "./smart-picks-format";

interface ProductPickPanelProps {
  pick: SmartPicksProductPick;
  pending: boolean;
  onAction: (pickId: string, action: SuggestionGapActionKind) => void;
}

export function ProductPickPanel({
  pick,
  pending,
  onAction,
}: ProductPickPanelProps) {
  const t = useTranslations("smartPicks.page");
  const saved = pick.userAction === "saved";
  const localAlternative = pick.alternatives.find(
    (alternative) =>
      alternative.availabilityStatus === SMART_PICKS_AVAILABILITY_STATUS.Local,
  );
  const needsLocalCaveat =
    pick.availabilityStatus !== SMART_PICKS_AVAILABILITY_STATUS.Local &&
    Boolean(localAlternative);

  return (
    <div className="mt-4 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-muted">{pick.brand}</div>
          <div className="mt-1 text-lg font-bold text-foreground">
            {pick.productName}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
              {t("availability.bestMatch")}
            </span>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
              {t(`availability.status.${pick.availabilityStatus}`)}
            </span>
          </div>
          {pick.recommendationRankReason ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {pick.recommendationRankReason}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {pick.reasoningChips.map((chip) => (
              <span
                key={`${chip.tone}-${chip.text}`}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted"
              >
                {chip.text}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={saved ? "secondary" : "outline"}
            disabled={pending || saved}
            onClick={() => onAction(pick.id, "saved")}
          >
            {pending ? (
              <LoadingIndicator size="sm" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {saved ? t("actions.saved") : t("actions.save")}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={pending}
            aria-label={t("actions.dismiss")}
            onClick={() => onAction(pick.id, "dismissed")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pick.retailers.map((retailer) => (
          <RetailerChip
            key={`${retailer.name}-${retailer.url}`}
            retailer={retailer}
          />
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">
        {t("retailers.verify")}
      </p>

      <VerificationNotice pick={pick} />

      {pick.retailerDataStale ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t("retailers.stale")}</span>
        </div>
      ) : null}

      {needsLocalCaveat && localAlternative ? (
        <div className="mt-3 rounded-lg border border-border bg-surface p-3">
          <div className="text-xs font-semibold uppercase text-muted">
            {t("availability.localAlternativeTitle")}
          </div>
          <div className="mt-1 text-sm font-semibold text-foreground">
            {localAlternative.brand} {localAlternative.productName}
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">
            {pick.localAlternativeReason ??
              t("availability.localAlternativeFallback")}
          </p>
        </div>
      ) : null}

      <Sheet>
        <SheetTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="mt-4">
            <Info className="h-4 w-4" />
            {t("actions.whyThis")}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-md">
          <SheetTitle>{t("drawer.title")}</SheetTitle>
          <SheetDescription>{t("drawer.description")}</SheetDescription>
          <WhyThisContent pick={pick} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function VerificationNotice({ pick }: { pick: SmartPicksProductPick }) {
  const t = useTranslations("smartPicks.page");

  if (pick.verificationStatus === SMART_PICKS_VERIFICATION_STATUS.AiNamed) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t("verification.aiNamed")}</span>
      </div>
    );
  }

  if (
    pick.verificationStatus ===
    SMART_PICKS_VERIFICATION_STATUS.RetailerVerified
  ) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-900">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t("verification.retailerVerified")}</span>
      </div>
    );
  }

  if (
    pick.verificationStatus ===
    SMART_PICKS_VERIFICATION_STATUS.RetailerUnverified
  ) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t("verification.retailerUnverified")}</span>
      </div>
    );
  }

  return null;
}

function RetailerChip({ retailer }: { retailer: SmartPicksRetailer }) {
  const t = useTranslations("smartPicks.page");
  const price = formatPrice(retailer.priceCents, retailer.currency);
  const href = safeRetailerHref(retailer.url);
  if (!href) return null;

  return (
    <a
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-semibold text-foreground hover:border-accent-strong"
      href={href}
      target="_blank"
      rel={
        retailer.isAffiliate
          ? "sponsored noopener noreferrer"
          : "noopener noreferrer"
      }
    >
      <span>{retailer.name}</span>
      {price ? <span className="text-muted">{price}</span> : null}
      {retailer.isAffiliate ? (
        <span className="text-accent-strong">{t("retailers.paid")}</span>
      ) : null}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

function WhyThisContent({ pick }: { pick: SmartPicksProductPick }) {
  const t = useTranslations("smartPicks.page");
  const facts = Object.entries(pick.reasoningFacts);

  return (
    <div className="mt-6 space-y-6">
      <section>
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4" />
          {t("drawer.facts")}
        </h4>
        <dl className="mt-3 space-y-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase text-muted">
                {label}
              </dt>
              <dd className="text-sm text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {pick.alternatives.length > 0 ? (
        <section>
          <h4 className="text-sm font-semibold text-foreground">
            {t("drawer.alternatives")}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {pick.alternatives.map((alternative) => (
              <li key={alternative.id}>
                <span className="font-semibold text-foreground">
                  {alternative.brand} {alternative.productName}
                </span>{" "}
                <span>
                  {t(`availability.status.${alternative.availabilityStatus}`)}
                </span>
                {alternative.recommendationRankReason ? (
                  <span>: {alternative.recommendationRankReason}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pick.ruledOut.length > 0 ? (
        <section>
          <h4 className="text-sm font-semibold text-foreground">
            {t("drawer.ruledOut")}
          </h4>
          <ul className="mt-3 space-y-3 text-sm text-muted">
            {pick.ruledOut.map((item) => (
              <li key={`${item.brand}-${item.productName}`}>
                <span className="font-semibold text-foreground">
                  {item.brand} {item.productName}:
                </span>{" "}
                {item.reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function safeRetailerHref(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    if (isPrivateRetailerHost(parsed.hostname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function isPrivateRetailerHost(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized === "localhost" || normalized.endsWith(".localhost")) {
    return true;
  }
  if (normalized.endsWith(".local") || normalized.endsWith(".internal")) {
    return true;
  }
  if (normalized === "::1" || normalized.startsWith("fc")) return true;
  if (normalized.startsWith("fd") || normalized.startsWith("fe80:")) {
    return true;
  }
  return isPrivateIpv4Host(normalized);
}

function isPrivateIpv4Host(hostname: string) {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }
  const [first, second] = parts;
  if (first === 10 || first === 127 || first === 0) return true;
  if (first === 169 && second === 254) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  return first === 192 && second === 168;
}
