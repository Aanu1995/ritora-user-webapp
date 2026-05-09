"use client";

import { useTranslations } from "next-intl";
import { Moon } from "lucide-react";
import type { SkinProfile } from "@/types/skin-profile";
import {
  CompletenessCard,
  EssentialsSection,
  SectionHeading,
} from "./skin-profile-overview-sections";
import { OptionalCard } from "./skin-profile-optional-card";
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

  const hasMedicalData = hasMedicalSafetyContext(profile);
  const totalReactions = profile.reactionHistory?.entries?.length ?? 0;
  const hasReactions = totalReactions > 0;
  const toleranceCount = Object.keys(profile.activeTolerances ?? {}).length;
  const hasTolerance = toleranceCount > 0;
  const lifestyleFilled = hasLifestyleContext(profile);
  const hormonalFilled = Object.keys(profile.hormonalContext ?? {}).length > 0;
  const hormonalNotApplicable = profile.sexAtBirth === SkinProfileValue.Male;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
            filledLabel={
              hasReactions
                ? tOverview("reactionEntriesCount", { count: totalReactions })
                : undefined
            }
          />
          <OptionalCard
            href="/skin-profile/active-tolerance"
            icon="⚗"
            title={tCards("activeToleranceTitle")}
            description={tCards("activeToleranceDesc")}
            time={tCards("activeToleranceTime")}
            filled={hasTolerance}
            filledLabel={
              hasTolerance
                ? tOverview("activeToleranceCount", { count: toleranceCount })
                : undefined
            }
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

function hasMedicalSafetyContext(profile: SkinProfile): boolean {
  return Boolean(
    profile.pregnancyStatus ||
      profile.underDermatologistCare ||
      profile.safetyContext?.conditions?.length ||
      profile.safetyContext?.medications?.length ||
      profile.safetyContext?.recent_procedures?.length ||
      profile.safetyContext?.photosensitizing_other,
  );
}

function hasLifestyleContext(profile: SkinProfile): boolean {
  const context = profile.lifestyleContext ?? {};

  return Boolean(
    context.sleep ||
      context.stress ||
      context.water_intake ||
      context.smoking ||
      context.alcohol ||
      context.sweat_exercise ||
      typeof context.mask_wearing === "boolean" ||
      typeof context.shaving === "boolean" ||
      (context.diet_flags?.length ?? 0) > 0 ||
      (context.climate_sensitivities?.length ?? 0) > 0,
  );
}
