import { useState, useCallback, useEffect } from "react";
import { OnboardingData, initialOnboardingData, IntentDetails } from "@/lib/onboarding-constants";

const STORAGE_KEY = "lomaria_onboarding_draft";

export function useOnboarding() {
  const [step, setStep] = useState(1);
  
  // Initialize from localStorage
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure intent_details exists for backwards compatibility
        return {
          ...initialOnboardingData,
          ...parsed,
          intent_details: parsed.intent_details || {},
        };
      }
    } catch {
      // Ignore parse errors
    }
    return initialOnboardingData;
  });

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }, [data]);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateIntentDetails = useCallback(
    (intent: string, field: string, value: string | string[]) => {
      setData((prev) => ({
        ...prev,
        intent_details: {
          ...prev.intent_details,
          [intent]: {
            ...(prev.intent_details[intent] || {}),
            [field]: value,
          },
        },
      }));
    },
    []
  );

  const clearIntentDetails = useCallback(() => {
    setData((prev) => ({
      ...prev,
      intent_details: {},
    }));
  }, []);

  const clearData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(initialOnboardingData);
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
    updateIntentDetails,
    clearIntentDetails,
    clearData,
    nextStep,
    prevStep,
    goToStep,
    showTutoringStep,
    getEffectiveStep,
  };
}
