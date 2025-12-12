import { cn } from "@/lib/utils";

interface ChipOption {
  value: string;
  label: string;
}

interface ChipSelectProps {
  options: readonly ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  minSelect?: number;
  maxSelect?: number;
  onMaxExceeded?: () => void;
}

export function ChipSelect({
  options,
  selected,
  onChange,
  minSelect = 0,
  maxSelect = Infinity,
  onMaxExceeded,
}: ChipSelectProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      if (selected.length >= maxSelect) {
        onMaxExceeded?.();
        return;
      }
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
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
  );
}
