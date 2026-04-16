import { LoadingIndicator } from '@/components/ui/loading-indicator';

type RouteTransitionScreenProps = {
  fullHeight?: boolean;
};

export function RouteTransitionScreen({
  fullHeight = true,
}: RouteTransitionScreenProps) {
  return (
    <div
      className={`flex items-center justify-center bg-background/95 ${
        fullHeight ? 'min-h-screen' : 'min-h-[60vh]'
      }`}
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingIndicator size="lg" />
    </div>
  );
}
