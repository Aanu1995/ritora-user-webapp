"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "@/components/settings/account-tab";
import { AppearanceTab } from "@/components/settings/appearance-tab";
import { LanguageTab } from "@/components/settings/language-tab";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { PrivacyTab } from "@/components/settings/privacy-tab";
import { SettingsPageSkeleton } from "@/components/settings/settings-page-skeleton";

enum SettingsTab {
  Account = "account",
  Appearance = "appearance",
  Language = "language",
  Notifications = "notifications",
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
      <div className="sticky top-0 z-10 bg-background pt-3 sm:pt-6">
        <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
          {t("title")}
        </h1>
        <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm">
          {t("subtitle")}
        </p>
        <div
          data-testid="settings-tab-indicator-rail"
          className="mx-auto mt-3 w-full border-b border-border sm:mt-6 lg:w-[65%]"
        >
          <div
            data-testid="settings-tab-scroll-region"
            className="overflow-x-auto pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <TabsList className="border-b-0">
              <TabsTrigger value={SettingsTab.Account}>
                {t("tabs.account")}
              </TabsTrigger>
              <TabsTrigger value={SettingsTab.Appearance}>
                {t("tabs.appearance")}
              </TabsTrigger>
              <TabsTrigger value={SettingsTab.Language}>
                {t("tabs.language")}
              </TabsTrigger>
              <TabsTrigger value={SettingsTab.Notifications}>
                {t("tabs.notifications")}
              </TabsTrigger>
              <TabsTrigger value={SettingsTab.Privacy}>
                {t("tabs.privacy")}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>

      <TabsContent value={SettingsTab.Account} className="mt-4 sm:mt-6">
        <div className="mx-auto w-full lg:w-[65%]">
          <AccountTab />
        </div>
      </TabsContent>
      <TabsContent value={SettingsTab.Appearance} className="mt-4 sm:mt-6">
        <div className="mx-auto w-full lg:w-[65%]">
          <AppearanceTab />
        </div>
      </TabsContent>
      <TabsContent value={SettingsTab.Language} className="mt-4 sm:mt-6">
        <div className="mx-auto w-full lg:w-[65%]">
          <LanguageTab />
        </div>
      </TabsContent>
      <TabsContent value={SettingsTab.Notifications} className="mt-4 sm:mt-6">
        <div className="mx-auto w-full lg:w-[65%]">
          <NotificationsTab />
        </div>
      </TabsContent>
      <TabsContent value={SettingsTab.Privacy} className="mt-4 sm:mt-6">
        <div className="mx-auto w-full lg:w-[65%]">
          <PrivacyTab />
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <Suspense fallback={<SettingsPageSkeleton />}>
        <SettingsTabs />
      </Suspense>
    </div>
  );
}
