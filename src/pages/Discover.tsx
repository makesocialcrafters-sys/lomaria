import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDiscoverProfiles, useTutoringSubjects, UserProfile } from "@/hooks/useDiscoverProfiles";
import { UserProfileCard } from "@/components/discover/UserProfileCard";
import { DiscoverFilters } from "@/components/discover/DiscoverFilters";

const PAGE_SIZE = 20;

export default function Discover() {
  const navigate = useNavigate();

  // Filter state persists because component doesn't unmount
  const [studyProgram, setStudyProgram] = useState<string | null>(null);
  const [tutoringSubject, setTutoringSubject] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);

  // React Query for cached data
  const { data: pageProfiles, isLoading, isFetching } = useDiscoverProfiles({
    studyProgram,
    tutoringSubject,
    intent,
    page,
  });
  const { data: tutoringSubjects = [] } = useTutoringSubjects();

  // Accumulate profiles when new page is loaded
  useEffect(() => {
    if (!pageProfiles) return;
    if (page === 0) {
      setAllProfiles(pageProfiles);
    } else if (pageProfiles.length > 0) {
      setAllProfiles(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newProfiles = pageProfiles.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProfiles];
      });
    }
  }, [pageProfiles, page]);

  const hasMore = pageProfiles?.length === PAGE_SIZE;

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleResetFilters = () => {
    setStudyProgram(null);
    setTutoringSubject(null);
    setIntent(null);
    setPage(0);
    setAllProfiles([]);
  };

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => (value: string | null) => {
    setter(value);
    setPage(0);
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  return (
    <div className="px-6 py-8 animate-cinematic-enter">
      <div className="max-w-md mx-auto">
        {/* Title */}
        <h1 className="heading-page mb-3">ENTDECKEN</h1>
        <div className="divider-subtle mb-8" />

        {/* Filters */}
        <div className="mb-6">
          <DiscoverFilters
            studyProgram={studyProgram}
            tutoringSubject={tutoringSubject}
            intent={intent}
            tutoringSubjects={tutoringSubjects}
            onStudyProgramChange={handleFilterChange(setStudyProgram)}
            onTutoringSubjectChange={handleFilterChange(setTutoringSubject)}
            onIntentChange={handleFilterChange(setIntent)}
            onReset={handleResetFilters}
          />
        </div>

        {/* Profile Cards */}
        <div className="space-y-4">
          {allProfiles.map((profile) => (
            <UserProfileCard
              key={profile.id}
              user={profile}
              onClick={() => handleProfileClick(profile.id!)}
            />
          ))}

          {/* Loading state - only show on initial load */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="h-0.5 w-24 bg-muted overflow-hidden rounded-full">
                <div className="h-full bg-primary animate-loader" />
              </div>
            </div>
          )}

          {/* Background fetching indicator */}
          {!isLoading && isFetching && (
            <div className="flex justify-center py-2">
              <div className="h-0.5 w-16 bg-muted overflow-hidden rounded-full">
                <div className="h-full bg-primary/50 animate-loader" />
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && allProfiles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Keine Profile gefunden.
              </p>
            </div>
          )}

          {/* Load more button */}
          {!isLoading && hasMore && allProfiles.length > 0 && (
            <button
              onClick={handleLoadMore}
              disabled={isFetching}
              className="w-full py-3 font-display text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500 disabled:opacity-50"
            >
              Mehr laden
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
