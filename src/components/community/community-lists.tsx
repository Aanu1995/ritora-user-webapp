"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import type { CommunityHome } from "@/types/community";
import { ReviewCard, RoutineCard } from "./community-cards";
import { EmptyState } from "./community-shared";

export { ReviewList } from "./community-review-list";
export { RoutineList } from "./community-routine-list";

export function PeopleLikeMe({ data }: { data: CommunityHome }) {
  const t = useTranslations("community.lists");
  const items = useMemo(
    () =>
      [...data.routines, ...data.reviews].sort(
        (a, b) => b.matchScore - a.matchScore,
      ),
    [data.reviews, data.routines],
  );

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t("peopleEmptyTitle")}
        body={t("peopleEmptyBody")}
      />
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) =>
        item.type === "routine" ? (
          <RoutineCard key={item.id} routine={item} />
        ) : (
          <ReviewCard key={item.id} review={item} />
        ),
      )}
    </div>
  );
}
