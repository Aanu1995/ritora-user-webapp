"use client";

import { CommunityRoutineDetailSurface } from "./community-routine-detail-surface";

export function CommunityRoutineDetailPage({
  routineId,
}: {
  routineId: string;
}) {
  return <CommunityRoutineDetailSurface routineId={routineId} />;
}
