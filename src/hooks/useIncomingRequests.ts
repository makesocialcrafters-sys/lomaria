import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface IncomingRequest {
  id: string;
  message: string | null;
  sender: {
    id: string;
    first_name: string;
    profile_image: string | null;
    study_program: string | null;
    study_phase: string | null;
    is_founder: boolean;
  };
}

export function useIncomingRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["incoming-requests", user?.id],
    queryFn: async (): Promise<IncomingRequest[]> => {
      if (!user) return [];

      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!currentUser) return [];

      const { data: pendingData } = await supabase
        .from("connections")
        .select("id, message, from_user")
        .eq("to_user", currentUser.id)
        .eq("status", "pending");

      if (!pendingData || pendingData.length === 0) return [];

      const senderIds = pendingData.map((r) => r.from_user);
      const { data: senderProfiles } = await supabase
        .from("user_profiles")
        .select("id, first_name, profile_image, study_program, study_phase")
        .in("id", senderIds);

      return pendingData.map((req) => {
        const sender = senderProfiles?.find((p) => p.id === req.from_user);
        return {
          id: req.id,
          message: req.message,
          sender: {
            id: sender?.id || "",
            first_name: sender?.first_name || "Unbekannt",
            profile_image: sender?.profile_image || null,
            study_program: sender?.study_program || null,
            study_phase: sender?.study_phase || null,
          },
        };
      });
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
