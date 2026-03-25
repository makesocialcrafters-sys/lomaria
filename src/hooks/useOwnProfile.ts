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

      const { data, error } = await supabase
        .from("users")
        .select("id, first_name, last_name, profile_image, age, gender, study_program, study_phase, focus, intents, interests, tutoring_subject, tutoring_desc, tutoring_price, bio, intent_details, email_notifications_enabled")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error);
        throw error;
      }

      return {
        ...data,
        intent_details: (data.intent_details as Record<string, Record<string, string | string[]>>) ?? null,
        email_notifications_enabled: data.email_notifications_enabled ?? true,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
