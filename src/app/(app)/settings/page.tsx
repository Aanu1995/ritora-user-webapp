"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  type ThemePreference,
  useAppPreferences,
} from "@/components/preferences/app-preferences-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-routes";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: ThemePreference[] = ["system", "light", "dark"];

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-4xl border border-border bg-surface/90 p-6 shadow-soft">
      <h2 className="font-display text-2xl tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const user = useAuthStore((state) => state.user);
  const locale = useLocale();
  const {
    plainLanguageMode,
    resolvedTheme,
    themePreference,
    setPlainLanguageMode,
    setThemePreference,
  } = useAppPreferences();

  return (
    <div className="space-y-8">
      <section className="rounded-4xl border border-border bg-surface/90 p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
          {t("subtitle")}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <SettingsCard
            title={t("languageTitle")}
            description={t("languageDescription")}
          >
            <div className="rounded-3xl border border-border bg-background/80 p-4">
              <LanguageSwitcher />
            </div>
            <p className="mt-3 text-sm text-muted">
              {t("languageCurrent", { locale: locale.toUpperCase() })}
            </p>
          </SettingsCard>

          <SettingsCard
            title={t("themeTitle")}
            description={t("themeDescription")}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setThemePreference(option)}
                  className={cn(
                    "rounded-3xl border px-4 py-4 text-left transition",
                    themePreference === option
                      ? "border-accent bg-accent-soft/80 text-accent-strong"
                      : "border-border bg-background/80 text-foreground hover:border-accent/40",
                  )}
                >
                  <span className="block text-sm font-semibold">
                    {t(`themeOptions.${option}.label`)}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    {t(`themeOptions.${option}.description`)}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">
              {t("themeCurrent", {
                theme: t(`resolvedThemes.${resolvedTheme}`),
              })}
            </p>
          </SettingsCard>

          <SettingsCard
            title={t("guidanceTitle")}
            description={t("guidanceDescription")}
          >
            <div className="rounded-3xl border border-border bg-background/80 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="plain-language-mode"
                  checked={plainLanguageMode}
                  onCheckedChange={(checked) =>
                    setPlainLanguageMode(Boolean(checked))
                  }
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="plain-language-mode">
                    {t("plainLanguageTitle")}
                  </Label>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {t("plainLanguageDescription")}
                  </p>
                </div>
              </div>
            </div>
          </SettingsCard>
        </div>

        <div className="space-y-6">
          <SettingsCard
            title={t("accountTitle")}
            description={t("accountDescription")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-background/80 p-4">
                <p className="text-sm text-muted">{t("accountName")}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-background/80 p-4">
                <p className="text-sm text-muted">{t("accountEmail")}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-3xl border border-border bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">
                {t("logoutPlacementTitle")}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t("logoutPlacementDescription")}
              </p>
            </div>
          </SettingsCard>

          <SettingsCard
            title={t("notificationsTitle")}
            description={t("notificationsDescription")}
          >
            <div className="space-y-3">
              {["morning", "progress", "inventory"].map((itemKey) => (
                <div
                  key={itemKey}
                  className="rounded-3xl border border-border bg-background/80 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {t(`notifications.${itemKey}.title`)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {t(`notifications.${itemKey}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </SettingsCard>

          <SettingsCard
            title={t("privacyTitle")}
            description={t("privacyDescription")}
          >
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={AppRoute.Privacy}>{t("privacyLinks.privacy")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={AppRoute.Terms}>{t("privacyLinks.terms")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={AppRoute.Cookies}>{t("privacyLinks.cookies")}</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              {t("privacyFootnote")}
            </p>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
