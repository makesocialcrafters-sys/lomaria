import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChipSelect } from "./ChipSelect";
import { IntentChipWithTutoring } from "./IntentChipWithTutoring";
import { IntentDetailIntro } from "./IntentDetailIntro";
import { IntentDetailFlow } from "./IntentDetailFlow";
import { INTENTS, INTENT_DETAIL_OPTIONS, IntentDetails } from "@/lib/onboarding-constants";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SubFlowState = "selection" | "intro" | "detail-flow";

interface TutoringData {
  tutoring_subject: string;
  tutoring_desc: string;
  tutoring_price: number | null;
}

interface Step4Props {
  intents: string[];
  intentDetails: IntentDetails;
  tutoringData: TutoringData;
  onUpdate: (data: { intents: string[] }) => void;
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
  const [subFlowState, setSubFlowState] = useState<SubFlowState>("selection");
  
  const showTutoring = intents.includes("nachhilfe_anbieten");
  const tutoringValid = !showTutoring || tutoringData.tutoring_subject.trim().length > 0;
  const isValid = intents.length >= 3 && tutoringValid;

  // Check if any selected intents have detail screens available
  const hasDetailScreens = intents.some(
    (intent) => INTENT_DETAIL_OPTIONS[intent]?.screens?.length > 0
  );

  const handleMaxExceeded = () => {
    toast({ title: "Maximal 6 Intents auswählbar.", variant: "destructive" });
  };

  const handleIntentToggle = (intentValue: string) => {
    if (intents.includes(intentValue)) {
      onUpdate({ intents: intents.filter(i => i !== intentValue) });
      // Clear tutoring data if nachhilfe is removed
      if (intentValue === "nachhilfe_anbieten") {
        onUpdateTutoring({
          tutoring_subject: "",
          tutoring_desc: "",
          tutoring_price: null,
        });
      }
    } else {
      if (intents.length >= 6) {
        handleMaxExceeded();
        return;
      }
      onUpdate({ intents: [...intents, intentValue] });
    }
  };

  const handleIntentSelectionNext = () => {
    if (!tutoringValid) {
      toast({ title: "Bitte gib ein Fach für Nachhilfe an.", variant: "destructive" });
      return;
    }
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

        <div className="flex flex-wrap gap-2 justify-center py-4">
          {INTENTS.map((intent) => (
            <IntentChipWithTutoring
              key={intent.value}
              value={intent.value}
              label={intent.label}
              isSelected={intents.includes(intent.value)}
              onToggle={() => handleIntentToggle(intent.value)}
              tutoringData={tutoringData}
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
