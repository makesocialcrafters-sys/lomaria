import { useState } from "react";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnProfile } from "@/hooks/useOwnProfile";
import { Button } from "@/components/ui/button";
import { Settings, Pencil } from "lucide-react";
import { 
  STUDY_PROGRAMS, 
  GENDERS, 
  INTENTS, 
  INTERESTS,
  getIntentDetailLabel,
  getIntentDetailFieldTitle 
} from "@/lib/onboarding-constants";
import { EditProfileForm } from "@/components/settings/EditProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProfileFormData } from "@/types/user";
import type { Gender, Intent, Interest, StudyProgram } from "@/lib/constants";
export default function Profile() {
  const {
    signOut,
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    data: userData,
    isLoading,
    refetch
  } = useOwnProfile();
  const {
    toast
  } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const handleSaveProfile = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const {
        data: {
          user: authUser
        }
      } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Nicht eingeloggt");
      const {
        error
      } = await supabase.from("users").update({
        first_name: data.first_name,
        last_name: data.last_name,
        profile_image: data.profile_image,
        age: data.age,
        gender: data.gender,
        study_program: data.study_program,
        study_phase: data.study_phase,
        focus: data.study_phase === "cbk_hauptstudium" ? data.focus || null : null,
        intents: data.intents,
        interests: data.interests,
        tutoring_subject: data.tutoring_subject || null,
        tutoring_desc: data.tutoring_desc || null,
        tutoring_price: data.tutoring_price,
        bio: data.bio || null,
        intent_details: data.intent_details,
        last_active_at: new Date().toISOString()
      }).eq("auth_user_id", authUser.id);
      if (error) throw error;
      toast({
        title: "Profil gespeichert",
        description: "Deine Änderungen wurden gespeichert."
      });
      await refetch();
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Profil konnte nicht gespeichert werden",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const getInitialFormData = (): ProfileFormData => {
    if (!userData) {
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
        intent_details: {},
      };
    }
    return {
      first_name: userData.first_name ?? "",
      last_name: userData.last_name ?? "",
      profile_image: userData.profile_image,
      age: userData.age,
      gender: userData.gender as Gender | null,
      study_program: userData.study_program as StudyProgram | null,
      study_phase: userData.study_phase ?? null,
      focus: userData.focus ?? "",
      intents: (userData.intents ?? []) as Intent[],
      interests: (userData.interests ?? []) as Interest[],
      tutoring_subject: userData.tutoring_subject ?? "",
      tutoring_desc: userData.tutoring_desc ?? "",
      tutoring_price: userData.tutoring_price,
      bio: userData.bio ?? "",
      intent_details: userData.intent_details ?? {},
    };
  };
  if (isLoading) {
    return <div className="flex items-center justify-center py-20">
        <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-loader" />
        </div>
      </div>;
  }

  // Edit Mode
  if (isEditing && user) {
    return <div className="px-6 py-8 animate-cinematic-enter">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <button onClick={() => setIsEditing(false)} className="mb-4 font-display text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500">
              ← Zurück
            </button>
            <h1 className="heading-page text-left mb-3">Profil bearbeiten</h1>
            <div className="w-16 h-px bg-primary/40" />
          </div>
          <EditProfileForm initialData={getInitialFormData()} onSave={handleSaveProfile} onCancel={() => setIsEditing(false)} isLoading={isSaving} userId={user.id} />
        </div>
      </div>;
  }
  const genderLabel = GENDERS.find(g => g.value === userData?.gender)?.label;
  const studyProgramLabel = STUDY_PROGRAMS.find(p => p.value === userData?.study_program)?.label;
  
  const intentLabels = (userData?.intents || []).map(i => INTENTS.find(intent => intent.value === i)?.label).filter(Boolean);
  const interestLabels = (userData?.interests || []).map(i => INTERESTS.find(interest => interest.value === i)?.label).filter(Boolean);
  return <div className="px-6 py-8 animate-cinematic-enter">
      <div className="max-w-md mx-auto">
        {/* Title with Edit and Settings Buttons */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-lg uppercase tracking-[0.15em] text-primary">
            MEIN PROFIL
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="text-foreground/60 hover:text-primary transition-all duration-500">
              <Pencil className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="text-foreground/60 hover:text-primary transition-all duration-500">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="divider-subtle mb-8" />

        {/* Profile Image */}
        <div className="flex justify-center mb-6">
          <SignedAvatar
            storagePath={userData?.profile_image}
            name={userData?.first_name}
            className="w-28 h-28"
            fallbackClassName="text-3xl"
          />
        </div>

        {/* Name + Age + Gender */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-display text-foreground">
            {userData?.first_name} {userData?.last_name}
          </h2>
          <p className="text-muted-foreground">
            {userData?.age && `${userData.age} Jahre`}
            {userData?.age && genderLabel && " · "}
            {genderLabel}
          </p>
        </div>

        {/* Study Info */}
        {(studyProgramLabel || userData?.study_phase) && (
          <div className="text-sm text-foreground/70 text-center mb-6">
            {studyProgramLabel && <p>{studyProgramLabel}</p>}
            {userData?.study_phase && <p className="text-muted-foreground">{userData.study_phase}</p>}
          </div>
        )}

        {/* Intents with Details */}
        {userData?.intents && userData.intents.length > 0 && <div className="mb-6">
            <h3 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">
              Ich suche
            </h3>
            <div className="space-y-3">
              {userData.intents.map((intentValue) => {
                const intentLabel = INTENTS.find((int) => int.value === intentValue)?.label;
                const details = userData.intent_details?.[intentValue];
                const hasDetails = details && Object.keys(details).length > 0;

                return (
                  <div key={intentValue} className="p-3 bg-card border border-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground">{intentLabel}</p>
                    {hasDetails && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(details).map(([field, value]) => {
                          const fieldTitle = getIntentDetailFieldTitle(intentValue, field);
                          const labels = Array.isArray(value)
                            ? value.map((v) => getIntentDetailLabel(intentValue, field, v)).join(", ")
                            : getIntentDetailLabel(intentValue, field, value);
                          
                          return (
                            <p key={field} className="text-xs text-muted-foreground">
                              <span className="text-foreground/70">{fieldTitle}:</span> {labels}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>}

        {/* Interests */}
        {interestLabels.length > 0 && <div className="mb-6">
            <h3 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
              Interessen
            </h3>
            <div className="flex flex-wrap gap-2">
              {interestLabels.map(label => <span key={label} className="text-xs px-3 py-1 bg-secondary text-foreground/80 rounded">
                  {label}
                </span>)}
            </div>
          </div>}

        {/* Tutoring */}
        {userData?.tutoring_subject && <div className="mb-6 p-4 bg-card border border-primary/20 rounded-md">
            <h3 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
              Nachhilfe
            </h3>
            <p className="text-foreground font-display">{userData.tutoring_subject}</p>
            {userData.tutoring_desc && <p className="text-sm text-muted-foreground mt-1">{userData.tutoring_desc}</p>}
            {userData.tutoring_price && <p className="text-sm text-primary mt-2">{userData.tutoring_price}€ / Stunde</p>}
          </div>}

        {/* Bio */}
        {userData?.bio && <div className="mb-8">
            <h3 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
              Über mich
            </h3>
            <p className="text-foreground/90 text-sm leading-relaxed">{userData.bio}</p>
          </div>}

        {/* Sign Out */}
        <div className="pt-4 border-t border-border">
          
        </div>
      </div>
    </div>;
}