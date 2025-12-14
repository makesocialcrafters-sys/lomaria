import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("first_name, last_name, study_program, intents, interests")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking profile:", error);
          setProfileComplete(false);
        } else if (!data) {
          // No profile exists yet
          setProfileComplete(false);
        } else {
          // Check if essential onboarding fields are filled
          const isComplete = !!(
            data.first_name &&
            data.last_name &&
            data.study_program &&
            data.intents?.length >= 3 &&
            data.interests?.length >= 3
          );
          setProfileComplete(isComplete);
        }
      } catch (err) {
        console.error("Profile check error:", err);
        setProfileComplete(false);
      } finally {
        setCheckingProfile(false);
      }
    }

    checkProfile();
  }, [user]);

  // Show loading state
  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-loader" />
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Logged in but on onboarding route - allow if profile not complete
  if (location.pathname === "/onboarding") {
    if (profileComplete) {
      // Profile already complete, go to discover
      return <Navigate to="/discover" replace />;
    }
    // Profile not complete, allow onboarding
    return <>{children}</>;
  }

  // For all other protected routes, require completed onboarding
  if (requireOnboarding && !profileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
