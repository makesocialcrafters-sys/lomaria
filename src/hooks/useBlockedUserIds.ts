import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBlockedUserIds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["blocked-user-ids", user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user) return [];

      // 1. Get current user's profile ID
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!currentUser) return [];

      // 2. Get all blocks involving this user (as blocker or blocked)
      const { data: blocks } = await supabase
        .from("blocks")
        .select("blocker_id, blocked_id")
        .or(`blocker_id.eq.${currentUser.id},blocked_id.eq.${currentUser.id}`);

      if (!blocks || blocks.length === 0) return [];

      // 3. Extract the "other" user ID from each block
      return blocks.map((b) =>
        b.blocker_id === currentUser.id ? b.blocked_id : b.blocker_id
      );
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000,
  });
}
