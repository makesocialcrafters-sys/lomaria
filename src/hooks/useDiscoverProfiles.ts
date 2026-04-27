import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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
  study_program: string | null;
  study_phase?: string | null;
  semester?: string | null;
  intents: string[] | null;
  interests: string[] | null;
  tutoring_subject: string | null;
  last_active_at?: string | null;
  is_founder?: boolean;
  is_cofounder?: boolean;
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

  const ownIntentsKey = ownProfile?.intents?.join(",") ?? "";

  const query = useQuery({
    queryKey: ["discover-profiles", user?.id, studyProgram, tutoringSubject, intent, blockedUserIds, ownIntentsKey],
    queryFn: async () => {
      if (!user) return [];

      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!currentUser) return [];

      const { data: connections } = await supabase
        .from("connections")
        .select("from_user, to_user, status")
        .or(`from_user.eq.${currentUser.id},to_user.eq.${currentUser.id}`) as { data: Array<{ from_user: string; to_user: string; status: string }> | null };

      let q = supabase
        .from("user_profiles")
        .select("id, first_name, last_name, profile_image, age, study_program, study_phase, semester, intents, interests, tutoring_subject, last_active_at, is_founder, is_cofounder")
        .neq("id", currentUser.id)
        .not("first_name", "is", null)
        .not("study_program", "is", null)
        .not("intents", "is", null);

      if (studyProgram) q = q.eq("study_program", studyProgram);
      if (tutoringSubject) q = q.ilike("tutoring_subject", `%${tutoringSubject}%`);
      if (intent) q = q.contains("intents", [intent]);

      const { data, error } = await q;

      if (error) {
        console.error("Error loading profiles:", error);
        throw error;
      }

      const filteredProfiles = (data || [])
        .filter(profile => (profile.intents?.length ?? 0) >= 1)
        .filter(profile => {
          const conn = connections?.find(c =>
            (c.from_user === currentUser.id && c.to_user === profile.id) ||
            (c.from_user === profile.id && c.to_user === currentUser.id)
          );
          if (conn?.status === "pending" || conn?.status === "accepted") return false;
          return true;
        })
        .filter(profile => !blockedUserIds.includes(profile.id as string));

      return filteredProfiles as UserProfile[];
    },
    enabled: !!user && !!ownProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // useMemo: only re-sort when raw data or scoring context changes
  const sortedAndPaginated = useMemo(() => {
    if (!query.data) return [];

    const scoringContext: ScoringContext = {
      currentUserIntents: ownProfile?.intents || [],
      currentUserStudyProgram: ownProfile?.study_program || null,
      currentUserStudyPhase: ownProfile?.study_phase || null,
    };

    const sorted = sortByRelevance(query.data, scoringContext);
    // Stable secondary sort: profiles without a profile image are pushed to the bottom
    const withImageFirst = [
      ...sorted.filter((p) => !!p.profile_image),
      ...sorted.filter((p) => !p.profile_image),
    ];
    const startIndex = page * PAGE_SIZE;
    return withImageFirst.slice(startIndex, startIndex + PAGE_SIZE);
  }, [query.data, ownProfile?.intents, ownProfile?.study_program, ownProfile?.study_phase, page]);

  return {
    ...query,
    data: sortedAndPaginated,
  };
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
