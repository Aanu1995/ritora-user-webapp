"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/app/page-header";
import { SkinProfileForm } from "@/components/skin-profile/skin-profile-form";
import { SkinProfileOverview } from "@/components/skin-profile/skin-profile-overview";
import { SkinProfileSkeleton } from "@/components/skin-profile/skin-profile-skeleton";
import { RetryPanel } from "@/components/ui/retry-panel";
import { useSkinProfile, useSkinProfileOptions } from "@/hooks/use-skin-profile";
import { getApiErrorStatus } from "@/lib/api-error";

export default function SkinProfilePage() {
  const tCommon = useTranslations("common");
  const t = useTranslations("skinProfile");
  const profile = useSkinProfile();
  const options = useSkinProfileOptions();
  const [editStep, setEditStep] = useState<number | null>(null);

  const profileStatus = getApiErrorStatus(profile.error);
  const hasNoProfile = profile.isError && profileStatus === 404;
  const hasProfileError = profile.isError && profileStatus !== 404;
  const hasOptionsError = options.isError;
  const isLoadingOverview = Boolean(profile.data) && editStep === null;

  const renderContent = () => {
    if (options.isPending || (profile.isPending && !profile.isError)) {
      return (
        <SkinProfileSkeleton
          mode={isLoadingOverview ? "overview" : "generic"}
        />
      );
    }

    if (hasProfileError || hasOptionsError || !options.data) {
      return (
        <RetryPanel
          title={tCommon("error")}
          description={t("failedToLoad")}
          actionLabel={tCommon("retry")}
          onAction={() => {
            void Promise.all([options.refetch(), profile.refetch()]);
          }}
        />
      );
    }

    if (editStep !== null && profile.data) {
      return (
        <SkinProfileForm
          key={`edit-${profile.data.id}-${profile.data.updatedAt}-${editStep}`}
          existingProfile={profile.data}
          options={options.data}
          initialStep={editStep}
          onCancel={() => setEditStep(null)}
          onSaved={() => setEditStep(null)}
        />
      );
    }

    if (hasNoProfile || !profile.data) {
      return <SkinProfileForm key="create-profile" options={options.data} />;
    }

    return (
      <SkinProfileOverview
        profile={profile.data}
        onEdit={(step) => setEditStep(step)}
      />
    );
  };

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("overview.description")}
      />
      <div className="mt-2">{renderContent()}</div>
    </div>
  );
}
