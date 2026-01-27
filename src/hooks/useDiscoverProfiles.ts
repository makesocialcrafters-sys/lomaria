import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBlockedUserIds } from "./useBlockedUserIds";
import { useOwnProfile } from "./useOwnProfile";
import { sortByRelevance, type ScoringContext } from "@/lib/matching-utils";

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
  age?: number | null;
  birthyear?: number | null;
  study_program: string | null;
  study_phase?: string | null;
  semester?: string | null;
  intents: string[] | null;
  interests: string[] | null;
  tutoring_subject: string | null;
  last_active_at?: string | null;
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
  const { data: blockedUserIds = [] } = useBlockedUserIds();
  const { data: ownProfile, isLoading: isOwnProfileLoading } = useOwnProfile();

  // Stabilize intents for query key - only include when loaded
  const ownIntentsKey = ownProfile?.intents?.join(",") ?? "";

  return useQuery({
    queryKey: ["discover-profiles", user?.id, studyProgram, tutoringSubject, intent, page, blockedUserIds, ownIntentsKey],
    queryFn: async () => {
      if (!user) return [];

      // 1. Get current user's internal ID
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!currentUser) return [];

      // 2. Get ALL connections for this user
      const { data: connections } = await supabase
        .from("connections")
        .select("from_user, to_user, status")
        .or(`from_user.eq.${currentUser.id},to_user.eq.${currentUser.id}`) as { data: Array<{ from_user: string; to_user: string; status: string }> | null };

      // 3. Query profiles with filters (use user_profiles view - excludes email, auth_user_id)
      // Note: We no longer order by last_active_at here - sorting happens client-side via intent matching
      let query = supabase
        .from("user_profiles")
        .select("id, first_name, last_name, profile_image, birthyear, age, study_program, study_phase, semester, intents, interests, tutoring_subject, last_active_at")
        .neq("id", currentUser.id)
        .not("first_name", "is", null)
        .not("study_program", "is", null);

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

      // 4. Apply hard exclusions based on connection status
      // Rules:
      // - pending → hide completely
      // - accepted → hide completely
      // - rejected → show (user can send new request)
      // - no connection → show
      const filteredProfiles = (data || [])
        .filter(profile => {
          const conn = connections?.find(c =>
            (c.from_user === currentUser.id && c.to_user === profile.id) ||
            (c.from_user === profile.id && c.to_user === currentUser.id)
          );

          // Hide pending and accepted connections
          if (conn?.status === "pending" || conn?.status === "accepted") {
            return false;
          }

          return true;
        })
        // 5. Filter out blocked users
        .filter(profile => !blockedUserIds.includes(profile.id as string));

      // 6. Build scoring context from current user's profile
      const scoringContext: ScoringContext = {
        currentUserIntents: ownProfile?.intents || [],
        currentUserStudyProgram: ownProfile?.study_program || null,
        currentUserStudyPhase: ownProfile?.study_phase || null,
      };

      // 7. Sort by intent-based relevance score (with activity as hygiene signal)
      const sortedProfiles = sortByRelevance(filteredProfiles, scoringContext);

      // 8. Apply pagination client-side
      const startIndex = page * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;

      return sortedProfiles.slice(startIndex, endIndex) as UserProfile[];
    },
    enabled: !!user && !!ownProfile,
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
