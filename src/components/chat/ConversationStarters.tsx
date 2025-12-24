interface ConversationStartersProps {
  onSelect: (text: string) => void;
  visible: boolean;
}

const STARTERS = [
  "Was studierst du gerade?",
  "Was hat dich zu Lomaria geführt?",
  "Suchst du eher Austausch oder Lernen?",
];

export function ConversationStarters({ onSelect, visible }: ConversationStartersProps) {
  if (!visible) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {STARTERS.map((text) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          className="text-xs px-3 py-1.5 rounded-full 
                     bg-card border border-primary/10 
                     text-muted-foreground hover:text-foreground 
                     hover:border-primary/30 transition-all duration-300"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
