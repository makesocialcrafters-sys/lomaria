import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { INTENTS, TUTORING_SUGGESTIONS } from "@/lib/onboarding-constants";
import { useToast } from "@/hooks/use-toast";

interface TutoringData {
  tutoring_subject: string;
  tutoring_desc: string;
  tutoring_price: number | null;
}

interface Step4Props {
  intents: string[];
  tutoringData: TutoringData;
  onUpdate: (data: { intents: string[] }) => void;
  onUpdateTutoring: (data: Partial<TutoringData>) => void;
  onNext: () => void;
  onBack: () => void;
}
  onUpdateIntentDetails: (intent: string, field: string, value: string | string[]) => void;
  onUpdateTutoring: (data: Partial<TutoringData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Intents({ 
  intents, 
  intentDetails,
  tutoringData,
  onUpdate, 
  onUpdateIntentDetails,
  onUpdateTutoring,
  onNext, 
  onBack 
}: Step4Props) {
  const { toast } = useToast();
  
  const showTutoring = intents.includes("nachhilfe_anbieten");
  const tutoringValid = !showTutoring || tutoringData.tutoring_subject.trim().length > 0;
  const isValid = intents.length >= 3 && tutoringValid;

  const handleMaxExceeded = () => {
    toast({ title: "Maximal 6 Intents auswählbar.", variant: "destructive" });
  };

  const handleIntentToggle = (intentValue: string, checked: boolean) => {
    if (checked) {
      if (intents.length >= 6) {
        handleMaxExceeded();
        return;
      }
      onUpdate({ intents: [...intents, intentValue] });
    } else {
      onUpdate({ intents: intents.filter(i => i !== intentValue) });
      // Clear tutoring data if nachhilfe is removed
      if (intentValue === "nachhilfe_anbieten") {
        onUpdateTutoring({
          tutoring_subject: "",
          tutoring_desc: "",
          tutoring_price: null,
        });
      }
    }
  };

  const handleSubmit = () => {
    if (!tutoringValid) {
      toast({ title: "Bitte gib ein Fach für Nachhilfe an.", variant: "destructive" });
      return;
    }
    onNext();
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-primary mb-2">
          INTENTS
        </h2>
        <p className="text-muted-foreground text-sm">
          Was suchst du? <span className="text-primary">(min. 3, max. 6)</span>
        </p>
      </div>

      <div className="space-y-2 py-4">
        {INTENTS.map((intent) => (
          <IntentChipInline
            key={intent.value}
            intent={intent.value}
            label={intent.label}
            isActive={intents.includes(intent.value)}
            tutoringData={tutoringData}
            onToggle={handleIntentToggle}
            onTutoringChange={onUpdateTutoring}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground/70 text-center">
        {intents.length}/6 ausgewählt
      </p>

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          Zurück
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid} className="btn-premium">
          Weiter
        </Button>
      </div>
    </div>
  );
}

// Inline Intent Chip Component for Onboarding
interface IntentChipInlineProps {
  intent: string;
  label: string;
  isActive: boolean;
  tutoringData: TutoringData;
  onToggle: (intent: string, checked: boolean) => void;
  onTutoringChange: (data: Partial<TutoringData>) => void;
}

function IntentChipInline({
  intent,
  label,
  isActive,
  tutoringData,
  onToggle,
  onTutoringChange,
}: IntentChipInlineProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isNachhilfe = intent === "nachhilfe_anbieten";

  const filteredSuggestions = isNachhilfe
    ? TUTORING_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(tutoringData.tutoring_subject.toLowerCase())
      )
    : [];

  // Render tutoring fields inline
  const renderTutoringFields = () => {
    if (!isNachhilfe || !isActive) return null;

    return (
      <div className="mt-3 space-y-3 pt-3 border-t border-border/50">
        <div className="relative">
          <label className="text-xs text-muted-foreground mb-1 block">Fach *</label>
          <Input
            placeholder="z.B. Statistik 1"
            value={tutoringData.tutoring_subject}
            onChange={(e) => onTutoringChange({ tutoring_subject: e.target.value })}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="h-9 text-sm"
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
            className="min-h-16 text-sm resize-none"
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
            className="h-9 text-sm"
          />
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`rounded-lg border p-3 transition-colors ${
        isActive 
          ? "border-primary/30 bg-primary/5" 
          : "border-border bg-muted/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={`onboarding-intent-${intent}`}
          checked={isActive}
          onCheckedChange={(checked) => onToggle(intent, checked === true)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <label 
            htmlFor={`onboarding-intent-${intent}`}
            className={`text-sm font-medium cursor-pointer ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {label}
          </label>
          
          {renderTutoringFields()}
        </div>
      </div>
    </div>
  );
}
