"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "@/components/settings/account-tab";
import { AppearanceTab } from "@/components/settings/appearance-tab";
import { LanguageTab } from "@/components/settings/language-tab";
import { PrivacyTab } from "@/components/settings/privacy-tab";

enum SettingsTab {
  Account = "account",
  Appearance = "appearance",
  Language = "language",
  Privacy = "privacy",
}

const VALID_TABS = new Set<string>(Object.values(SettingsTab));

function isValidTab(value: string | null): value is SettingsTab {
  return value !== null && VALID_TABS.has(value);
}

function SettingsTabs() {
  const t = useTranslations("settings");
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = isValidTab(tabParam) ? tabParam : SettingsTab.Account;

  return (
    <Tabs defaultValue={initialTab}>
      <div className="sticky top-0 z-10 bg-background pt-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        <div className="mx-auto max-w-2xl">
          <TabsList className="mt-6 w-full overflow-x-auto">
            <TabsTrigger value={SettingsTab.Account}>
              {t("tabs.account")}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.Appearance}>
              {t("tabs.appearance")}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.Language}>
              {t("tabs.language")}
            </TabsTrigger>
            <TabsTrigger value={SettingsTab.Privacy}>
              {t("tabs.privacy")}
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value={SettingsTab.Account}>
        <div className="mx-auto max-w-2xl">
          <AccountTab />
        </div>
      </TabsContent>
      <TabsContent value={SettingsTab.Appearance}>
        <div className="mx-auto max-w-2xl">
          <AppearanceTab />
        </div>
      </TabsContent>
      <TabsContent value={SettingsTab.Language}>
        <div className="mx-auto max-w-2xl">
          <LanguageTab />
        </div>
      </TabsContent>
      <TabsContent value={SettingsTab.Privacy}>
        <div className="mx-auto max-w-2xl">
          <PrivacyTab />
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <Suspense>
        <SettingsTabs />
      </Suspense>
    </div>
  );
}
