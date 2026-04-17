"use client";

import { useTranslations } from "next-intl";
import { Moon, Monitor, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import {
  type ThemePreference,
  useAppPreferences,
} from "@/components/preferences/app-preferences-provider";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { value: ThemePreference; icon: typeof Sun; labelKey: string }[] = [
  { value: "system", icon: Monitor, labelKey: "themeSystem" },
  { value: "light", icon: Sun, labelKey: "themeLight" },
  { value: "dark", icon: Moon, labelKey: "themeDark" },
];

export function AppearanceTab() {
  const t = useTranslations("settings");
  const {
    themePreference,
    plainLanguageMode,
    setThemePreference,
    setPlainLanguageMode,
  } = useAppPreferences();

  return (
    <div className="space-y-8">
      <SettingsSection
        title={t("appearance.themeTitle")}
        description={t("appearance.themeDescription")}
      >
        <div className="px-5 py-5">
          <div className="inline-flex items-center gap-1 rounded-lg bg-surface-muted p-1">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = themePreference === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setThemePreference(option.value)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(`appearance.${option.labelKey}`)}
                </button>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("appearance.accessibilityTitle")}
        description={t("appearance.accessibilityDescription")}
      >
        <SettingsRow
          label={t("appearance.plainLanguage")}
          description={t("appearance.plainLanguageDescription")}
        >
          <Switch
            checked={plainLanguageMode}
            onCheckedChange={setPlainLanguageMode}
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
