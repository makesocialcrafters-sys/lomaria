import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDiscoverProfiles, useTutoringSubjects } from "@/hooks/useDiscoverProfiles";
import { UserProfileCard } from "@/components/discover/UserProfileCard";
import { DiscoverFilters } from "@/components/discover/DiscoverFilters";
import lomariaLogo from "@/assets/lomaria-logo.png";

const PAGE_SIZE = 20;

export default function Discover() {
  const navigate = useNavigate();

  // Filter state persists because component doesn't unmount
  const [studyProgram, setStudyProgram] = useState<string | null>(null);
  const [tutoringSubject, setTutoringSubject] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // React Query for cached data
  const { data: profiles = [], isLoading, isFetching } = useDiscoverProfiles({
    studyProgram,
    tutoringSubject,
    intent,
    page,
  });
  const { data: tutoringSubjects = [] } = useTutoringSubjects();

  const hasMore = profiles.length === (page + 1) * PAGE_SIZE;

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
            onStudyProgramChange={handleFilterChange(setStudyProgram)}
            onTutoringSubjectChange={handleFilterChange(setTutoringSubject)}
            onIntentChange={handleFilterChange(setIntent)}
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
          {!isLoading && profiles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Keine Profile gefunden.
              </p>
            </div>
          )}

          {/* Load more button */}
          {!isLoading && hasMore && profiles.length > 0 && (
            <button
              onClick={handleLoadMore}
              disabled={isFetching}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              Mehr laden
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
