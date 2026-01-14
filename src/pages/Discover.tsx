import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Info } from "lucide-react";
import { useDiscoverProfiles, useTutoringSubjects, UserProfile } from "@/hooks/useDiscoverProfiles";
import { UserProfileCard } from "@/components/discover/UserProfileCard";
import { DiscoverFilters } from "@/components/discover/DiscoverFilters";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PAGE_SIZE = 20;

export default function Discover() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter aus URL lesen (Source of Truth)
  const studyProgram = searchParams.get("study");
  const tutoringSubject = searchParams.get("tutoring");
  const intent = searchParams.get("intent");

  // Nur page und allProfiles bleiben als lokaler State
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

  // Reset page and profiles when filters change
  useEffect(() => {
    setPage(0);
    setAllProfiles([]);
  }, [studyProgram, tutoringSubject, intent]);

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

  // Generische Filter-Update-Funktion
  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleStudyProgramChange = (value: string | null) => updateFilter("study", value);
  const handleTutoringSubjectChange = (value: string | null) => updateFilter("tutoring", value);
  const handleIntentChange = (value: string | null) => updateFilter("intent", value);

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/discover/profile/${profileId}`);
  };

  return (
    <div className="px-6 py-8 animate-cinematic-enter">
      <div className="max-w-md mx-auto">
        {/* Title with info tooltip */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <h1 className="heading-page">ENTDECKEN</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="text-primary/60 hover:text-primary transition-opacity duration-500"
                aria-label="Sortierung erklären"
              >
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-center">
              Profile werden primär nach gemeinsamen Intents sortiert, mit leichter Berücksichtigung von Studienkontext und Aktivität.
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="divider-subtle mb-8" />

        {/* Filters */}
        <div className="mb-6">
          <DiscoverFilters
            studyProgram={studyProgram}
            tutoringSubject={tutoringSubject}
            intent={intent}
            tutoringSubjects={tutoringSubjects}
            onStudyProgramChange={handleStudyProgramChange}
            onTutoringSubjectChange={handleTutoringSubjectChange}
            onIntentChange={handleIntentChange}
            onClearStudyProgram={() => handleStudyProgramChange(null)}
            onClearTutoringSubject={() => handleTutoringSubjectChange(null)}
            onClearIntent={() => handleIntentChange(null)}
            onReset={handleResetFilters}
          />
        </div>

        {/* Profile Cards */}
        <div className="space-y-6">
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
