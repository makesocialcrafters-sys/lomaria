import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IntentDetailScreenProps {
  intentLabel: string;
  screenTitle: string;
  options: readonly { value: string; label: string }[];
  selected: string | string[];
  multiSelect: boolean;
  onSelect: (value: string | string[]) => void;
  onNext: () => void;
  onSkip: () => void;
  /** Custom label for the next button (default: "Weiter") */
  nextLabel?: string;
}

export function IntentDetailScreen({
  intentLabel,
  screenTitle,
  options,
  selected,
  multiSelect,
  onSelect,
  onNext,
  onSkip,
  nextLabel = "Weiter",
}: IntentDetailScreenProps) {
  const selectedArray = Array.isArray(selected) ? selected : selected ? [selected] : [];

  const handleToggle = (value: string) => {
    if (multiSelect) {
      const newSelected = selectedArray.includes(value)
        ? selectedArray.filter((v) => v !== value)
        : [...selectedArray, value];
      onSelect(newSelected);
    } else {
      // Single select - just set the value
      onSelect(value);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
          {intentLabel}
        </p>
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-primary">
          {screenTitle}
        </h2>
        {multiSelect && (
          <p className="text-xs text-muted-foreground">
            Mehrfachauswahl möglich
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center py-4">
        {options.map((option) => {
          const isSelected = selectedArray.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={cn(
                "px-4 py-2 text-sm rounded-md border transition-all duration-150",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-foreground border-border hover:border-primary/50"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="text-muted-foreground"
        >
          Überspringen
        </Button>
        <Button 
          onClick={onNext} 
          className="btn-premium"
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
