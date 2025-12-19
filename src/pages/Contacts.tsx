import { useIncomingRequests } from "@/hooks/useIncomingRequests";
import { GoldLoader } from "@/components/ui/gold-loader";
import { IncomingRequestCard } from "@/components/contacts/IncomingRequestCard";
import { STUDY_PROGRAMS, STUDY_PHASES } from "@/lib/onboarding-constants";

export default function Contacts() {
  const { data: incomingRequests = [], isLoading } = useIncomingRequests();

  const getStudyProgramLabel = (value: string | null) => {
    if (!value) return null;
    return STUDY_PROGRAMS.find((p) => p.value === value)?.label || value;
  };

  const getStudyPhaseLabel = (value: string | null) => {
    if (!value) return null;
    return STUDY_PHASES.find((p) => p.value === value)?.label || value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <GoldLoader />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 animate-cinematic-enter">
      <div className="max-w-md mx-auto">
        {/* Title */}
        <h1 className="heading-page mb-3">KONTAKTE</h1>
        <div className="divider-subtle mb-8" />

        <section className="mb-8">
          <h2 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4">
            Anfragen ({incomingRequests.length})
          </h2>
          {incomingRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Keine offenen Anfragen
            </p>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((req) => (
                <IncomingRequestCard
                  key={req.id}
                  connectionId={req.id}
                  senderName={req.sender.first_name}
                  senderImage={req.sender.profile_image}
                  studyProgram={getStudyProgramLabel(req.sender.study_program)}
                  studyPhase={getStudyPhaseLabel(req.sender.study_phase)}
                  message={req.message}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
