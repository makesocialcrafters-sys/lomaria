import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectChipsProps {
  options: readonly Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  minSelect?: number;
  maxSelect?: number;
  error?: string;
}

export function MultiSelectChips({
  options,
  selected,
  onChange,
  minSelect = 0,
  maxSelect = Infinity,
  error,
}: MultiSelectChipsProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else if (selected.length < maxSelect) {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {selected.length} / {maxSelect} ausgewählt
        {minSelect > 0 && ` (mind. ${minSelect})`}
      </p>
    </div>
  );
}
