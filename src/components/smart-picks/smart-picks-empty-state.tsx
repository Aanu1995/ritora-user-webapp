import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Bookmark,
  CheckCircle2,
  Clock3,
  History,
  Layers2,
  Package,
  ScanFace,
  ShieldCheck,
  ShieldOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";
import { cn } from "@/lib/utils";
import { SMART_PICKS_EMPTY_REASON } from "@/types/smart-picks";
import type { SmartPicksOverview } from "@/types/smart-picks";

interface SmartPicksEmptyStateProps {
  overview: SmartPicksOverview;
}

type EmptyVariant =
  | "profileRequired"
  | "consentRequired"
  | "allGapsDismissed"
  | "redundancyOnly"
  | "historyInsufficient"
  | "productGenerationUnavailable"
  | "fullyCovered"
  | "fullyCoveredStarter";

type CtaConfig = {
  href: AppRoute | string;
  labelKey: string;
  icon: ReactNode;
};

type VariantConfig = {
  icon: ReactNode;
  iconClass: string;
  primary: CtaConfig;
  secondary?: CtaConfig;
};

export function SmartPicksEmptyState({ overview }: SmartPicksEmptyStateProps) {
  const t = useTranslations("smartPicks.page");
  const locale = useLocale();

  const variant = variantForOverview(overview);
  const config = variantConfig(variant);
  const missingFields = overview.emptyState.missingProfileFields.slice(0, 4);
  const hiddenFieldCount =
    overview.emptyState.missingProfileFields.length - missingFields.length;
  const pauseEnds = overview.emptyState.nextEligibleAt
    ? new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
      }).format(new Date(overview.emptyState.nextEligibleAt))
    : null;
  const facts = buildFacts({
    overview,
    pauseEnds,
    translate: (key, values) => t(key, values),
  });

  return (
    <section
      className="rounded-2xl border border-border bg-surface px-6 py-9 text-center sm:py-10"
      aria-label={t(`empty.${variant}.title`)}
    >
      <div
        className={cn(
          "mx-auto grid h-14 w-14 place-items-center rounded-2xl sm:h-16 sm:w-16",
          config.iconClass,
        )}
        aria-hidden="true"
      >
        {config.icon}
      </div>
      <h2 className="mt-3.5 font-display text-lg font-bold text-foreground">
        {t(`empty.${variant}.title`)}
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
        {t(`empty.${variant}.body`)}
      </p>
      {missingFields.length > 0 ? (
        <div className="mx-auto mt-4 flex max-w-lg flex-wrap justify-center gap-2">
          {missingFields.map((field) => (
            <span
              key={field}
              className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-muted"
            >
              {t(`empty.missingFields.${field}`)}
            </span>
          ))}
          {hiddenFieldCount > 0 ? (
            <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
              {t("empty.missingFields.more", { count: hiddenFieldCount })}
            </span>
          ) : null}
        </div>
      ) : null}
      {facts.length > 0 ? (
        <div className="mx-auto mt-4 flex max-w-lg flex-wrap justify-center gap-2">
          {facts.map((fact) => (
            <span
              key={fact}
              className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-muted"
            >
              {fact}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-5">
        <Button asChild size="sm">
          <Link href={config.primary.href}>
            {config.primary.icon}
            {t(config.primary.labelKey)}
          </Link>
        </Button>
        {config.secondary ? (
          <Button asChild size="sm" variant="ghost">
            <Link href={config.secondary.href}>
              {config.secondary.icon}
              {t(config.secondary.labelKey)}
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function variantForOverview(overview: SmartPicksOverview): EmptyVariant {
  const reason = overview.emptyState.reason;
  if (reason === SMART_PICKS_EMPTY_REASON.ProfileRequired) {
    return "profileRequired";
  }
  if (reason === SMART_PICKS_EMPTY_REASON.ConsentRequired) {
    return "consentRequired";
  }
  if (reason === SMART_PICKS_EMPTY_REASON.AllGapsDismissed) {
    return "allGapsDismissed";
  }
  if (reason === SMART_PICKS_EMPTY_REASON.RedundancyOnly) {
    return "redundancyOnly";
  }
  if (reason === SMART_PICKS_EMPTY_REASON.HistoryInsufficient) {
    return "historyInsufficient";
  }
  if (reason === SMART_PICKS_EMPTY_REASON.ProductGenerationUnavailable) {
    return "productGenerationUnavailable";
  }
  if (reason === SMART_PICKS_EMPTY_REASON.StarterNeedsShelf) {
    return "fullyCoveredStarter";
  }
  if (overview.skinProfileRequired) return "profileRequired";
  if (overview.consentRequired) return "consentRequired";
  if (overview.mode === "starter") return "fullyCoveredStarter";
  return "fullyCovered";
}

function buildFacts({
  overview,
  pauseEnds,
  translate,
}: {
  overview: SmartPicksOverview;
  pauseEnds: string | null;
  translate: (key: string, values?: Record<string, number | string>) => string;
}) {
  if (
    overview.emptyState.reason === SMART_PICKS_EMPTY_REASON.ProfileRequired ||
    overview.emptyState.reason === SMART_PICKS_EMPTY_REASON.ConsentRequired
  ) {
    return [];
  }

  const facts: string[] = [];
  if (overview.coverage.total > 0) {
    facts.push(
      translate("empty.facts.coverage", {
        filled: overview.coverage.filled,
        total: overview.coverage.total,
      }),
    );
  }
  facts.push(
    translate("empty.facts.activeProducts", {
      count: overview.emptyState.activeProductCount,
    }),
  );
  if (overview.emptyState.dismissedGapCount > 0) {
    facts.push(
      translate("empty.facts.hiddenPicks", {
        count: overview.emptyState.dismissedGapCount,
      }),
    );
  }
  if (pauseEnds) {
    facts.push(translate("empty.facts.pauseEnds", { date: pauseEnds }));
  }
  facts.push(
    translate(`empty.history.${overview.emptyState.historyReadiness.reason}`, {
      days: overview.emptyState.historyReadiness.loggedUseDaysLast90,
      photos: overview.emptyState.historyReadiness.usablePhotoCheckpoints,
    }),
  );
  return facts;
}

function variantConfig(variant: EmptyVariant): VariantConfig {
  switch (variant) {
    case "profileRequired":
      return {
        icon: <ScanFace className="h-6 w-6" aria-hidden="true" />,
        iconClass: "bg-accent-soft text-accent-strong",
        primary: {
          href: AppRoute.SkinProfile,
          labelKey: "empty.profileCta",
          icon: <ScanFace className="h-4 w-4" aria-hidden="true" />,
        },
      };
    case "consentRequired":
      return {
        icon: <ShieldOff className="h-6 w-6" aria-hidden="true" />,
        iconClass: "bg-surface-muted text-muted",
        primary: {
          href: `${AppRoute.Settings}?tab=privacy`,
          labelKey: "empty.consentCta",
          icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
        },
      };
    case "allGapsDismissed":
      return {
        icon: <Clock3 className="h-6 w-6" aria-hidden="true" />,
        iconClass: "bg-surface-muted text-muted",
        primary: {
          href: AppRoute.TodaysSuggestion,
          labelKey: "empty.todayCta",
          icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
        },
        secondary: {
          href: AppRoute.Shelf,
          labelKey: "empty.shelfCta",
          icon: <Package className="h-4 w-4" aria-hidden="true" />,
        },
      };
    case "redundancyOnly":
      return {
        icon: <Layers2 className="h-6 w-6" aria-hidden="true" />,
        iconClass: "bg-accent-soft text-accent-strong",
        primary: {
          href: AppRoute.Shelf,
          labelKey: "empty.shelfCta",
          icon: <Package className="h-4 w-4" aria-hidden="true" />,
        },
      };
    case "historyInsufficient":
      return {
        icon: <History className="h-6 w-6" aria-hidden="true" />,
        iconClass: "bg-surface-muted text-muted",
        primary: {
          href: AppRoute.Journal,
          labelKey: "empty.journalCta",
          icon: <History className="h-4 w-4" aria-hidden="true" />,
        },
        secondary: {
          href: AppRoute.TodaysSuggestion,
          labelKey: "empty.todayCta",
          icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
        },
      };
    case "productGenerationUnavailable":
      return {
        icon: <Sparkles className="h-6 w-6" aria-hidden="true" />,
        iconClass: "bg-surface-muted text-muted",
        primary: {
          href: AppRoute.TodaysSuggestion,
          labelKey: "empty.todayCta",
          icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
        },
      };
    case "fullyCoveredStarter":
      return {
        icon: <Package className="h-6 w-6" aria-hidden="true" />,
        iconClass: "bg-accent-soft text-accent-strong",
        primary: {
          href: AppRoute.Shelf,
          labelKey: "empty.starterCta",
          icon: <Package className="h-4 w-4" aria-hidden="true" />,
        },
      };
    case "fullyCovered":
    default:
      return {
        icon: <CheckCircle2 className="h-6 w-6" aria-hidden="true" />,
        iconClass: "bg-accent-soft text-accent-strong",
        primary: {
          href: AppRoute.TodaysSuggestion,
          labelKey: "empty.fullyCoveredCta",
          icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
        },
        secondary: {
          href: AppRoute.SmartPicksWishlist,
          labelKey: "actions.wishlist",
          icon: <Bookmark className="h-4 w-4" aria-hidden="true" />,
        },
      };
  }
}
