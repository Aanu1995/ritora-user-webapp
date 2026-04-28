"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SkinProfileForm } from "@/components/skin-profile/skin-profile-form";
import type { SkinProfileFormHandle } from "@/components/skin-profile/skin-profile-form";
import { SkinProfileOverview } from "@/components/skin-profile/skin-profile-overview";
import { SkinProfileSkeleton } from "@/components/skin-profile/skin-profile-skeleton";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { useSkinProfile, useSkinProfileOptions } from "@/hooks/use-skin-profile";
import { getApiErrorStatus } from "@/lib/api-error";
import { getAppScrollRoot } from "@/lib/app-scroll-restoration";
import {
  consumeMissingSkinProfileHandoff,
  hasMissingSkinProfileHandoff,
} from "@/lib/post-login-route";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes-store";

export default function SkinProfilePage() {
  const tCommon = useTranslations("common");
  const t = useTranslations("skinProfile");
  const [hasMissingProfileHandoff] = useState(() =>
    hasMissingSkinProfileHandoff(),
  );
  const profile = useSkinProfile({ enabled: !hasMissingProfileHandoff });
  const options = useSkinProfileOptions();
  const [editStep, setEditStep] = useState<number | null>(null);
  const formRef = useRef<SkinProfileFormHandle>(null);
  const overviewScrollTopRef = useRef<number | null>(null);
  const [pending, setPending] = useState(false);
  const requestLeave = useUnsavedChangesStore((state) => state.requestLeave);

  useEffect(() => {
    if (!hasMissingProfileHandoff) {
      return;
    }

    const timerId = window.setTimeout(() => {
      consumeMissingSkinProfileHandoff();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [hasMissingProfileHandoff]);

  const profileStatus = getApiErrorStatus(profile.error);
  const hasNoProfile =
    (!profile.data && hasMissingProfileHandoff) ||
    (profile.isError && profileStatus === 404);
  const hasProfileError = profile.isError && profileStatus !== 404;
  const hasOptionsError = options.isError;
  const isLoading = options.isPending || (profile.isPending && !profile.isError);
  const isEditMode = editStep !== null && profile.data !== undefined;
  const isOnboardingMode = hasNoProfile || !profile.data;
  const isOverviewMode = !isEditMode && !isOnboardingMode;
  const showLoadError = hasProfileError || hasOptionsError || !options.data;

  const retryLoad = () => {
    void options.refetch();

    if (!hasMissingProfileHandoff) {
      void profile.refetch();
    }
  };

  const openEditStep = (step: number) => {
    overviewScrollTopRef.current = getAppScrollRoot()?.scrollTop ?? null;
    setEditStep(step);

    window.requestAnimationFrame(() => {
      getAppScrollRoot()?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  };

  const closeEditStep = () => {
    const scrollTop = overviewScrollTopRef.current;
    setEditStep(null);
    overviewScrollTopRef.current = null;

    if (scrollTop === null) {
      return;
    }

    window.requestAnimationFrame(() => {
      getAppScrollRoot()?.scrollTo({
        top: scrollTop,
        left: 0,
        behavior: "auto",
      });
    });
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          subtitle={t("overview.description")}
        />
        <div className="mx-auto w-full max-w-3xl">
          <SkinProfileSkeleton
            mode={
              Boolean(profile.data) && editStep === null ? "overview" : "generic"
            }
          />
        </div>
      </div>
    );
  }

  if (showLoadError) {
    return (
      <div>
        <PageHeader
          title={t("title")}
          subtitle={t("overview.description")}
        />
        <div className="mx-auto mt-6 w-full max-w-3xl">
          <RetryPanel
            title={tCommon("error")}
            description={t("failedToLoad")}
            actionLabel={tCommon("retry")}
            onAction={retryLoad}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("overview.description")}
        leading={
          isEditMode ? (
            <button
              type="button"
              aria-label={t("steps.back")}
              onClick={() => requestLeave(closeEditStep)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground hover:bg-surface-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : null
        }
        action={
          isEditMode ? (
            <Button
              type="button"
              size="sm"
              onClick={() => formRef.current?.submit()}
              disabled={pending}
              className="bg-accent text-white hover:bg-accent-strong"
            >
              {t("steps.save")}
            </Button>
          ) : null
        }
      />

      <div>
        {isEditMode && profile.data && options.data ? (
          <SkinProfileForm
            ref={formRef}
            key={`edit-${profile.data.id}-${profile.data.updatedAt}-${editStep}`}
            existingProfile={profile.data}
            options={options.data}
            initialStep={editStep}
            onCancel={closeEditStep}
            onSaved={closeEditStep}
            onPendingChange={setPending}
          />
        ) : isOnboardingMode && options.data ? (
          <SkinProfileForm key="create-profile" options={options.data} />
        ) : isOverviewMode && profile.data ? (
          <SkinProfileOverview
            profile={profile.data}
            onEdit={openEditStep}
          />
        ) : null}
      </div>
    </div>
  );
}
