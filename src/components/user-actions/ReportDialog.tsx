import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type ReportReason = "inappropriate" | "harassment" | "fake_profile" | "spam" | "other";

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "inappropriate", label: "Unangemessenes Verhalten" },
  { value: "harassment", label: "Belästigung" },
  { value: "fake_profile", label: "Fake-Profil" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Sonstiges" },
];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  targetUserName: string;
  currentUserId: string;
}

export function ReportDialog({
  open,
  onOpenChange,
  targetUserId,
  targetUserName,
  currentUserId,
}: ReportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);

  const handleReport = async () => {
    if (!selectedReason) {
      toast.error("Bitte wähle einen Grund aus");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("reports")
        .insert({
          reporter_id: currentUserId,
          reported_id: targetUserId,
          reason: selectedReason,
        });

      if (error) {
        console.error("Error creating report:", error);
        toast.error("Meldung konnte nicht gesendet werden");
        return;
      }

      toast.success("Danke für deine Meldung. Wir schauen uns das an.");
      setSelectedReason(null);
      onOpenChange(false);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nutzer melden</DialogTitle>
          <DialogDescription>
            Hilf uns, die Community sicher zu halten.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedReason || ""}
            onValueChange={(value) => setSelectedReason(value as ReportReason)}
          >
            {REPORT_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-3 py-2">
                <RadioGroupItem value={reason.value} id={reason.value} />
                <Label htmlFor={reason.value} className="cursor-pointer">
                  {reason.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Abbrechen
          </Button>
          <Button onClick={handleReport} disabled={loading || !selectedReason}>
            {loading ? "..." : "Melden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
