import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AcceptedConnection {
  id: string;
  otherUser: {
    id: string;
    first_name: string;
    profile_image: string | null;
    study_program: string | null;
    study_phase: string | null;
  };
}

export function useAcceptedConnections() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["accepted-connections", user?.id],
    queryFn: async (): Promise<AcceptedConnection[]> => {
      if (!user) return [];

      // Get current user's internal ID
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!currentUser) return [];

      // Get all accepted connections
      const { data: connectionsData } = await supabase
        .from("connections")
        .select("id, from_user, to_user")
        .eq("status", "accepted")
        .or(`from_user.eq.${currentUser.id},to_user.eq.${currentUser.id}`)
        .order("created_at", { ascending: false });

      if (!connectionsData || connectionsData.length === 0) return [];

      // Get the "other" user IDs
      const otherUserIds = connectionsData.map((conn) =>
        conn.from_user === currentUser.id ? conn.to_user : conn.from_user
      );

      // Get user profiles
      const { data: userProfiles } = await supabase
        .from("user_profiles")
        .select("id, first_name, profile_image, study_program, study_phase")
        .in("id", otherUserIds);

      return connectionsData.map((conn) => {
        const otherUserId = conn.from_user === currentUser.id ? conn.to_user : conn.from_user;
        const otherUser = userProfiles?.find((p) => p.id === otherUserId);
        return {
          id: conn.id,
          otherUser: {
            id: otherUserId,
            first_name: otherUser?.first_name || "Unbekannt",
            profile_image: otherUser?.profile_image || null,
            study_program: otherUser?.study_program || null,
            study_phase: otherUser?.study_phase || null,
          },
        };
      });
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
