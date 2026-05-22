"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { AccountDeletionDialog } from "@/components/settings/account-deletion-dialog";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function AccountDataSection() {
  const tConsent = useTranslations("skinProfile.consentCenter");
  const user = useAuthStore((state) => state.user);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const hasPassword = user?.hasPassword !== false;

  return (
    <SettingsSection
      title={tConsent("yourDataTitle")}
      description={tConsent("yourDataDesc")}
    >
      <SettingsRow
        label={tConsent("downloadTitle")}
        description={tConsent("downloadDesc")}
      >
        <Button type="button" variant="outline" size="sm" disabled>
          {tConsent("comingSoon")}
        </Button>
      </SettingsRow>
      <SettingsRow
        label={tConsent("deleteTitle")}
        description={tConsent("deleteDesc")}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-danger text-danger hover:border-danger hover:bg-danger-soft hover:text-danger"
          onClick={() => setDeleteDialogOpen(true)}
        >
          {tConsent("deleteAction")}
        </Button>
      </SettingsRow>
      <AccountDeletionDialog
        open={deleteDialogOpen}
        hasPassword={hasPassword}
        onOpenChange={setDeleteDialogOpen}
      />
    </SettingsSection>
  );
}
