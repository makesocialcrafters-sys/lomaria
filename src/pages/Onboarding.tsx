import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { Step1Identity } from "@/components/onboarding/Step1Identity";
import { Step2Demographics } from "@/components/onboarding/Step2Demographics";
import { Step3Study } from "@/components/onboarding/Step3Study";
import { Step4Intents } from "@/components/onboarding/Step4Intents";
import { Step5Interests } from "@/components/onboarding/Step5Interests";
import { Step7Bio } from "@/components/onboarding/Step7Bio";
import { Step8Preview } from "@/components/onboarding/Step8Preview";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshOnboardingStatus } = useAppState();
  const { step, data, updateData, updateIntentDetails, clearData, nextStep, prevStep } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    localStorage.removeItem("lomaria_onboarding_draft");
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleNext = () => {
    // Always skip tutoring step (now integrated in Step 4)
    if (step === 5) {
      // Go directly to step 7 (bio)
      nextStep();
      nextStep();
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    // Always skip tutoring step when going back
    if (step === 7) {
      prevStep();
      prevStep();
    } else {
      prevStep();
    }
  };

  const handleSave = async () => {
    if (!user) {
      console.log("[Onboarding] No user found, cannot save");
      toast({ title: "Nicht angemeldet", variant: "destructive" });
      return;
    }

    // Verify session is still active AND auth user still exists
    const { data: userCheck, error: userCheckError } = await supabase.auth.getUser();
    console.log("[Onboarding] Auth user check before save:", {
      hasUser: !!userCheck.user,
      userId: userCheck.user?.id,
      error: userCheckError,
    });

    if (userCheckError || !userCheck.user) {
      toast({
        title: "Sitzung abgelaufen",
        description: "Bitte melde dich erneut an.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate("/auth");
      return;
    }

    setSaving(true);
    try {
const profileData = {
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
        tutoring_price: data.tutoring_price || null,
        bio: data.bio || null,
        intent_details: data.intent_details || {},
        last_active_at: new Date().toISOString(),
      };

      console.log("[Onboarding] Saving profile data for user:", user.id);

      // Check if user record already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("[Onboarding] Check error:", checkError);
        throw checkError;
      }

      console.log("[Onboarding] Existing user check:", { exists: !!existingUser });

      let saveError;
      if (existingUser) {
        // Update existing record
        const { error } = await supabase
          .from("users")
          .update(profileData)
          .eq("auth_user_id", user.id);
        saveError = error;
        console.log("[Onboarding] Update result:", { error });
      } else {
        // Insert new record
        const { error } = await supabase
          .from("users")
          .insert({
            auth_user_id: user.id,
            email: user.email!,
            ...profileData,
          });
        saveError = error;
        console.log("[Onboarding] Insert result:", { error });
      }

      if (saveError) throw saveError;

      console.log("[Onboarding] Profile saved successfully");
      
      // Verify session is STILL active after save
      const { data: postSaveSession } = await supabase.auth.getSession();
      console.log("[Onboarding] Session after save:", {
        hasSession: !!postSaveSession.session,
        userId: postSaveSession.session?.user?.id
      });

      // Clear localStorage draft after successful save
      clearData();
      
      toast({ title: "Profil gespeichert!" });
      
      // Refresh onboarding status in global state before navigating
      await refreshOnboardingStatus();
      
      // Navigate to discover - session should still be active
      console.log("[Onboarding] Navigating to /discover");
      navigate("/discover", { replace: true });
    } catch (err) {
      console.error("[Onboarding] Save error:", err);
      const message = err instanceof Error ? err.message : (err as any)?.message || "Unbekannter Fehler";
      toast({ title: "Fehler beim Speichern", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };


  // Step 6 is now always skipped (tutoring is in Step 4)
  const totalSteps = 7;
  const displayStep = step > 5 ? step - 1 : step;

  return (
    <div className="min-h-screen bg-background px-6 py-8 animate-cinematic-enter relative">
      {/* Logout Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Abmelden
      </Button>

      <div className="max-w-md mx-auto">
        {/* Step Indicator */}
        <StepIndicator currentStep={displayStep} totalSteps={totalSteps} />

        {/* Steps */}
        {step === 1 && (
          <Step1Identity
            firstName={data.first_name}
            lastName={data.last_name}
            profileImage={data.profile_image}
            onUpdate={updateData}
            onNext={handleNext}
          />
        )}

        {step === 2 && (
          <Step2Demographics
            age={data.age}
            gender={data.gender}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <Step3Study
            studyProgram={data.study_program}
            studyPhase={data.study_phase}
            focus={data.focus}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

{step === 4 && (
          <Step4Intents
            intents={data.intents}
            tutoringData={{
              tutoring_subject: data.tutoring_subject,
              tutoring_desc: data.tutoring_desc,
              tutoring_price: data.tutoring_price,
            }}
            onUpdate={updateData}
            onUpdateTutoring={(tutoringData) => updateData({
              tutoring_subject: tutoringData.tutoring_subject ?? data.tutoring_subject,
              tutoring_desc: tutoringData.tutoring_desc ?? data.tutoring_desc,
              tutoring_price: tutoringData.tutoring_price !== undefined ? tutoringData.tutoring_price : data.tutoring_price,
            })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 5 && (
          <Step5Interests
            interests={data.interests}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Step 6 removed - tutoring now integrated in Step 4 */}

        {step === 7 && (
          <Step7Bio
            bio={data.bio}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 8 && (
          <Step8Preview
            data={data}
            onBack={handleBack}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}
