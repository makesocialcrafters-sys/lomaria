import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useBlockedUsers, BlockedUser } from "@/hooks/useBlockedUsers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SignedAvatar } from "@/components/ui/SignedAvatar";

export function BlockedUsersList() {
  const { data: blockedUsers, isLoading } = useBlockedUsers();
  const [unblockTarget, setUnblockTarget] = useState<BlockedUser | null>(null);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUnblock = async () => {
    if (!unblockTarget) return;

    setIsUnblocking(true);
    try {
      const { error } = await supabase
        .from("blocks")
        .delete()
        .eq("id", unblockTarget.blockId);

      if (error) throw error;

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-user-ids"] });
      queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["chats-preview"] });

      toast({
        title: "Blockierung aufgehoben",
        description: `Du kannst ${unblockTarget.firstName} jetzt wieder eine Anfrage senden.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Blockierung konnte nicht aufgehoben werden.",
        variant: "destructive",
      });
    } finally {
      setIsUnblocking(false);
      setUnblockTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-border/30 rounded-md">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Du hast keine Nutzer blockiert.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {blockedUsers.map((user) => (
          <div
            key={user.blockId}
            className="flex items-center gap-4 p-4 bg-card border border-border/30 rounded-md"
          >
            <SignedAvatar
              storagePath={user.profileImage}
              name={user.firstName}
              className="w-12 h-12"
              fallbackClassName="text-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{user.firstName}</p>
              <p className="text-sm text-muted-foreground truncate">
                {[user.studyProgram, user.studyPhase].filter(Boolean).join(" · ") || "Keine Angaben"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUnblockTarget(user)}
            >
              Aufheben
            </Button>
          </div>
        ))}
      </div>

      <AlertDialog open={!!unblockTarget} onOpenChange={() => setUnblockTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blockierung aufheben?</AlertDialogTitle>
            <AlertDialogDescription>
              {unblockTarget?.firstName} wird dich danach wieder sehen können.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnblocking}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock} disabled={isUnblocking}>
              Aufheben
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
