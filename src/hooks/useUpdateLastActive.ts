import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useUpdateLastActive() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updateLastActive = async () => {
      try {
        await supabase
          .from("users")
          .update({ last_active_at: new Date().toISOString() })
          .eq("auth_user_id", user.id);
      } catch (error) {
        console.error("Failed to update last_active_at:", error);
      }
    };

    updateLastActive();
  }, [user]);
}
