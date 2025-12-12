import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { Step1Identity } from "@/components/onboarding/Step1Identity";
import { Step2Demographics } from "@/components/onboarding/Step2Demographics";
import { Step3Study } from "@/components/onboarding/Step3Study";
import { Step4Intents } from "@/components/onboarding/Step4Intents";
import { Step5Interests } from "@/components/onboarding/Step5Interests";
import { Step6Tutoring } from "@/components/onboarding/Step6Tutoring";
import { Step7Bio } from "@/components/onboarding/Step7Bio";
import { Step8Preview } from "@/components/onboarding/Step8Preview";
import lomariaLogo from "@/assets/lomaria-logo.png";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { step, data, updateData, nextStep, prevStep, showTutoringStep } = useOnboarding();
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
    setSaving(true);
    try {
      // TODO: Save to database when auth is implemented
      console.log("Onboarding data to save:", data);
      toast({ title: "Profil gespeichert!" });
      navigate("/discover");
    } catch (err) {
      console.error("Save error:", err);
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };


  // Calculate total steps (7 if tutoring skipped, 8 otherwise)
  const totalSteps = showTutoringStep ? 8 : 7;
  const displayStep = !showTutoringStep && step > 5 ? step - 1 : step;

  return (
    <div className="min-h-screen bg-background px-6 py-8 animate-page-enter">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={lomariaLogo} alt="Lomaria" className="h-8 w-auto opacity-60" />
        </div>

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
            birthyear={data.birthyear}
            gender={data.gender}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <Step3Study
            studyProgram={data.study_program}
            semester={data.semester}
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
