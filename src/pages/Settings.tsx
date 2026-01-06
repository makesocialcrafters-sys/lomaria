import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { BlockedUsersList } from "@/components/settings/BlockedUsersList";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type SettingsView = "main" | "change-password" | "blocked-users";

export default function Settings() {
  const [view, setView] = useState<SettingsView>("main");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
