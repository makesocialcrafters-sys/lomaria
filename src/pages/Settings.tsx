import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EditProfileForm } from "@/components/settings/EditProfileForm";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { ProfileFormData, UserProfile } from "@/types/user";

type SettingsView = "main" | "edit-profile" | "change-password";

export default function Settings() {
  const [view, setView] = useState<SettingsView>("main");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Profil konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSaveProfile = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");

      const { error } = await supabase
        .from("users")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          profile_image: data.profile_image,
          age: data.age,
          gender: data.gender,
          study_program: data.study_program,
          study_phase: data.study_phase,
          focus: data.study_phase === "cbk_hauptstudium" ? (data.focus || null) : null,
          intents: data.intents,
          interests: data.interests,
          tutoring_subject: data.tutoring_subject || null,
          tutoring_desc: data.tutoring_desc || null,
          tutoring_price: data.tutoring_price,
          bio: data.bio || null,
          last_active_at: new Date().toISOString(),
        })
        .eq("auth_user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profil gespeichert",
        description: "Deine Änderungen wurden gespeichert.",
      });
      await loadProfile();
      setView("main");
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Profil konnte nicht gespeichert werden",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitialFormData = (): ProfileFormData => {
    if (!profile) {
      return {
        first_name: "",
        last_name: "",
        profile_image: null,
        age: null,
        gender: null,
        study_program: null,
        study_phase: null,
        focus: "",
        intents: [],
        interests: [],
        tutoring_subject: "",
        tutoring_desc: "",
        tutoring_price: null,
        bio: "",
      };
    }
    return {
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      profile_image: profile.profile_image,
      age: profile.age,
      gender: profile.gender,
      study_program: profile.study_program,
      study_phase: profile.study_phase,
      focus: profile.focus ?? "",
      intents: profile.intents ?? [],
      interests: profile.interests ?? [],
      tutoring_subject: profile.tutoring_subject ?? "",
      tutoring_desc: profile.tutoring_desc ?? "",
      tutoring_price: profile.tutoring_price,
      bio: profile.bio ?? "",
    };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {view === "main" && (
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Zurück
            </button>
          )}
          {view !== "main" && (
            <button
              onClick={() => setView("main")}
              className="mb-4 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Zurück
            </button>
          )}
          <h1 className="text-2xl font-bold text-primary">
            {view === "main" && "Einstellungen"}
            {view === "edit-profile" && "Profil bearbeiten"}
            {view === "change-password" && "Passwort ändern"}
          </h1>
        </div>

        {/* Main View */}
        {view === "main" && (
          <div className="space-y-4">
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => setView("edit-profile")}
            >
              Profil bearbeiten
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => setView("change-password")}
            >
              Passwort ändern
            </Button>

            <Button
              variant="secondary"
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

        {/* Edit Profile View */}
        {view === "edit-profile" && (
          <EditProfileForm
            initialData={getInitialFormData()}
            onSave={handleSaveProfile}
            onCancel={() => setView("main")}
            isLoading={isSaving}
          />
        )}

        {/* Change Password View */}
        {view === "change-password" && (
          <ChangePasswordForm onCancel={() => setView("main")} />
        )}
      </div>
    </div>
  );
}
