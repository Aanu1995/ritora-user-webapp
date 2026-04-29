"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";

type AccountSessionsSectionProps = {
  onLogout: () => void;
  onLogoutAll: () => void;
  isLogoutPending: boolean;
  isLogoutAllPending: boolean;
};

export function AccountSessionsSection({
  onLogout,
  onLogoutAll,
  isLogoutPending,
  isLogoutAllPending,
}: AccountSessionsSectionProps) {
  const t = useTranslations("settings");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <SettingsSection
        title={t("account.sessionsTitle")}
        description={t("account.sessionsDescription")}
      >
        <SettingsRow
          label={t("account.signOut")}
          description={t("account.signOutDescription")}
        >
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onLogout}
            disabled={isLogoutPending}
          >
            <LogOut className="h-3.5 w-3.5" />
            {isLogoutPending
              ? t("account.signingOut")
              : t("account.signOutButton")}
          </Button>
        </SettingsRow>

        <SettingsRow
          label={t("account.signOutAll")}
          description={t("account.signOutAllDescription")}
        >
          <Button
            type="button"
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isLogoutAllPending}
            className="bg-danger/10 text-danger shadow-none hover:bg-danger/15"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isLogoutAllPending
              ? t("account.signingOutAll")
              : t("account.signOutAllButton")}
          </Button>
        </SettingsRow>
      </SettingsSection>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={t("account.signOutAllConfirmTitle")}
        description={t("account.signOutAllConfirmBody")}
        confirmLabel={t("account.signOutAllConfirmAction")}
        cancelLabel={t("account.signOutAllConfirmCancel")}
        onConfirm={onLogoutAll}
        tone={ConfirmDialogTone.Danger}
        isPending={isLogoutAllPending}
      />
    </>
  );
}
