interface IcebreakerStartersProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
}

const ICEBREAKERS = [
  {
    label: "Studium & Alltag",
    message: "Zwischen LVs wenig Zeit, lass uns kurz schreiben."
  },
  {
    label: "Ziele & Projekte",
    message: "Ähnliche Ziele, lass kurz schauen, ob das passt."
  },
  {
    label: "Kennenlernen & Campus",
    message: "Gleicher Campus, gleiche Routine, lass uns das kurz ändern."
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
