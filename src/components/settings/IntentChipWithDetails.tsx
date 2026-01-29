import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus } from "lucide-react";
import { 
  INTENT_DETAIL_OPTIONS, 
  INTENT_LABELS,
  getIntentDetailLabel,
  getIntentDetailFieldTitle,
  type IntentDetails 
} from "@/lib/onboarding-constants";
import { INTENTS, TUTORING_SUGGESTIONS } from "@/lib/constants";

interface TutoringData {
  tutoring_subject: string;
  tutoring_desc: string;
  tutoring_price: number | null;
}

interface IntentChipWithDetailsProps {
  intent: string;
  isActive: boolean;
  intentDetails: IntentDetails;
  tutoringData?: TutoringData;
  onToggle: (intent: string, active: boolean) => void;
  onEdit: (intent: string) => void;
  onTutoringChange?: (data: Partial<TutoringData>) => void;
  tutoringError?: string;
}

export function IntentChipWithDetails({
  intent,
  isActive,
  intentDetails,
  tutoringData,
  onToggle,
  onEdit,
  onTutoringChange,
  tutoringError,
}: IntentChipWithDetailsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const intentLabel = INTENTS.find(i => i.value === intent)?.label || INTENT_LABELS[intent] || intent;
  const hasDetailScreens = !!INTENT_DETAIL_OPTIONS[intent];
  const details = intentDetails[intent];
  const hasDetails = details && Object.keys(details).length > 0;
  const isNachhilfe = intent === "nachhilfe_anbieten";

  const filteredSuggestions = isNachhilfe && tutoringData
    ? TUTORING_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(tutoringData.tutoring_subject.toLowerCase())
      )
    : [];

  // Render detail values as compact labels
  const renderDetails = () => {
    if (!details) return null;
    
    const detailEntries = Object.entries(details);
    if (detailEntries.length === 0) return null;

    return (
      <div className="mt-1 space-y-0.5">
        {detailEntries.map(([field, value]) => {
          const fieldTitle = getIntentDetailFieldTitle(intent, field);
          const values = Array.isArray(value) ? value : [value];
          const labels = values.map(v => getIntentDetailLabel(intent, field, v));
          
          return (
            <p key={field} className="text-xs text-muted-foreground">
              {fieldTitle}: {labels.join(", ")}
            </p>
          );
        })}
      </div>
    );
  };

  // Render tutoring fields inline
  const renderTutoringFields = () => {
    if (!isNachhilfe || !isActive || !tutoringData || !onTutoringChange) return null;

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
            className={`h-9 text-sm ${tutoringError ? "border-destructive" : ""}`}
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
          {tutoringError && (
            <p className="text-xs text-destructive mt-1">{tutoringError}</p>
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
          id={`intent-${intent}`}
          checked={isActive}
          onCheckedChange={(checked) => onToggle(intent, checked === true)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <label 
            htmlFor={`intent-${intent}`}
            className={`text-sm font-medium cursor-pointer ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {intentLabel}
          </label>
          
          {isActive && hasDetailScreens && (
            <>
              {renderDetails()}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 h-7 px-2 text-xs text-primary hover:text-primary"
                onClick={() => onEdit(intent)}
              >
                {hasDetails ? (
                  <>
                    <Pencil className="h-3 w-3 mr-1" />
                    Bearbeiten
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    Details hinzufügen
                  </>
                )}
              </Button>
            </>
          )}

          {renderTutoringFields()}
        </div>
      </div>
    </div>
  );
}

interface IntentListWithDetailsProps {
  intents: string[];
  intentDetails: IntentDetails;
  tutoringData: TutoringData;
  onIntentsChange: (intents: string[]) => void;
  onIntentDetailsChange: (details: IntentDetails) => void;
  onEditIntent: (intent: string) => void;
  onNewIntentAdded: (intent: string) => void;
  onTutoringChange: (data: Partial<TutoringData>) => void;
  error?: string;
  tutoringError?: string;
}

export function IntentListWithDetails({
  intents,
  intentDetails,
  tutoringData,
  onIntentsChange,
  onIntentDetailsChange,
  onEditIntent,
  onNewIntentAdded,
  onTutoringChange,
  error,
  tutoringError,
}: IntentListWithDetailsProps) {
  const handleToggle = (intent: string, active: boolean) => {
    if (active) {
      // Add intent
      onIntentsChange([...intents, intent]);
      // If intent has detail screens, trigger the new intent flow
      if (INTENT_DETAIL_OPTIONS[intent]) {
        onNewIntentAdded(intent);
      }
    } else {
      // Remove intent and its details
      onIntentsChange(intents.filter(i => i !== intent));
      const newDetails = { ...intentDetails };
      delete newDetails[intent];
      onIntentDetailsChange(newDetails);
      
      // Clear tutoring data if nachhilfe is removed
      if (intent === "nachhilfe_anbieten") {
        onTutoringChange({
          tutoring_subject: "",
          tutoring_desc: "",
          tutoring_price: null,
        });
      }
    }
  };

  return (
    <div className="space-y-2">
      {INTENTS.map((intentOption) => (
        <IntentChipWithDetails
          key={intentOption.value}
          intent={intentOption.value}
          isActive={intents.includes(intentOption.value)}
          intentDetails={intentDetails}
          tutoringData={tutoringData}
          onToggle={handleToggle}
          onEdit={onEditIntent}
          onTutoringChange={onTutoringChange}
          tutoringError={intentOption.value === "nachhilfe_anbieten" ? tutoringError : undefined}
        />
      ))}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Wähle 3–6 aus. Du kannst das jederzeit ändern.
      </p>
    </div>
  );
}
