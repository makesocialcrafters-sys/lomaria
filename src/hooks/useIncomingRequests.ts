import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface IncomingRequest {
  id: string;
  message: string | null;
  sender: {
    first_name: string;
    profile_image: string | null;
    study_program: string | null;
    semester: string | null;
  };
}

export function useIncomingRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["incoming-requests", user?.id],
    queryFn: async (): Promise<IncomingRequest[]> => {
      if (!user) return [];

      // Get current user's profile ID
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!currentUser) return [];

      // Load incoming pending requests
      const { data: pendingData } = await supabase
        .from("connections")
        .select("id, message, from_user")
        .eq("to_user", currentUser.id)
        .eq("status", "pending");

      if (!pendingData || pendingData.length === 0) return [];

      // Get sender profiles
      const senderIds = pendingData.map((r) => r.from_user);
      const { data: senderProfiles } = await supabase
        .from("user_profiles")
        .select("id, first_name, profile_image, study_program, semester")
        .in("id", senderIds);

      return pendingData.map((req) => {
        const sender = senderProfiles?.find((p) => p.id === req.from_user);
        return {
          id: req.id,
          message: req.message,
          sender: {
            first_name: sender?.first_name || "Unbekannt",
            profile_image: sender?.profile_image || null,
            study_program: sender?.study_program || null,
            semester: sender?.semester || null,
          },
        };
      });
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
