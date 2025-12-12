import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Discover() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-loader" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8 animate-page-enter">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-xl font-bold uppercase tracking-[0.2em] text-primary text-center mb-8">
          DISCOVER
        </h1>
        
        <p className="text-muted-foreground text-center mb-8">
          Willkommen, {user?.email}
        </p>

        <div className="flex justify-center">
          <button
            onClick={signOut}
            className="text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
