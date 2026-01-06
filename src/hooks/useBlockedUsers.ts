import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BlockedUser {
  blockId: string;
  userId: string;
  firstName: string;
  profileImage: string | null;
  studyProgram: string | null;
  studyPhase: string | null;
}

export function useBlockedUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["blocked-users", user?.id],
    queryFn: async (): Promise<BlockedUser[]> => {
      // Get current user's profile ID
      const { data: currentUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user!.id)
        .single();

      if (userError || !currentUser) {
        return [];
      }

      // Get blocks with joined user data
      const { data: blocks, error: blocksError } = await supabase
        .from("blocks")
        .select(`
          id,
          blocked_id
        `)
        .eq("blocker_id", currentUser.id);

      if (blocksError || !blocks || blocks.length === 0) {
        return [];
      }

      // Fetch user profiles for blocked users
      const blockedIds = blocks.map(b => b.blocked_id);
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, first_name, profile_image, study_program, study_phase")
        .in("id", blockedIds);

      if (usersError || !users) {
        return [];
      }

      // Map blocks to BlockedUser objects
      return blocks.map(block => {
        const userData = users.find(u => u.id === block.blocked_id);
        return {
          blockId: block.id,
          userId: block.blocked_id,
          firstName: userData?.first_name || "Unbekannt",
          profileImage: userData?.profile_image || null,
          studyProgram: userData?.study_program || null,
          studyPhase: userData?.study_phase || null,
        };
      });
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
