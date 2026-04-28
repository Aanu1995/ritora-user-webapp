"use client";

import { useTranslations } from "next-intl";
import { Moon } from "lucide-react";
import type { SkinProfile } from "@/types/skin-profile";
import {
  CompletenessCard,
  EssentialsSection,
  OptionalCard,
  SectionHeading,
} from "./skin-profile-overview-sections";
import { SkinProfileValue } from "./skin-profile-domain-values";

interface SkinProfileOverviewProps {
  profile: SkinProfile;
  onEdit: (step: number) => void;
}

export function SkinProfileOverview({
  profile,
  onEdit,
}: SkinProfileOverviewProps) {
  const tOverview = useTranslations("skinProfile.overview");
  const tCards = useTranslations("skinProfile.optionalCards");

  const hasMedicalData = Boolean(
    profile.pregnancyStatus ||
    profile.underDermatologistCare ||
    profile.safetyContext?.conditions?.length ||
    profile.safetyContext?.medications?.length ||
    profile.safetyContext?.recent_procedures?.length,
  );
  const totalReactions = profile.reactionHistory?.entries?.length ?? 0;
  const hasReactions = totalReactions > 0;
  const toleranceCount = Object.keys(profile.activeTolerances ?? {}).length;
  const hasTolerance = toleranceCount > 0;
  const lifestyleFilled = Boolean(
    profile.lifestyleContext?.sleep ||
    profile.lifestyleContext?.stress ||
    profile.lifestyleContext?.water_intake ||
    (profile.lifestyleContext?.diet_flags?.length ?? 0) > 0,
  );
  const hormonalFilled = Boolean(
    profile.hormonalContext?.cycle_pattern ||
    profile.hormonalContext?.breakout_pattern ||
    typeof profile.hormonalContext?.cycle_related_breakouts === "boolean" ||
    typeof profile.hormonalContext?.uses_hormonal_contraception === "boolean" ||
    typeof profile.hormonalContext?.menopause_related_changes === "boolean",
  );
  const hormonalNotApplicable = profile.sexAtBirth === SkinProfileValue.Male;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <CompletenessCard value={profile.completeness} />
      <EssentialsSection profile={profile} onEdit={onEdit} />

      <div>
        <SectionHeading
          title={tOverview("optionalSectionsTitle")}
          subtitle={tOverview("optionalSectionsHint")}
          trailing={tOverview("allOptionalLabel")}
        />
        <div className="space-y-2.5">
          <OptionalCard
            href="/skin-profile/medical-safety"
            icon="⚕"
            iconTone="warning"
            title={tCards("medicalSafetyTitle")}
            description={tCards("medicalSafetyDesc")}
            time={tCards("medicalSafetyTime")}
            encrypted
            consentRequired
            filled={hasMedicalData}
            filledLabel={hasMedicalData ? tOverview("review") : undefined}
          />
          <OptionalCard
            href="/skin-profile/reactions"
            icon="⚠"
            title={tCards("reactionHistoryTitle")}
            description={tCards("reactionHistoryDesc")}
            time={tCards("reactionHistoryTime")}
            filled={hasReactions}
            filledLabel={hasReactions ? `${totalReactions} entries` : undefined}
          />
          <OptionalCard
            href="/skin-profile/active-tolerance"
            icon="⚗"
            title={tCards("activeToleranceTitle")}
            description={tCards("activeToleranceDesc")}
            time={tCards("activeToleranceTime")}
            filled={hasTolerance}
            filledLabel={hasTolerance ? `${toleranceCount} tracked` : undefined}
          />
          <OptionalCard
            href="/skin-profile/lifestyle"
            icon={<Moon className="h-4 w-4" />}
            iconTone="violet"
            title={tCards("lifestyleTitle")}
            description={tCards("lifestyleDesc")}
            time={tCards("lifestyleTime")}
            filled={lifestyleFilled}
            filledLabel={lifestyleFilled ? tOverview("review") : undefined}
          />
          <OptionalCard
            href="/skin-profile/hormonal"
            icon="⌖"
            iconTone="warm"
            title={tCards("hormonalTitle")}
            description={tCards("hormonalDesc")}
            time={tCards("hormonalTime")}
            encrypted
            consentRequired
            filled={hormonalFilled}
            filledLabel={hormonalFilled ? tOverview("review") : undefined}
            notApplicable={hormonalNotApplicable && !hormonalFilled}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-accent/20 bg-accent-soft/50 p-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="grid h-7 w-7 flex-none place-items-center rounded-full bg-accent text-xs text-white"
          >
            🛡
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {tOverview("controlBannerTitle")}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {tOverview("controlBannerBody")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
