import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

interface StepActionsProps {
  step: number;
  totalSteps: number;
  canSubmit: boolean;
  isSubmitting: boolean;
  isPending: boolean;
  backLabel: string;
  nextLabel: string;
  saveLabel: string;
  savingLabel: string;
  onBack: () => void;
  onNext: () => void;
}

export function StepActions({
  step,
  totalSteps,
  canSubmit,
  isSubmitting,
  isPending,
  backLabel,
  nextLabel,
  saveLabel,
  savingLabel,
  onBack,
  onNext,
}: StepActionsProps) {
  const showSubmit = step === totalSteps;

  return (
    <div className="flex justify-between">
      {step > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="rounded-xl"
        >
          {backLabel}
        </Button>
      ) : (
        <div />
      )}

      {showSubmit ? (
        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting || isPending}
          className="rounded-xl"
        >
          {isPending || isSubmitting ? (
            <LoadingIndicator
              label={savingLabel}
              className="inline-flex items-center gap-2"
            />
          ) : (
            saveLabel
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          className="rounded-xl"
        >
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
