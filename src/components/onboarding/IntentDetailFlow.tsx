import { useState, useMemo } from "react";
import { IntentDetailScreen } from "./IntentDetailScreen";
import { Button } from "@/components/ui/button";
import { 
  INTENT_DETAIL_OPTIONS, 
  INTENT_LABELS,
  IntentDetails 
} from "@/lib/onboarding-constants";

interface IntentDetailFlowProps {
  selectedIntents: string[];
  intentDetails: IntentDetails;
  onUpdateDetail: (intent: string, field: string, value: string | string[]) => void;
  onComplete: () => void;
  /** Edit mode: only show screens for this single intent */
  singleIntent?: string;
  /** Callback for cancel action in edit mode */
  onCancel?: () => void;
}

type ScreenPosition = {
  intentKey: string;
  screenIndex: number;
};

export function IntentDetailFlow({
  selectedIntents,
  intentDetails,
  onUpdateDetail,
  onComplete,
  singleIntent,
  onCancel,
}: IntentDetailFlowProps) {
  // Build flat list of all screens to show
  const allScreens = useMemo(() => {
    const screens: ScreenPosition[] = [];
    
    // If singleIntent is provided, only show screens for that intent
    const intentsToProcess = singleIntent ? [singleIntent] : selectedIntents;
    
    for (const intent of intentsToProcess) {
      const config = INTENT_DETAIL_OPTIONS[intent];
      if (config) {
        config.screens.forEach((_, screenIndex) => {
          screens.push({ intentKey: intent, screenIndex });
        });
      }
    }
    
    return screens;
  }, [selectedIntents, singleIntent]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // If no screens to show, complete immediately
  if (allScreens.length === 0) {
    onComplete();
    return null;
  }

  const currentPosition = allScreens[currentIndex];
  if (!currentPosition) {
    onComplete();
    return null;
  }

  const { intentKey, screenIndex } = currentPosition;
  const intentConfig = INTENT_DETAIL_OPTIONS[intentKey];
  const screenConfig = intentConfig?.screens[screenIndex];

  if (!screenConfig) {
    onComplete();
    return null;
  }

  const intentLabel = INTENT_LABELS[intentKey] || intentKey;
  
  // Get current selection for this screen
  const currentDetails = intentDetails[intentKey] || {};
  const currentValue = currentDetails[screenConfig.id] || (screenConfig.multiSelect ? [] : "");

  const handleSelect = (value: string | string[]) => {
    onUpdateDetail(intentKey, screenConfig.id, value);
  };

  const goToNextScreen = () => {
    if (currentIndex < allScreens.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleNext = () => {
    goToNextScreen();
  };

  const handleSkip = () => {
    goToNextScreen();
  };

  const isLastScreen = currentIndex === allScreens.length - 1;
  const isEditMode = !!singleIntent;

  return (
    <div>
      <IntentDetailScreen
        intentLabel={intentLabel}
        screenTitle={screenConfig.title}
        options={screenConfig.options}
        selected={currentValue}
        multiSelect={screenConfig.multiSelect}
        onSelect={handleSelect}
        onNext={handleNext}
        onSkip={handleSkip}
        nextLabel={isEditMode && isLastScreen ? "Fertig" : undefined}
      />
      {isEditMode && onCancel && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground"
          >
            Abbrechen
          </Button>
        </div>
      )}
    </div>
  );
}
