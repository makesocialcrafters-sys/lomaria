import { useIncomingRequests } from "@/hooks/useIncomingRequests";
import { useSentRequests } from "@/hooks/useSentRequests";
import { useAcceptedConnections } from "@/hooks/useAcceptedConnections";
import { GoldLoader } from "@/components/ui/gold-loader";
import { IncomingRequestCard } from "@/components/contacts/IncomingRequestCard";
import { SentRequestCard } from "@/components/contacts/SentRequestCard";
import { ConnectionCard } from "@/components/contacts/ConnectionCard";
import { STUDY_PROGRAMS, STUDY_PHASES } from "@/lib/onboarding-constants";

export default function Contacts() {
  const { data: incomingRequests = [], isLoading: loadingIncoming } = useIncomingRequests();
  const { data: sentRequests = [], isLoading: loadingSent } = useSentRequests();
  const { data: connections = [], isLoading: loadingConnections } = useAcceptedConnections();

  const isLoading = loadingIncoming || loadingSent || loadingConnections;

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

        {/* Incoming Requests Section */}
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
                  senderId={req.sender.id}
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

        {/* Sent Requests Section */}
        <section className="mb-8">
          <h2 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4">
            Gesendet ({sentRequests.length})
          </h2>
          {sentRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Keine gesendeten Anfragen
            </p>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((req) => (
                <SentRequestCard
                  key={req.id}
                  recipientId={req.recipient.id}
                  recipientName={req.recipient.first_name}
                  recipientImage={req.recipient.profile_image}
                  studyProgram={getStudyProgramLabel(req.recipient.study_program)}
                  studyPhase={getStudyPhaseLabel(req.recipient.study_phase)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Connections Section */}
        <section className="mb-8">
          <h2 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4">
            Verbindungen ({connections.length})
          </h2>
          {connections.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Noch keine Verbindungen
            </p>
          ) : (
            <div className="space-y-3">
              {connections.map((conn) => (
                <ConnectionCard
                  key={conn.id}
                  connectionId={conn.id}
                  userName={conn.otherUser.first_name}
                  userImage={conn.otherUser.profile_image}
                  studyProgram={getStudyProgramLabel(conn.otherUser.study_program)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
