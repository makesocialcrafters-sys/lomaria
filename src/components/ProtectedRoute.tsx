import { useEffect, useState, useCallback, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, session, loading } = useAuth();
  const location = useLocation();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const lastCheckedUserId = useRef<string | null>(null);

  const checkProfile = useCallback(async () => {
    // DEBUG: Log auth state
    console.log("[ProtectedRoute] Auth state:", { 
      hasSession: !!session, 
      hasUser: !!user, 
      userId: user?.id,
      loading,
      path: location.pathname 
    });

    if (!user || !session) {
      console.log("[ProtectedRoute] No user/session, skipping profile check");
      setCheckingProfile(false);
      setProfileComplete(null);
      return;
    }

    // Don't re-check if we just checked for this user
    if (lastCheckedUserId.current === user.id && profileComplete !== null) {
      console.log("[ProtectedRoute] Using cached profile check for user:", user.id);
      setCheckingProfile(false);
      return;
    }

    setCheckingProfile(true);
    try {
      console.log("[ProtectedRoute] Checking profile for user:", user.id);
      
      const { data, error } = await supabase
        .from("users")
        .select("first_name, last_name, study_program, intents, interests")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      console.log("[ProtectedRoute] Profile check result:", { data, error });

      if (error) {
        console.error("[ProtectedRoute] Error checking profile:", error);
        setProfileComplete(false);
      } else if (!data) {
        console.log("[ProtectedRoute] No profile found");
        setProfileComplete(false);
      } else {
        const isComplete = !!(
          data.first_name &&
          data.last_name &&
          data.study_program &&
          data.intents?.length >= 3 &&
          data.interests?.length >= 3
        );
        console.log("[ProtectedRoute] Profile complete:", isComplete);
        setProfileComplete(isComplete);
      }
      
      lastCheckedUserId.current = user.id;
    } catch (err) {
      console.error("[ProtectedRoute] Profile check error:", err);
      setProfileComplete(false);
    } finally {
      setCheckingProfile(false);
    }
  }, [user, session, loading, location.pathname, profileComplete]);

  // Check profile when user changes or on mount
  useEffect(() => {
    if (!loading) {
      // Reset cache when user changes
      if (user?.id !== lastCheckedUserId.current) {
        lastCheckedUserId.current = null;
        setProfileComplete(null);
      }
      checkProfile();
    }
  }, [user?.id, loading, checkProfile]);

  // Force re-check when navigating to discover after onboarding
  useEffect(() => {
    if (location.pathname === "/discover" && user && !loading) {
      // Invalidate cache to force fresh check
      lastCheckedUserId.current = null;
      setProfileComplete(null);
      checkProfile();
    }
  }, [location.pathname]);

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

  // CRITICAL: Only redirect to auth if there is NO session
  // Session is the ONLY source of truth for authentication
  if (!session) {
    console.log("[ProtectedRoute] No session, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // At this point, user IS authenticated (session exists)
  
  // Logged in but on onboarding route - allow if profile not complete
  if (location.pathname === "/onboarding") {
    if (profileComplete) {
      console.log("[ProtectedRoute] Profile complete, redirecting from onboarding to /discover");
      return <Navigate to="/discover" replace />;
    }
    // Profile not complete, allow onboarding
    console.log("[ProtectedRoute] Allowing onboarding");
    return <>{children}</>;
  }

  // For all other protected routes, require completed onboarding
  if (requireOnboarding && !profileComplete) {
    console.log("[ProtectedRoute] Profile incomplete, redirecting to /onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  console.log("[ProtectedRoute] Allowing access to:", location.pathname);
  return <>{children}</>;
}
