"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { ReactionsSection } from "@/components/skin-profile/reactions-section";
import type { SectionFormHandle } from "@/components/skin-profile/medical-safety-section";
import { SectionPageHeader } from "@/components/skin-profile/section-page-header";
import {
  SkinProfileSaveActionSkeleton,
  SkinProfileSkeleton,
} from "@/components/skin-profile/skin-profile-skeleton";
import { Button } from "@/components/ui/button";
import { RetryPanel } from "@/components/ui/retry-panel";
import { useSkinProfile, useSkinProfileOptions } from "@/hooks/use-skin-profile";

export default function ReactionsPage() {
  const t = useTranslations("skinProfile.reactions");
  const tCommon = useTranslations("common");
  const profile = useSkinProfile();
  const options = useSkinProfileOptions();
  const sectionRef = useRef<SectionFormHandle>(null);
  const [pending, setPending] = useState(false);

  if (profile.isPending || options.isPending) {
    return (
      <div>
        <SectionPageHeader
          title={t("pageTitle")}
          subtitle={t("pageDesc")}
          action={<SkinProfileSaveActionSkeleton />}
        />
        <SkinProfileSkeleton mode="reaction-section" />
      </div>
    );
  }

  if (profile.isError || options.isError || !profile.data || !options.data) {
    return (
      <div>
        <SectionPageHeader title={t("pageTitle")} subtitle={t("pageDesc")} />
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
        title={t("pageTitle")}
        subtitle={t("pageDesc")}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => sectionRef.current?.submit()}
            disabled={pending}
            className="gap-1.5 bg-accent text-white hover:bg-accent-strong"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {t("saveAll")}
          </Button>
        }
      />
      <div className="mt-6 mx-auto max-w-5xl">
        <ReactionsSection
          key={`${profile.data.id}-${profile.data.updatedAt}`}
          ref={sectionRef}
          profile={profile.data}
          options={options.data}
          onPendingChange={setPending}
        />
      </div>
    </div>
  );
}
