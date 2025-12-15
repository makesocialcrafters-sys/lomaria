import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const checkedRef = useRef(false);

  useEffect(() => {
    async function checkProfile() {
      // Wait for auth to finish loading
      if (loading) return;
      
      // No session means no need to check profile
      if (!session?.user) {
        setCheckingProfile(false);
        setProfileComplete(null);
        return;
      }

      // Only check once per session
      if (checkedRef.current && profileComplete !== null) {
        setCheckingProfile(false);
        return;
      }

      setCheckingProfile(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("first_name, last_name, study_program, intents, interests")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (error || !data) {
          setProfileComplete(false);
        } else {
          const isComplete = !!(
            data.first_name &&
            data.last_name &&
            data.study_program &&
            data.intents?.length >= 3 &&
            data.interests?.length >= 3
          );
          setProfileComplete(isComplete);
        }
        checkedRef.current = true;
      } catch {
        setProfileComplete(false);
      } finally {
        setCheckingProfile(false);
      }
    }

    checkProfile();
  }, [loading, session?.user?.id]);

  // Force re-check when coming from onboarding to discover
  useEffect(() => {
    if (location.pathname === "/discover" && session?.user && !loading) {
      checkedRef.current = false;
      setProfileComplete(null);
      setCheckingProfile(true);
    }
  }, [location.pathname, session?.user, loading]);

  // Show loading while auth or profile check is in progress
  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-loader" />
        </div>
      </div>
    );
  }

  // CRITICAL: Only redirect to auth if there is NO session
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated - handle onboarding route
  if (location.pathname === "/onboarding") {
    if (profileComplete) {
      return <Navigate to="/discover" replace />;
    }
    return <>{children}</>;
  }

  // For routes that require onboarding, check profile completion
  if (requireOnboarding && profileComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  // Allow access
  return <>{children}</>;
}
