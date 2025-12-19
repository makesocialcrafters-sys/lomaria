import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type SettingsView = "main" | "change-password";

export default function Settings() {
  const [view, setView] = useState<SettingsView>("main");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background animate-cinematic-enter">
      <div className="mx-auto max-w-lg px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          {view === "main" && (
            <button
              onClick={() => navigate(-1)}
              className="mb-4 font-display text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500"
            >
              ← Zurück
            </button>
          )}
          {view !== "main" && (
            <button
              onClick={() => setView("main")}
              className="mb-4 font-display text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500"
            >
              ← Zurück
            </button>
          )}
          <h1 className="heading-page text-left mb-3">
            {view === "main" && "Einstellungen"}
            {view === "change-password" && "Passwort ändern"}
          </h1>
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
      </div>
    </div>
  );
}
