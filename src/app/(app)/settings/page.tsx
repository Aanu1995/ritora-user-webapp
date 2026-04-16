"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
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

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <Tabs defaultValue={SettingsTab.Account} className="mt-2">
        <TabsList className="w-full overflow-x-auto">
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

        <TabsContent value={SettingsTab.Account}>
          <AccountTab />
        </TabsContent>
        <TabsContent value={SettingsTab.Appearance}>
          <AppearanceTab />
        </TabsContent>
        <TabsContent value={SettingsTab.Language}>
          <LanguageTab />
        </TabsContent>
        <TabsContent value={SettingsTab.Privacy}>
          <PrivacyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
