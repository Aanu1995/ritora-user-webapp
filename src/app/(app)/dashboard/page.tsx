"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";
import { useSkinProfile } from "@/hooks/use-skin-profile";
import { getApiErrorStatus } from "@/lib/api-error";
import { getSkinProfileSetupStatus } from "@/lib/skin-profile-setup";
import { useAuthStore } from "@/stores/auth-store";

function SetupStateIcon({ complete }: { complete: boolean }) {
  return complete ? (
    <CheckCircle2 className="h-4 w-4 text-accent-strong" />
  ) : (
    <CircleDashed className="h-4 w-4 text-muted" />
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tProfile = useTranslations("skinProfile");
  const tWorkspace = useTranslations("workspace");
  const user = useAuthStore((state) => state.user);
  const skinProfile = useSkinProfile();
  const translateOption = (value: string) => tProfile(`options.${value}`);

  if (skinProfile.isPending) {
    return <DashboardSkeleton />;
  }

  const profileStatusCode = getApiErrorStatus(skinProfile.error);
  const hasMissingProfile = skinProfile.isError && profileStatusCode === 404;
  const hasProfileError = skinProfile.isError && profileStatusCode !== 404;
  const profile = hasMissingProfile ? null : (skinProfile.data ?? null);
  const setup = getSkinProfileSetupStatus(profile);

  const profileSummaryItems = profile
    ? [
        {
          key: "skinType",
          label: t("summary.skinType"),
          value: profile.skinType ? translateOption(profile.skinType) : null,
        },
        {
          key: "goals",
          label: t("summary.goals"),
          value:
            profile.skinGoals.length > 0
              ? profile.skinGoals.map(translateOption).join(", ")
              : null,
        },
        {
          key: "concerns",
          label: t("summary.concerns"),
          value:
            profile.currentConcerns.length > 0
              ? profile.currentConcerns.map(translateOption).join(", ")
              : null,
        },
        {
          key: "routine",
          label: t("summary.routine"),
          value: profile.routineComplexity
            ? translateOption(profile.routineComplexity)
            : null,
        },
        {
          key: "context",
          label: t("summary.context"),
          value:
            profile.ethnicity || profile.countryCode || profile.city
              ? [
                  profile.ethnicity ? translateOption(profile.ethnicity) : null,
                  profile.city,
                  profile.countryCode,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : null,
        },
      ].filter((item) => item.value)
    : [];

  const plannedModules = [
    {
      key: "inventory",
      title: tWorkspace("planned.inventory.label"),
      description: tWorkspace("planned.inventory.description"),
      bullets: [
        tWorkspace("planned.inventory.children.catalogue"),
        tWorkspace("planned.inventory.children.history"),
      ],
      icon: Sparkles,
    },
    {
      key: "routines",
      title: tWorkspace("planned.routines.label"),
      description: tWorkspace("planned.routines.description"),
      bullets: [
        tWorkspace("planned.routines.children.daily"),
        tWorkspace("planned.routines.children.onDemand"),
      ],
      icon: ShieldCheck,
    },
    {
      key: "progress",
      title: tWorkspace("planned.progress.label"),
      description: tWorkspace("planned.progress.description"),
      bullets: [
        tWorkspace("planned.progress.children.checkIns"),
        tWorkspace("planned.progress.children.timeline"),
      ],
      icon: UserRound,
    },
    {
      key: "analysis",
      title: tWorkspace("planned.analysis.label"),
      description: tWorkspace("planned.analysis.description"),
      bullets: [
        tWorkspace("planned.analysis.children.gaps"),
        tWorkspace("planned.analysis.children.suggestions"),
      ],
      icon: MapPin,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-4xl border border-border bg-surface/90 p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground">
          {t("heroTitle", { firstName: user?.firstName ?? "" })}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
          {t("heroDescription")}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {t("authReady")}
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {setup.completedCount}/{setup.totalCount}{" "}
            {t("profileSectionsReady")}
          </span>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-4xl border border-border bg-surface/90 p-8 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl tracking-tight text-foreground">
                {t("setupTitle")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {setup.isCoreComplete
                  ? t("setupReadyDescription")
                  : t("setupDescription")}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {t("profileProgressLabel")}
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {t("progressValue", {
                  completed: setup.completedCount,
                  total: setup.totalCount,
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {setup.sections.map((section) => (
              <div
                key={section.key}
                className="flex items-start gap-3 rounded-2xl border border-border bg-background/80 px-4 py-3"
              >
                <span className="mt-0.5">
                  <SetupStateIcon complete={section.complete} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {t(`sections.${section.key}.title`)}
                    </p>
                    {!section.required ? (
                      <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                        {t("recommendedBadge")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {t(`sections.${section.key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link
                href={
                  setup.isCoreComplete
                    ? AppRoute.SkinProfile
                    : AppRoute.Onboarding
                }
              >
                {setup.hasProfile
                  ? setup.isCoreComplete
                    ? t("reviewProfile")
                    : t("continueProfile")
                  : t("startProfile")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={AppRoute.Settings}>
                {t("openSettings")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-4xl border border-border bg-surface/90 p-8 shadow-soft">
          <h2 className="font-display text-2xl tracking-tight text-foreground">
            {t("unlocksTitle")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("unlocksDescription")}
          </p>
          <div className="mt-6 space-y-3">
            {["inventory", "routines", "progress"].map((itemKey) => (
              <div
                key={itemKey}
                className="rounded-2xl border border-border bg-background/80 px-4 py-3"
              >
                <p className="text-sm font-semibold text-foreground">
                  {t(`unlocks.${itemKey}.title`)}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {t(`unlocks.${itemKey}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {hasProfileError ? (
        <section className="rounded-4xl border border-danger/30 bg-danger/5 p-6 shadow-soft">
          <h2 className="font-display text-2xl tracking-tight text-foreground">
            {t("profileLoadErrorTitle")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-danger">
            {t("profileLoadErrorDescription")}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={AppRoute.SkinProfile}>{t("reviewProfile")}</Link>
          </Button>
        </section>
      ) : null}

      {!hasProfileError && profile ? (
        <section className="rounded-4xl border border-border bg-surface/90 p-8 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl tracking-tight text-foreground">
                {setup.isCoreComplete
                  ? t("profileSummaryTitle")
                  : t("profileInProgressTitle")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {setup.isCoreComplete
                  ? setup.isFullyComplete
                    ? t("profileSummaryDescription")
                    : t("profileSummaryRecommendedDescription")
                  : t("profileInProgressDescription")}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={AppRoute.SkinProfile}>
                {setup.isCoreComplete
                  ? t("reviewProfile")
                  : t("continueProfile")}
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {profileSummaryItems.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-border bg-background/80 p-4"
              >
                <p className="text-sm text-muted">{item.label}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-4xl border border-border bg-surface/90 p-8 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-foreground">
              {t("blueprintTitle")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              {t("blueprintDescription")}
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {tWorkspace("soonBadge")}
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {plannedModules.map((module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.key}
                className="rounded-[1.75rem] border border-border bg-background/80 p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface text-accent-strong">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {module.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {module.description}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-muted">
                      {module.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent/60" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
