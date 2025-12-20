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

      // 1. Get current user's internal ID
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!currentUser) return [];

      // 2. Get ALL connections for this user (any status)
      const { data: connections } = await supabase
        .from("connections")
        .select("from_user, to_user")
        .or(`from_user.eq.${currentUser.id},to_user.eq.${currentUser.id}`);

      // 3. Collect all connected user IDs
      const connectedUserIds = new Set<string>();
      connectedUserIds.add(currentUser.id); // Exclude self
      connections?.forEach(conn => {
        connectedUserIds.add(conn.from_user);
        connectedUserIds.add(conn.to_user);
      });

      // 4. Query profiles with filters
      let query = supabase
        .from("users")
        .select("id, auth_user_id, first_name, last_name, profile_image, birthyear, study_program, semester, intents, interests, tutoring_subject, last_active_at")
        .neq("auth_user_id", user.id)
        .not("first_name", "is", null)
        .not("study_program", "is", null)
        .order("last_active_at", { ascending: false, nullsFirst: false });

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

      // 5. Filter out connected profiles client-side
      const filteredProfiles = (data || []).filter(
        profile => !connectedUserIds.has(profile.id)
      );

      // 6. Apply pagination client-side
      const startIndex = page * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;

      return filteredProfiles.slice(startIndex, endIndex) as UserProfile[];
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
