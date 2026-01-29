import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { IntentDetailFlow } from "@/components/onboarding/IntentDetailFlow";
import { INTENT_DETAIL_OPTIONS, type IntentDetails } from "@/lib/onboarding-constants";

interface EditIntentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent: string | null;
  intentDetails: IntentDetails;
  onUpdateDetail: (intent: string, field: string, value: string | string[]) => void;
  onComplete: () => void;
}

export function EditIntentDetailsDialog({
  open,
  onOpenChange,
  intent,
  intentDetails,
  onUpdateDetail,
  onComplete,
}: EditIntentDetailsDialogProps) {
  // Track local changes for cancel functionality
  const [originalDetails, setOriginalDetails] = useState<IntentDetails>({});

  useEffect(() => {
    if (open && intent) {
      // Store original details when dialog opens
      setOriginalDetails(JSON.parse(JSON.stringify(intentDetails)));
    }
  }, [open, intent]);

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Restore original details on cancel
    if (intent && originalDetails[intent]) {
      const original = originalDetails[intent];
      Object.entries(original).forEach(([field, value]) => {
        onUpdateDetail(intent, field, value);
      });
    }
    onOpenChange(false);
  };

  // Check if intent has detail screens
  if (!intent || !INTENT_DETAIL_OPTIONS[intent]) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleCancel();
      } else {
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent className="max-w-md bg-background border-primary/20 p-6">
        <IntentDetailFlow
          selectedIntents={[intent]}
          intentDetails={intentDetails}
          onUpdateDetail={onUpdateDetail}
          onComplete={handleComplete}
          singleIntent={intent}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
