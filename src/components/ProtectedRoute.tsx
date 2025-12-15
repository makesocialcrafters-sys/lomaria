import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppState } from "@/contexts/AppStateContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { session, loading: authLoading } = useAuth();
  const { isOnboardingComplete, isCheckingOnboarding } = useAppState();
  const location = useLocation();

  // Only show loader on initial cold load (auth loading)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-loader" />
        </div>
      </div>
    );
  }

  // No session - redirect to auth
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // For onboarding route: if complete, go to discover
  if (location.pathname === "/onboarding") {
    // Wait for onboarding check to complete on this specific route
    if (isCheckingOnboarding && isOnboardingComplete === null) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-loader" />
          </div>
        </div>
      );
    }
    
    if (isOnboardingComplete) {
      return <Navigate to="/discover" replace />;
    }
    return <>{children}</>;
  }

  // For routes requiring onboarding: check if complete
  if (requireOnboarding) {
    // Wait for initial check on cold load only
    if (isCheckingOnboarding && isOnboardingComplete === null) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-loader" />
          </div>
        </div>
      );
    }
    
    if (isOnboardingComplete === false) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // Allow access - no more loading states for internal navigation
  return <>{children}</>;
}
