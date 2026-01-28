import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "./ChipSelect";
import { IntentDetailIntro } from "./IntentDetailIntro";
import { IntentDetailFlow } from "./IntentDetailFlow";
import { INTENTS, INTENT_DETAIL_OPTIONS, IntentDetails } from "@/lib/onboarding-constants";
import { useToast } from "@/hooks/use-toast";

type SubFlowState = "selection" | "intro" | "detail-flow";

interface Step4Props {
  intents: string[];
  intentDetails: IntentDetails;
  onUpdate: (data: { intents: string[] }) => void;
  onUpdateIntentDetails: (intent: string, field: string, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Intents({ 
  intents, 
  intentDetails,
  onUpdate, 
  onUpdateIntentDetails,
  onNext, 
  onBack 
}: Step4Props) {
  const { toast } = useToast();
  const [subFlowState, setSubFlowState] = useState<SubFlowState>("selection");
  
  const isValid = intents.length >= 3;

  // Check if any selected intents have detail screens available
  const hasDetailScreens = intents.some(
    (intent) => INTENT_DETAIL_OPTIONS[intent]?.screens?.length > 0
  );

  const handleMaxExceeded = () => {
    toast({ title: "Maximal 6 Intents auswählbar.", variant: "destructive" });
  };

  const handleIntentSelectionNext = () => {
    if (hasDetailScreens) {
      setSubFlowState("intro");
    } else {
      onNext();
    }
  };

  const handleIntroSkip = () => {
    onNext();
  };

  const handleIntroProceed = () => {
    setSubFlowState("detail-flow");
  };

  const handleDetailFlowComplete = () => {
    onNext();
  };

  // Intent Selection Screen
  if (subFlowState === "selection") {
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

        <ChipSelect
          options={INTENTS}
          selected={intents}
          onChange={(selected) => onUpdate({ intents: selected })}
          minSelect={3}
          maxSelect={6}
          onMaxExceeded={handleMaxExceeded}
        />

        <p className="text-xs text-muted-foreground/70 text-center">
          {intents.length}/6 ausgewählt
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
            Zurück
          </Button>
          <Button onClick={handleIntentSelectionNext} disabled={!isValid} className="btn-premium">
            Weiter
          </Button>
        </div>
      </div>
    );
  }

  // Intro Screen (optional detail flow prompt)
  if (subFlowState === "intro") {
    return (
      <IntentDetailIntro
        onProceed={handleIntroProceed}
        onSkip={handleIntroSkip}
      />
    );
  }

  // Detail Flow
  if (subFlowState === "detail-flow") {
    return (
      <IntentDetailFlow
        selectedIntents={intents}
        intentDetails={intentDetails}
        onUpdateDetail={onUpdateIntentDetails}
        onComplete={handleDetailFlowComplete}
      />
    );
  }

  return null;
}
