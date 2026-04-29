import { PageHeaderSkeleton } from '@/components/app/page-header-skeleton';
import { SkinProfileSkeleton } from './skin-profile-skeleton';

type SkinProfileSectionSkeletonMode =
  | 'section'
  | 'active-tolerance-section'
  | 'reaction-section';

type SkinProfileSectionRouteSkeletonProps = {
  mode?: SkinProfileSectionSkeletonMode;
};

export function SkinProfileRouteSkeleton() {
  return (
    <div data-testid="skin-profile-route-skeleton">
      <PageHeaderSkeleton withAction />
      <SkinProfileSkeleton mode="overview" />
    </div>
  );
}

export function SkinProfileSectionRouteSkeleton({
  mode = 'section',
}: SkinProfileSectionRouteSkeletonProps) {
  return (
    <div data-testid="skin-profile-section-route-skeleton">
      <PageHeaderSkeleton withLeading withAction />
      <SkinProfileSkeleton mode={mode} />
    </div>
  );
}
