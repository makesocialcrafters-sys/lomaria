import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AppStateContextType {
  isOnboardingComplete: boolean | null;
  isCheckingOnboarding: boolean;
  refreshOnboardingStatus: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  const checkOnboardingStatus = useCallback(async () => {
    if (!session?.user) {
      setIsOnboardingComplete(null);
      setIsCheckingOnboarding(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("first_name, profile_image, age, study_program, intents, interests")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      if (error || !data) {
        setIsOnboardingComplete(false);
      } else {
        const isComplete = !!(
          data.first_name &&
          data.profile_image &&
          data.age &&
          data.study_program &&
          (data.intents?.length ?? 0) >= 2 &&
          (data.interests?.length ?? 0) >= 2
        );
        setIsOnboardingComplete(isComplete);
      }
    } catch {
      setIsOnboardingComplete(false);
    } finally {
      setIsCheckingOnboarding(false);
      setHasChecked(true);
    }
  }, [session?.user]);

  // Check onboarding status ONCE when auth is ready
  useEffect(() => {
    if (authLoading) return;
    
    if (!session?.user) {
      setIsOnboardingComplete(null);
      setIsCheckingOnboarding(false);
      setHasChecked(false);
      return;
    }

    // Only check once per session
    if (!hasChecked) {
      checkOnboardingStatus();
    }
  }, [authLoading, session?.user, hasChecked, checkOnboardingStatus]);

  // Refresh function for after onboarding completion
  const refreshOnboardingStatus = useCallback(async () => {
    setIsCheckingOnboarding(true);
    await checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return (
    <AppStateContext.Provider value={{ isOnboardingComplete, isCheckingOnboarding, refreshOnboardingStatus }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
