interface IcebreakerStartersProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
}

const ICEBREAKERS = [
  {
    label: "Sag Hey",
    message: "Hey! Was studierst du so?"
  },
  {
    label: "Gemeinsam",
    message: "Wir haben einiges gemeinsam – erzähl mal!"
  },
  {
    label: "Kennenlernen",
    message: "Ich bin neugierig – was machst du neben dem Studium?"
  }
];

export function IcebreakerStarters({ onSelect, disabled }: IcebreakerStartersProps) {
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {ICEBREAKERS.map((icebreaker) => (
          <button
            key={icebreaker.label}
            onClick={() => onSelect(icebreaker.message)}
            disabled={disabled}
            className="flex-shrink-0 px-4 py-2 border border-primary/30 rounded-full text-xs font-display uppercase tracking-[0.1em] text-muted-foreground hover:border-primary/60 hover:text-primary transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none"
          >
            {icebreaker.label}
          </button>
        ))}
      </div>
    </div>
  );
}
