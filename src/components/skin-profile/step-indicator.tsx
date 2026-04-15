interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  return (
    <div className="mt-2 flex gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-1.5 flex-1 rounded-full ${
            index < currentStep ? 'bg-accent' : 'bg-border'
          }`}
        />
      ))}
    </div>
  );
}
