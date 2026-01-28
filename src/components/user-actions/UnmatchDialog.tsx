import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnmatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserName: string;
  connectionId: string;
  onComplete?: () => void;
}

export function UnmatchDialog({
  open,
  onOpenChange,
  targetUserName,
  connectionId,
  onComplete,
}: UnmatchDialogProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleUnmatch = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);

      if (error) {
        console.error("Error unmatching:", error);
        toast.error("Verbindung konnte nicht beendet werden");
        return;
      }

      // Invalidate caches
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["chats-preview", user.id] });
        queryClient.invalidateQueries({ queryKey: ["accepted-connections", user.id] });
        queryClient.invalidateQueries({ queryKey: ["chat", connectionId] });
        queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
      }

      toast.success("Verbindung beendet");
      onOpenChange(false);
      onComplete?.();
    } catch (err) {
      console.error("Error:", err);
      toast.error("Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verbindung beenden</AlertDialogTitle>
          <AlertDialogDescription>
            Möchtest du die Verbindung mit {targetUserName} beenden? Euer Chat wird dabei gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnmatch} disabled={loading}>
            {loading ? "..." : "Beenden"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
