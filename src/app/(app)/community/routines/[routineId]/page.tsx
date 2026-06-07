import { CommunityRoutineDetailPage } from "@/components/community/community-routine-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ routineId: string }>;
}) {
  const { routineId } = await params;
  return <CommunityRoutineDetailPage routineId={routineId} />;
}
