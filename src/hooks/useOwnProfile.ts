import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OwnProfileData {
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
  age: number | null;
  gender: string | null;
  study_program: string | null;
  study_phase: string | null;
  focus: string | null;
  intents: string[] | null;
  interests: string[] | null;
  tutoring_subject: string | null;
  tutoring_desc: string | null;
  tutoring_price: number | null;
  bio: string | null;
  intent_details: Record<string, Record<string, string | string[]>> | null;
  email_notifications_enabled: boolean;
}

export function useOwnProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["own-profile", user?.id],
    queryFn: async (): Promise<OwnProfileData | null> => {
      if (!user) return null;

      const { data, error } = await supabase.rpc("get_own_profile");

      if (error) {
        console.error("Error loading profile:", error);
        throw error;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return null;

      return {
        first_name: row.first_name ?? null,
        last_name: row.last_name ?? null,
        profile_image: row.profile_image ?? null,
        age: row.age ?? null,
        gender: row.gender ?? null,
        study_program: row.study_program ?? null,
        study_phase: row.study_phase ?? null,
        focus: row.focus ?? null,
        intents: row.intents ?? null,
        interests: row.interests ?? null,
        tutoring_subject: row.tutoring_subject ?? null,
        tutoring_desc: row.tutoring_desc ?? null,
        tutoring_price: row.tutoring_price ?? null,
        bio: row.bio ?? null,
        intent_details: (row.intent_details as Record<string, Record<string, string | string[]>>) ?? null,
        email_notifications_enabled: row.email_notifications_enabled ?? true,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
