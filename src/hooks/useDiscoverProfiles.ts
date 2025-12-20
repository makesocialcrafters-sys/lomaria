import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  id: string;
  auth_user_id: string;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
  // Support both old and new fields
  age?: number | null;
  birthyear?: number | null;
  study_program: string | null;
  study_phase?: string | null;
  semester?: string | null;
  intents: string[] | null;
  interests: string[] | null;
  tutoring_subject: string | null;
}

interface UseDiscoverProfilesParams {
  studyProgram: string | null;
  tutoringSubject: string | null;
  intent: string | null;
  page: number;
}

const PAGE_SIZE = 20;

export function useDiscoverProfiles({ studyProgram, tutoringSubject, intent, page }: UseDiscoverProfilesParams) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["discover-profiles", user?.id, studyProgram, tutoringSubject, intent, page],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("user_profiles")
        .select("*")
        .neq("auth_user_id", user.id)
        .not("first_name", "is", null)
        .not("study_program", "is", null)
        .order("last_active_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (studyProgram) {
        query = query.eq("study_program", studyProgram);
      }
      if (tutoringSubject) {
        query = query.eq("tutoring_subject", tutoringSubject);
      }
      if (intent) {
        query = query.contains("intents", [intent]);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading profiles:", error);
        throw error;
      }

      return (data || []) as unknown as UserProfile[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useTutoringSubjects() {
  return useQuery({
    queryKey: ["tutoring-subjects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("tutoring_subject")
        .not("tutoring_subject", "is", null);

      if (data) {
        const subjects = [...new Set(data.map((d) => d.tutoring_subject).filter(Boolean))] as string[];
        return subjects.sort();
      }
      return [];
    },
    staleTime: 10 * 60 * 1000,
  });
}
