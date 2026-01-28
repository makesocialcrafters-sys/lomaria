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
      // Delete any existing non-accepted connection in EITHER direction
      await supabase
        .from("connections")
        .delete()
        .or(`and(from_user.eq.${fromUserId},to_user.eq.${toUserId}),and(from_user.eq.${toUserId},to_user.eq.${fromUserId})`)
        .in("status", ["pending", "rejected"]);

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

      // Send email notification (fire and forget - don't block on this)
      supabase.functions.invoke("notify-connection", {
        body: {
          type: "contact_request",
          fromUserId,
          toUserId,
          message: message.trim(),
        },
      }).catch((err) => {
        console.error("Error sending email notification:", err);
      });

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
