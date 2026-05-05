"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { AppRoute } from "@/constants/app-routes";
import { GapRecommendationBanner } from "@/components/today-suggestion/gap-recommendation-banner";
import { useRecordSuggestionGapAction } from "@/hooks/use-suggestions";
import type { SuggestionGapRecommendation } from "@/types/suggestions";

type Props = {
  suggestionId: string | null;
  recommendation: SuggestionGapRecommendation | null;
};

export function TodayGapRecommendationSection({
  suggestionId,
  recommendation,
}: Props) {
  const t = useTranslations("todaysSuggestion.page");
  const router = useRouter();
  const gapAction = useRecordSuggestionGapAction();
  const [pendingAction, setPendingAction] = useState<"saved" | "dismissed" | null>(
    null,
  );
  if (!suggestionId || !recommendation) return null;
  const recordAction = (action: "saved" | "dismissed") => {
    setPendingAction(action);
    gapAction.mutate(
      {
        suggestionInstanceId: suggestionId,
        ingredientOrCategory: recommendation.ingredientOrCategory,
        action,
      },
      {
        onSuccess: () => {
          toast.success(
            action === "saved" ? t("gapSaved") : t("gapDismissed"),
          );
        },
        onSettled: () => setPendingAction(null),
      },
    );
  };

  return (
    <div className="mt-6">
      <p className="mb-2 ml-1 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">
        {t("worthConsidering")}
      </p>
      <GapRecommendationBanner
        recommendation={recommendation}
        onBrowse={() =>
          router.push(
            `${AppRoute.SmartPicks}?focus=${encodeURIComponent(
              recommendation.ingredientOrCategory,
            )}`,
          )
        }
        onSaveToWishlist={() => recordAction("saved")}
        onDismiss={() => recordAction("dismissed")}
        isSaving={pendingAction === "saved" && gapAction.isPending}
        isDismissing={pendingAction === "dismissed" && gapAction.isPending}
      />
    </div>
  );
}
