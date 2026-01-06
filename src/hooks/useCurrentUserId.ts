import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCurrentUserId() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["current-user-id", user?.id],
    queryFn: async (): Promise<string | null> => {
      if (!user) return null;

      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      return data?.id ?? null;
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes - this rarely changes
    gcTime: 60 * 60 * 1000,
  });
}
