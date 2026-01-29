import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { 
  INTENT_DETAIL_OPTIONS, 
  INTENT_LABELS,
  getIntentDetailLabel,
  getIntentDetailFieldTitle,
  type IntentDetails 
} from "@/lib/onboarding-constants";
import { INTENTS } from "@/lib/constants";

interface IntentChipWithDetailsProps {
  intent: string;
  isActive: boolean;
  intentDetails: IntentDetails;
  onToggle: (intent: string, active: boolean) => void;
  onEdit: (intent: string) => void;
}

export function IntentChipWithDetails({
  intent,
  isActive,
  intentDetails,
  onToggle,
  onEdit,
}: IntentChipWithDetailsProps) {
  const intentLabel = INTENTS.find(i => i.value === intent)?.label || INTENT_LABELS[intent] || intent;
  const hasDetailScreens = !!INTENT_DETAIL_OPTIONS[intent];
  const details = intentDetails[intent];
  const hasDetails = details && Object.keys(details).length > 0;

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
        </div>
      </div>
    </div>
  );
}

interface IntentListWithDetailsProps {
  intents: string[];
  intentDetails: IntentDetails;
  onIntentsChange: (intents: string[]) => void;
  onIntentDetailsChange: (details: IntentDetails) => void;
  onEditIntent: (intent: string) => void;
  onNewIntentAdded: (intent: string) => void;
  error?: string;
}

export function IntentListWithDetails({
  intents,
  intentDetails,
  onIntentsChange,
  onIntentDetailsChange,
  onEditIntent,
  onNewIntentAdded,
  error,
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
          onToggle={handleToggle}
          onEdit={onEditIntent}
        />
      ))}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Wähle 3–6 aus. Du kannst das jederzeit ändern.
      </p>
    </div>
  );
}
