"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Lock } from "lucide-react";
import { HormonalSection } from "@/components/skin-profile/hormonal-section";
import type { SectionFormHandle } from "@/components/skin-profile/medical-safety-section";
import { SectionPageHeader } from "@/components/skin-profile/section-page-header";
import {
  SkinProfileSaveActionSkeleton,
  SkinProfileSkeleton,
} from "@/components/skin-profile/skin-profile-skeleton";
import { AppRoute } from "@/constants/app-routes";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import {
  useSkinProfile,
  useSkinProfileOptions,
} from "@/hooks/use-skin-profile";
import { useSkinProfileSectionReturn } from "@/hooks/use-skin-profile-section-return";

export default function HormonalPage() {
  const t = useTranslations("skinProfile.hormonal");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const profile = useSkinProfile();
  const options = useSkinProfileOptions();
  const { backHref, returnAfterSave } = useSkinProfileSectionReturn();
  const sectionRef = useRef<SectionFormHandle>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (profile.data?.sexAtBirth === "male") {
      router.replace(AppRoute.SkinProfile);
    }
  }, [profile.data?.sexAtBirth, router]);
  const encryptedBadge = (
    <span className="inline-flex items-center gap-1 rounded-full bg-ai-bg px-2.5 py-1 text-[11px] font-semibold text-ai-fg">
      <Lock className="h-3 w-3" strokeWidth={2.5} />
      {t("encryptedBadge")}
    </span>
  );

  if (profile.isPending || options.isPending) {
    return (
      <div>
        <SectionPageHeader
          backHref={backHref}
          title={t("pageTitle")}
          subtitle={t("pageDesc")}
          badge={encryptedBadge}
          action={<SkinProfileSaveActionSkeleton />}
        />
        <SkinProfileSkeleton mode="section" />
      </div>
    );
  }

  if (profile.isError || options.isError || !profile.data || !options.data) {
    return (
      <div>
        <SectionPageHeader
          backHref={backHref}
          title={t("pageTitle")}
          subtitle={t("pageDesc")}
          badge={encryptedBadge}
        />
        <div className="mx-auto mt-6 w-full max-w-3xl">
          <RetryPanel
            title={tCommon("error")}
            description={t("pageDesc")}
            actionLabel={tCommon("retry")}
            onAction={() => {
              void Promise.all([profile.refetch(), options.refetch()]);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionPageHeader
        backHref={backHref}
        title={t("pageTitle")}
        subtitle={t("pageDesc")}
        badge={encryptedBadge}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => sectionRef.current?.submit()}
            disabled={pending}
            className="gap-1.5 bg-accent text-white hover:bg-accent-strong"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {t("save")}
          </Button>
        }
      />
      <div className="mt-6 mx-auto max-w-3xl">
        <HormonalSection
          key={`${profile.data.id}-${profile.data.updatedAt}`}
          submitRef={sectionRef}
          profile={profile.data}
          options={options.data}
          onPendingChange={setPending}
          onSaved={returnAfterSave}
        />
      </div>
    </div>
  );
}
