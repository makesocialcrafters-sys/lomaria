interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i + 1 === currentStep
              ? "w-6 bg-primary"
              : i + 1 < currentStep
              ? "w-3 bg-primary/60"
              : "w-3 bg-muted"
          }`}
        />
      ))}
    </div>
  );
}
