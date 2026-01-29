import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { IntentDetailIntro } from "@/components/onboarding/IntentDetailIntro";
import { IntentDetailFlow } from "@/components/onboarding/IntentDetailFlow";
import { INTENT_DETAIL_OPTIONS, type IntentDetails } from "@/lib/onboarding-constants";

interface IntentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newIntents: string[];
  intentDetails: IntentDetails;
  onUpdateDetail: (intent: string, field: string, value: string | string[]) => void;
  onComplete: () => void;
  onSkip: () => void;
}

export function IntentDetailDialog({
  open,
  onOpenChange,
  newIntents,
  intentDetails,
  onUpdateDetail,
  onComplete,
  onSkip,
}: IntentDetailDialogProps) {
  const [showFlow, setShowFlow] = useState(false);

  // Filter to only intents that have detail screens
  const intentsWithScreens = useMemo(() => {
    return newIntents.filter((intent) => INTENT_DETAIL_OPTIONS[intent]);
  }, [newIntents]);

  const handleProceed = () => {
    setShowFlow(true);
  };

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
    setShowFlow(false);
  };

  const handleFlowComplete = () => {
    onComplete();
    onOpenChange(false);
    setShowFlow(false);
  };

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShowFlow(false);
    }
    onOpenChange(newOpen);
  };

  if (intentsWithScreens.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-background border-primary/20 p-6">
        <div>
          {showFlow ? (
            <IntentDetailFlow
              selectedIntents={intentsWithScreens}
              intentDetails={intentDetails}
              onUpdateDetail={onUpdateDetail}
              onComplete={handleFlowComplete}
            />
          ) : (
            <IntentDetailIntro onProceed={handleProceed} onSkip={handleSkip} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
