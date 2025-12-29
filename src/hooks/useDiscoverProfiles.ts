import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getCooldownInfo, type CooldownInfo } from "@/lib/cooldown-utils";

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
  cooldownInfo?: CooldownInfo;
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

      // 2. Get ALL connections for this user (with status and rejected_at)
      const { data: connections } = await supabase
        .from("connections")
        .select("from_user, to_user, status, rejected_at")
        .or(`from_user.eq.${currentUser.id},to_user.eq.${currentUser.id}`) as { data: Array<{ from_user: string; to_user: string; status: string; rejected_at: string | null }> | null };

      // 3. Query profiles with filters (use user_profiles view - excludes email, auth_user_id)
      let query = supabase
        .from("user_profiles")
        .select("id, first_name, last_name, profile_image, birthyear, age, study_program, semester, intents, interests, tutoring_subject, last_active_at")
        .neq("id", currentUser.id)
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

      // 4. Filter profiles based on connection status and attach cooldown info
      // Rules:
      // - pending → hide
      // - accepted → hide
      // - rejected → show with cooldownInfo
      // - no connection → show
      const profilesWithCooldown = (data || [])
        .filter(profile => {
          const conn = connections?.find(c =>
            (c.from_user === currentUser.id && c.to_user === profile.id) ||
            (c.from_user === profile.id && c.to_user === currentUser.id)
          );

          // Hide pending and accepted connections
          if (conn?.status === "pending" || conn?.status === "accepted") {
            return false;
          }

          // Show rejected and no-connection profiles
          return true;
        })
        .map(profile => {
          const conn = connections?.find(c =>
            (c.from_user === currentUser.id && c.to_user === profile.id) ||
            (c.from_user === profile.id && c.to_user === currentUser.id)
          );

          if (conn?.status === "rejected" && conn.rejected_at) {
            return {
              ...profile,
              cooldownInfo: getCooldownInfo(conn.rejected_at),
            };
          }

          return profile;
        });

      // 5. Apply pagination client-side
      const startIndex = page * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;

      return profilesWithCooldown.slice(startIndex, endIndex) as UserProfile[];
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
