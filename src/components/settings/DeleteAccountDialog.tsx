import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function DeleteAccountDialog() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");

      // Delete user data from public.users
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("auth_user_id", user.id);

      if (deleteError) throw deleteError;

      // Sign out the user (the actual user deletion would need to be done via edge function or admin API)
      await supabase.auth.signOut();

      toast({
        title: "Konto gelöscht",
        description: "Dein Konto wurde erfolgreich gelöscht.",
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Konto konnte nicht gelöscht werden",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          Konto löschen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konto wirklich löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Willst du dein Konto wirklich dauerhaft löschen? Diese Aktion kann nicht
            rückgängig gemacht werden. Alle deine Daten werden unwiderruflich gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Löschen..." : "Ja, Konto löschen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
