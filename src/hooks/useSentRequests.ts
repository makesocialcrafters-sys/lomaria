import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SentRequest {
  id: string;
  message: string | null;
  created_at: string;
  recipient: {
    id: string;
    first_name: string;
    profile_image: string | null;
    study_program: string | null;
    study_phase: string | null;
  };
}

export function useSentRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sent-requests", user?.id],
    queryFn: async (): Promise<SentRequest[]> => {
      if (!user) return [];

      // Get current user's internal ID
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!currentUser) return [];

      // Get all pending outgoing requests
      const { data: pendingData } = await supabase
        .from("connections")
        .select("id, message, created_at, to_user")
        .eq("from_user", currentUser.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!pendingData || pendingData.length === 0) return [];

      // Get recipient profiles
      const recipientIds = pendingData.map((r) => r.to_user);
      const { data: recipientProfiles } = await supabase
        .from("user_profiles")
        .select("id, first_name, profile_image, study_program, study_phase")
        .in("id", recipientIds);

      return pendingData.map((req) => {
        const recipient = recipientProfiles?.find((p) => p.id === req.to_user);
        return {
          id: req.id,
          message: req.message,
          created_at: req.created_at,
          recipient: {
            id: recipient?.id || req.to_user,
            first_name: recipient?.first_name || "Unbekannt",
            profile_image: recipient?.profile_image || null,
            study_program: recipient?.study_program || null,
            study_phase: recipient?.study_phase || null,
          },
        };
      });
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
