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

interface BlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  targetUserName: string;
  connectionId: string;
  currentUserId: string;
  onComplete?: () => void;
}

export function BlockDialog({
  open,
  onOpenChange,
  targetUserId,
  targetUserName,
  connectionId,
  currentUserId,
  onComplete,
}: BlockDialogProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleBlock = async () => {
    setLoading(true);
    try {
      // 1. Create block entry
      const { error: blockError } = await supabase
        .from("blocks")
        .insert({
          blocker_id: currentUserId,
          blocked_id: targetUserId,
        });

      if (blockError) {
        console.error("Error creating block:", blockError);
        toast.error("Blockierung fehlgeschlagen");
        return;
      }

      // 2. Delete connection (if exists)
      await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);

      // Optimistic update: remove user from discover cache
      queryClient.setQueriesData(
        { queryKey: ["discover-profiles"] },
        (old: any) => Array.isArray(old) ? old.filter((p: any) => p.id !== targetUserId) : old
      );

      // Invalidate other caches
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["chats-preview", user.id] });
        queryClient.invalidateQueries({ queryKey: ["accepted-connections", user.id] });
        queryClient.invalidateQueries({ queryKey: ["blocked-user-ids", user.id] });
        queryClient.invalidateQueries({ queryKey: ["chat", connectionId] });
      }

      toast.success(`${targetUserName} wurde blockiert`);
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
          <AlertDialogTitle>Nutzer blockieren</AlertDialogTitle>
          <AlertDialogDescription>
            Wenn du {targetUserName} blockierst, werdet ihr euch gegenseitig nicht mehr sehen können.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleBlock} 
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "..." : "Blockieren"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
