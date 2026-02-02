import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { BlockedUsersList } from "@/components/settings/BlockedUsersList";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type SettingsView = "main" | "change-password" | "blocked-users";

export default function Settings() {
  const [view, setView] = useState<SettingsView>("main");
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useOwnProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!user) return;
    
    setIsUpdatingNotifications(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ email_notifications_enabled: enabled })
        .eq("auth_user_id", user.id);

      if (error) throw error;

      // Invalidate profile cache to reflect the change
      queryClient.invalidateQueries({ queryKey: ["own-profile", user.id] });

      toast({
        title: enabled ? "E-Mail-Benachrichtigungen aktiviert" : "E-Mail-Benachrichtigungen deaktiviert",
        description: enabled 
          ? "Du erhältst wieder E-Mails bei neuen Nachrichten und Anfragen."
          : "Du erhältst keine E-Mails mehr von Lomaria.",
      });
    } catch (error) {
      console.error("Error updating notification preference:", error);
      toast({
        title: "Fehler",
        description: "Die Einstellung konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case "change-password":
        return "Passwort ändern";
      case "blocked-users":
        return "Blockiert";
      default:
        return "Einstellungen";
    }
  };

  return (
    <div className="min-h-screen bg-background animate-cinematic-enter">
      <div className="mx-auto max-w-lg px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          {view === "main" ? (
            <button
              onClick={() => navigate(-1)}
              className="mb-4 font-display text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500"
            >
              ← Zurück
            </button>
          ) : (
            <button
              onClick={() => setView("main")}
              className="mb-4 font-display text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500"
            >
              ← Zurück
            </button>
          )}
          <h1 className="heading-page text-left mb-3">{getTitle()}</h1>
          <div className="w-16 h-px bg-primary/40" />
        </div>

        {/* Main View */}
        {view === "main" && (
          <div className="space-y-4">
            {/* Email Display */}
            <div className="p-4 border border-border/40 rounded-lg bg-muted/20">
              <p className="text-xs font-display tracking-wide text-muted-foreground mb-1">
                Angemeldet als
              </p>
              <p className="font-display text-foreground">
                {user?.email}
              </p>
            </div>

            {/* Email Notifications Toggle */}
            <div className="p-4 border border-border/40 rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-foreground">E-Mail-Benachrichtigungen</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kontaktanfragen, neue Nachrichten etc.
                  </p>
                </div>
                <Switch
                  checked={profile?.email_notifications_enabled ?? true}
                  onCheckedChange={handleToggleNotifications}
                  disabled={isUpdatingNotifications}
                />
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setView("change-password")}
            >
              Passwort ändern
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setView("blocked-users")}
            >
              Blockierte Nutzer
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              Abmelden
            </Button>

            <div className="pt-8">
              <DeleteAccountDialog />
            </div>
          </div>
        )}

        {/* Change Password View */}
        {view === "change-password" && (
          <ChangePasswordForm onCancel={() => setView("main")} />
        )}

        {/* Blocked Users View */}
        {view === "blocked-users" && <BlockedUsersList />}
      </div>
    </div>
  );
}
