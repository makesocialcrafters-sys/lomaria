import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserProfileCard } from "@/components/discover/UserProfileCard";
import { DiscoverFilters } from "@/components/discover/DiscoverFilters";
import lomariaLogo from "@/assets/lomaria-logo.png";

interface UserProfile {
  id: string;
  auth_user_id: string;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
  birthyear: number | null;
  study_program: string | null;
  semester: string | null;
  intents: string[] | null;
  interests: string[] | null;
  tutoring_subject: string | null;
}

const PAGE_SIZE = 20;

export default function Discover() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [studyProgram, setStudyProgram] = useState<string | null>(null);
  const [tutoringSubject, setTutoringSubject] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [tutoringSubjects, setTutoringSubjects] = useState<string[]>([]);

  // Load distinct tutoring subjects for filter dropdown
  useEffect(() => {
    async function loadTutoringSubjects() {
      const { data } = await supabase
        .from("user_profiles")
        .select("tutoring_subject")
        .not("tutoring_subject", "is", null);

      if (data) {
        const subjects = [...new Set(data.map((d) => d.tutoring_subject).filter(Boolean))] as string[];
        setTutoringSubjects(subjects.sort());
      }
    }
    loadTutoringSubjects();
  }, []);

  const loadProfiles = useCallback(
    async (pageNum: number, reset = false) => {
      if (!user) return;

      setLoadingProfiles(true);
      try {
        let query = supabase
          .from("user_profiles")
          .select("*")
          .neq("auth_user_id", user.id)
          .not("first_name", "is", null)
          .not("study_program", "is", null)
          .order("last_active_at", { ascending: false })
          .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

        // Apply filters
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
          return;
        }

        const newProfiles = (data || []) as UserProfile[];
        setHasMore(newProfiles.length === PAGE_SIZE);

        if (reset) {
          setProfiles(newProfiles);
        } else {
          setProfiles((prev) => [...prev, ...newProfiles]);
        }
      } finally {
        setLoadingProfiles(false);
      }
    },
    [user, studyProgram, tutoringSubject, intent]
  );

  // Initial load and filter changes
  useEffect(() => {
    if (user) {
      setPage(0);
      loadProfiles(0, true);
    }
  }, [user, studyProgram, tutoringSubject, intent, loadProfiles]);

  const handleLoadMore = () => {
    if (!loadingProfiles && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProfiles(nextPage);
    }
  };

  const handleResetFilters = () => {
    setStudyProgram(null);
    setTutoringSubject(null);
    setIntent(null);
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-loader" />
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="px-6 py-8 animate-page-enter">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={lomariaLogo} alt="Lomaria" className="h-10 w-auto opacity-60" />
          </div>

          {/* Title */}
          <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em] text-primary text-center mb-6">
            ENTDECKEN
          </h1>

          {/* Filters */}
          <div className="mb-6">
            <DiscoverFilters
              studyProgram={studyProgram}
              tutoringSubject={tutoringSubject}
              intent={intent}
              tutoringSubjects={tutoringSubjects}
              onStudyProgramChange={setStudyProgram}
              onTutoringSubjectChange={setTutoringSubject}
              onIntentChange={setIntent}
              onReset={handleResetFilters}
            />
          </div>

          {/* Profile Cards */}
          <div className="space-y-4">
            {profiles.map((profile) => (
              <UserProfileCard
                key={profile.id}
                user={profile}
                onClick={() => handleProfileClick(profile.id!)}
              />
            ))}

            {/* Loading state */}
            {loadingProfiles && (
              <div className="flex justify-center py-4">
                <div className="h-0.5 w-24 bg-muted overflow-hidden rounded-full">
                  <div className="h-full bg-primary animate-loader" />
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loadingProfiles && profiles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Keine Profile gefunden.
                </p>
              </div>
            )}

            {/* Load more button */}
            {!loadingProfiles && hasMore && profiles.length > 0 && (
              <button
                onClick={handleLoadMore}
                className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Mehr laden
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
