import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContactRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toUserId: string;
  fromUserId: string | null;
  recipientName: string;
}

const COOLDOWN_MS = 72 * 60 * 60 * 1000; // 72 hours

export function ContactRequestDialog({
  open,
  onOpenChange,
  toUserId,
  fromUserId,
  recipientName,
}: ContactRequestDialogProps) {
  const navigate = useNavigate();
  const [message, setMessage] = useState(
    `Hey! Ich habe dein Profil gesehen. Hast du Lust, dich auszutauschen?`
  );
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!fromUserId) {
      toast.error("Fehler beim Senden der Anfrage");
      return;
    }

    setSending(true);

    try {
      // Check for existing rejected connection with cooldown
      const { data: existingRejection } = await supabase
        .from("connections")
        .select("id, rejected_at")
        .eq("from_user", fromUserId)
        .eq("to_user", toUserId)
        .eq("status", "rejected")
        .maybeSingle() as { data: { id: string; rejected_at: string | null } | null };

      if (existingRejection?.rejected_at) {
        const rejectedTime = new Date(existingRejection.rejected_at).getTime();
        const cooldownEnd = rejectedTime + COOLDOWN_MS;
        const now = Date.now();

        if (now < cooldownEnd) {
          // Still in cooldown
          const hoursLeft = Math.ceil((cooldownEnd - now) / (60 * 60 * 1000));
          toast.error(`Diese Person hat deine Anfrage kürzlich abgelehnt. Bitte warte noch ${hoursLeft} Stunden.`);
          setSending(false);
          return;
        } else {
          // Cooldown expired - delete old rejected connection
          await supabase
            .from("connections")
            .delete()
            .eq("id", existingRejection.id);
        }
      }

      // Create new connection request
      const { error } = await supabase.from("connections").insert({
        from_user: fromUserId,
        to_user: toUserId,
        message: message.trim(),
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Du hast bereits eine Anfrage an diese Person gesendet");
        } else {
          console.error("Error sending request:", error);
          toast.error("Fehler beim Senden der Anfrage");
        }
        return;
      }

      toast.success("Kontaktanfrage gesendet!");
      onOpenChange(false);
      navigate("/discover");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Fehler beim Senden der Anfrage");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Nachricht an {recipientName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Schreibe eine Nachricht..."
            className="min-h-[120px] bg-background border-border/50 text-foreground"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {message.length}/500
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Abbrechen
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? "Senden..." : "Senden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
