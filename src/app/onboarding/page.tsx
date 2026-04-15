"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Globe2,
  Palette,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  type ThemePreference,
  useAppPreferences,
} from "@/components/preferences/app-preferences-provider";
import { RitoraMark } from "@/components/icons/ritora-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RetryPanel } from "@/components/ui/retry-panel";
import { AppRoute } from "@/constants/app-routes";
import { useSkinProfile } from "@/hooks/use-skin-profile";
import { getApiErrorStatus } from "@/lib/api-error";
import { getSkinProfileSetupStatus } from "@/lib/skin-profile-setup";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const THEME_OPTIONS: ThemePreference[] = ["system", "light", "dark"];

function StepStateIcon({ complete }: { complete: boolean }) {
  return complete ? (
    <CheckCircle2 className="h-4 w-4 text-accent-strong" />
  ) : (
    <CircleDashed className="h-4 w-4 text-muted" />
  );
}

function OnboardingContent() {
  const tCommon = useTranslations("common");
  const t = useTranslations("onboarding");
  const tDashboard = useTranslations("dashboard");
  const tSettings = useTranslations("settings");
  const tProfile = useTranslations("skinProfile");
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const skinProfile = useSkinProfile();
  const {
    plainLanguageMode,
    resolvedTheme,
    themePreference,
    setPlainLanguageMode,
    setThemePreference,
  } = useAppPreferences();
  const [currentStep, setCurrentStep] = useState(0);

  const profileStatusCode = getApiErrorStatus(skinProfile.error);
  const hasMissingProfile = skinProfile.isError && profileStatusCode === 404;
  const hasProfileError = skinProfile.isError && profileStatusCode !== 404;
  const profile = hasMissingProfile ? null : (skinProfile.data ?? null);
  const setup = getSkinProfileSetupStatus(profile);

  useEffect(() => {
    if (!skinProfile.isPending && setup.isCoreComplete) {
      router.replace(AppRoute.Dashboard);
    }
  }, [router, setup.isCoreComplete, skinProfile.isPending]);

  const steps = useMemo(
    () => [
      {
        key: "welcome",
        icon: Sparkles,
        title: t("steps.welcome.title"),
      },
      {
        key: "foundation",
        icon: ShieldCheck,
        title: t("steps.foundation.title"),
      },
      {
        key: "preferences",
        icon: Palette,
        title: t("steps.preferences.title"),
      },
      {
        key: "profile",
        icon: UserRound,
        title: t("steps.profile.title"),
      },
    ],
    [t],
  );

  if (skinProfile.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl rounded-4xl border border-border bg-surface/90 p-8 shadow-soft">
          <p className="text-sm text-muted">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (hasProfileError) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <RetryPanel
            title={tCommon("error")}
            description={tProfile("failedToLoad")}
            actionLabel={tCommon("retry")}
            onAction={() => {
              void skinProfile.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  const nextStep = () =>
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  const previousStep = () => setCurrentStep((step) => Math.max(step - 1, 0));

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-4xl border border-border bg-surface/90 p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <Link
                href={AppRoute.Home}
                className="inline-flex items-center gap-3 text-left"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
                  <RitoraMark className="h-7 w-7" />
                </span>
                <span>
                  <span className="block text-base font-semibold tracking-tight text-foreground">
                    Ritora
                  </span>
                  <span className="block text-sm text-muted">
                    {t("eyebrow")}
                  </span>
                </span>
              </Link>
              <h1 className="mt-6 font-display text-4xl tracking-tight text-foreground">
                {t("title", { firstName: user?.firstName ?? "" })}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
                {t("subtitle")}
              </p>
            </div>

            <Button asChild variant="outline" className="rounded-full">
              <Link href={AppRoute.Dashboard}>{t("goToDashboard")}</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCurrent = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-full border px-4 py-2",
                      isCurrent
                        ? "border-accent bg-accent-soft/80 text-accent-strong"
                        : isComplete
                          ? "border-border bg-background text-foreground"
                          : "border-border bg-background/70 text-muted",
                    )}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold">{step.title}</span>
                  </div>
                  {index < steps.length - 1 ? (
                    <span className="hidden h-px w-8 bg-border sm:block" />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.75rem] border border-border bg-background/80 p-6">
              {currentStep === 0 ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
                      {t("steps.welcome.kicker")}
                    </p>
                    <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground">
                      {t("steps.welcome.headline")}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {t("steps.welcome.description")}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {["shelf", "conflicts", "routine"].map((itemKey) => (
                      <div
                        key={itemKey}
                        className="rounded-2xl border border-border bg-surface p-4"
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {t(`steps.welcome.items.${itemKey}.title`)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {t(`steps.welcome.items.${itemKey}.description`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {currentStep === 1 ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
                      {t("steps.foundation.kicker")}
                    </p>
                    <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground">
                      {t("steps.foundation.headline")}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {t("steps.foundation.description")}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {["account", "verification", "privacy"].map((itemKey) => (
                      <div
                        key={itemKey}
                        className="rounded-2xl border border-border bg-surface p-4"
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {t(`steps.foundation.items.${itemKey}.title`)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {t(`steps.foundation.items.${itemKey}.description`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {currentStep === 2 ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
                      {t("steps.preferences.kicker")}
                    </p>
                    <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground">
                      {t("steps.preferences.headline")}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {t("steps.preferences.description")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {tSettings("languageTitle")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {tSettings("languageDescription")}
                    </p>
                    <div className="mt-4">
                      <LanguageSwitcher />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {tSettings("themeTitle")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {tSettings("themeCurrent", {
                        theme: tSettings(`resolvedThemes.${resolvedTheme}`),
                      })}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {THEME_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setThemePreference(option)}
                          className={cn(
                            "rounded-2xl border px-4 py-4 text-left transition",
                            themePreference === option
                              ? "border-accent bg-accent-soft/80 text-accent-strong"
                              : "border-border bg-background text-foreground hover:border-accent/40",
                          )}
                        >
                          <span className="block text-sm font-semibold">
                            {tSettings(`themeOptions.${option}.label`)}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-muted">
                            {tSettings(`themeOptions.${option}.description`)}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                      <Checkbox
                        id="onboarding-plain-language"
                        checked={plainLanguageMode}
                        onCheckedChange={(checked) =>
                          setPlainLanguageMode(Boolean(checked))
                        }
                        className="mt-1"
                      />
                      <div>
                        <Label htmlFor="onboarding-plain-language">
                          {tSettings("plainLanguageTitle")}
                        </Label>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {tSettings("plainLanguageDescription")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep === 3 ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
                      {t("steps.profile.kicker")}
                    </p>
                    <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground">
                      {t("steps.profile.headline")}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {setup.hasProfile
                        ? t("steps.profile.inProgressDescription")
                        : t("steps.profile.description")}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {setup.sections.map((section) => (
                      <div
                        key={section.key}
                        className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
                      >
                        <span className="mt-0.5">
                          <StepStateIcon complete={section.complete} />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {tDashboard(`sections.${section.key}.title`)}
                            </p>
                            {!section.required ? (
                              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                                {tDashboard("recommendedBadge")}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-muted">
                            {tDashboard(`sections.${section.key}.description`)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href={AppRoute.SkinProfile}>
                        {setup.hasProfile
                          ? t("steps.profile.continueCta")
                          : t("steps.profile.startCta")}
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={AppRoute.Dashboard}>
                        {t("steps.profile.dashboardCta")}
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.75rem] border border-border bg-background/80 p-6">
              {currentStep === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-foreground">
                    {t("sidecards.nowTitle")}
                  </p>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {t("sidecards.now.items.auth.title")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {t("sidecards.now.items.auth.description")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {t("sidecards.now.items.profile.title")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {t("sidecards.now.items.profile.description")}
                    </p>
                  </div>
                </div>
              ) : null}

              {currentStep === 1 ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-foreground">
                    {t("sidecards.foundationTitle")}
                  </p>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm text-muted">
                      {t("sidecards.account")}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm text-muted">
                      {t("sidecards.profileProgress")}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {tDashboard("progressValue", {
                        completed: setup.completedCount,
                        total: setup.totalCount,
                      })}
                    </p>
                  </div>
                </div>
              ) : null}

              {currentStep === 2 ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-foreground">
                    {t("sidecards.preferencesTitle")}
                  </p>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      <Globe2 className="h-3.5 w-3.5" />
                      {t("sidecards.personalizeLanguage")}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {t("sidecards.preferencesDescription")}
                    </p>
                  </div>
                </div>
              ) : null}

              {currentStep === 3 ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-foreground">
                    {t("sidecards.handoffTitle")}
                  </p>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {t("sidecards.handoff.items.profile.title")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {t("sidecards.handoff.items.profile.description")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {t("sidecards.handoff.items.dashboard.title")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {t("sidecards.handoff.items.dashboard.description")}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              disabled={currentStep === 0}
              onClick={previousStep}
            >
              {t("back")}
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  );
}
