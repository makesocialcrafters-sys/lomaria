import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { Step1Identity } from "@/components/onboarding/Step1Identity";
import { Step2Demographics } from "@/components/onboarding/Step2Demographics";
import { Step3Study } from "@/components/onboarding/Step3Study";
import { Step4Intents } from "@/components/onboarding/Step4Intents";
import { Step5Interests } from "@/components/onboarding/Step5Interests";
import { Step6Tutoring } from "@/components/onboarding/Step6Tutoring";
import { Step7Bio } from "@/components/onboarding/Step7Bio";
import { Step8Preview } from "@/components/onboarding/Step8Preview";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshOnboardingStatus } = useAppState();
  const { step, data, updateData, clearData, nextStep, prevStep, showTutoringStep } = useOnboarding();
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    // Skip tutoring step if not needed
    if (step === 5 && !showTutoringStep) {
      // Go directly to step 7 (bio)
      nextStep();
      nextStep();
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    // Skip tutoring step when going back
    if (step === 7 && !showTutoringStep) {
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

    // DEBUG: Verify session is still active
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("[Onboarding] Current session before save:", {
      hasSession: !!sessionData.session,
      userId: sessionData.session?.user?.id
    });

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
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };


  // Calculate total steps (7 if tutoring skipped, 8 otherwise)
  const totalSteps = showTutoringStep ? 8 : 7;
  const displayStep = !showTutoringStep && step > 5 ? step - 1 : step;

  return (
    <div className="min-h-screen bg-background px-6 py-8 animate-cinematic-enter">
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
            onUpdate={updateData}
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

        {step === 6 && showTutoringStep && (
          <Step6Tutoring
            tutoringSubject={data.tutoring_subject}
            tutoringDesc={data.tutoring_desc}
            tutoringPrice={data.tutoring_price}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

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
