import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TUTORING_SUGGESTIONS } from "@/lib/onboarding-constants";

interface TutoringData {
  tutoring_subject: string;
  tutoring_desc: string;
  tutoring_price: number | null;
}

interface IntentChipWithTutoringProps {
  value: string;
  label: string;
  isSelected: boolean;
  onToggle: () => void;
  tutoringData: TutoringData;
  onTutoringChange: (data: Partial<TutoringData>) => void;
}

export function IntentChipWithTutoring({
  value,
  label,
  isSelected,
  onToggle,
  tutoringData,
  onTutoringChange,
}: IntentChipWithTutoringProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isNachhilfe = value === "nachhilfe_anbieten";

  const filteredSuggestions = TUTORING_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(tutoringData.tutoring_subject.toLowerCase())
  );

  if (!isNachhilfe) {
    // Regular chip
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "px-4 py-2 text-sm rounded-md border transition-all duration-150",
          isSelected
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-transparent text-foreground border-border hover:border-primary/50"
        )}
      >
        {label}
      </button>
    );
  }

  // Nachhilfe chip with inline fields
  return (
    <div
      className={cn(
        "w-full rounded-lg border p-3 transition-all duration-150",
        isSelected
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-transparent"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full text-left text-sm font-medium transition-colors",
          isSelected ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className={cn(
          "inline-block px-3 py-1.5 rounded-md border transition-all",
          isSelected
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-transparent border-border"
        )}>
          {label}
        </span>
      </button>

      {isSelected && (
        <div className="mt-4 space-y-4 pl-1">
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-1 block">Fach *</label>
            <Input
              placeholder="z.B. Statistik 1"
              value={tutoringData.tutoring_subject}
              onChange={(e) => onTutoringChange({ tutoring_subject: e.target.value })}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="input-elegant h-9 text-sm"
            />
            {showSuggestions && tutoringData.tutoring_subject && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-32 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors"
                    onClick={() => {
                      onTutoringChange({ tutoring_subject: suggestion });
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Beschreibung <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <Textarea
              placeholder="Kurze Beschreibung..."
              value={tutoringData.tutoring_desc}
              onChange={(e) => {
                if (e.target.value.length <= 300) {
                  onTutoringChange({ tutoring_desc: e.target.value });
                }
              }}
              className="bg-transparent border border-primary/30 focus:border-primary resize-none min-h-16 text-sm"
              rows={2}
            />
            <p className="text-xs text-muted-foreground/50 text-right mt-0.5">
              {tutoringData.tutoring_desc.length}/300
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Stundensatz (€) <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <Input
              type="number"
              placeholder="z.B. 25"
              value={tutoringData.tutoring_price ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                onTutoringChange({ tutoring_price: val ? parseFloat(val) : null });
              }}
              min={1}
              className="input-elegant h-9 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
