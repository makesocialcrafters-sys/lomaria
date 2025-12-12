import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TUTORING_SUGGESTIONS } from "@/lib/onboarding-constants";

interface Step6Props {
  tutoringSubject: string;
  tutoringDesc: string;
  tutoringPrice: number | null;
  onUpdate: (data: {
    tutoring_subject?: string;
    tutoring_desc?: string;
    tutoring_price?: number | null;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step6Tutoring({
  tutoringSubject,
  tutoringDesc,
  tutoringPrice,
  onUpdate,
  onNext,
  onBack,
}: Step6Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isValid = tutoringSubject.trim().length > 0;

  const filteredSuggestions = TUTORING_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(tutoringSubject.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-primary mb-2">
          NACHHILFE
        </h2>
        <p className="text-muted-foreground text-sm">Was kannst du unterrichten?</p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <label className="text-sm text-muted-foreground mb-2 block">Fach *</label>
          <Input
            placeholder="z.B. Statistik 1"
            value={tutoringSubject}
            onChange={(e) => onUpdate({ tutoring_subject: e.target.value })}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="input-elegant"
          />
          {showSuggestions && tutoringSubject && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                  onClick={() => {
                    onUpdate({ tutoring_subject: suggestion });
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
          <label className="text-sm text-muted-foreground mb-2 block">
            Beschreibung <span className="text-muted-foreground/50">(optional, max 300 Zeichen)</span>
          </label>
          <Textarea
            placeholder="Beschreibe kurz dein Nachhilfe-Angebot..."
            value={tutoringDesc}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                onUpdate({ tutoring_desc: e.target.value });
              }
            }}
            className="bg-transparent border border-primary/30 focus:border-primary resize-none min-h-24"
          />
          <p className="text-xs text-muted-foreground/50 text-right mt-1">
            {tutoringDesc.length}/300
          </p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Stundensatz (€) <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <Input
            type="number"
            placeholder="z.B. 25"
            value={tutoringPrice ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onUpdate({ tutoring_price: val ? parseFloat(val) : null });
            }}
            min={1}
            className="input-elegant"
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          Zurück
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="btn-premium">
          Weiter
        </Button>
      </div>
    </div>
  );
}
