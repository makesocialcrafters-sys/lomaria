import { useState, useCallback } from "react";
import { OnboardingData, initialOnboardingData } from "@/lib/onboarding-constants";

export function useOnboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 8));
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((s: number) => {
    setStep(Math.min(Math.max(s, 1), 8));
  }, []);

  // Check if tutoring step should be shown
  const showTutoringStep = data.intents.includes("nachhilfe_anbieten");

  // Get the effective step (skip step 6 if tutoring not selected)
  const getEffectiveStep = useCallback(
    (currentStep: number) => {
      if (currentStep === 6 && !showTutoringStep) {
        return 7; // Skip to bio
      }
      return currentStep;
    },
    [showTutoringStep]
  );

  return {
    step,
    data,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    showTutoringStep,
    getEffectiveStep,
  };
}
