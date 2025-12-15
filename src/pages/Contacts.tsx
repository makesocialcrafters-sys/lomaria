import { useIncomingRequests } from "@/hooks/useIncomingRequests";
import { GoldLoader } from "@/components/ui/gold-loader";
import { IncomingRequestCard } from "@/components/contacts/IncomingRequestCard";
import { STUDY_PROGRAMS } from "@/lib/onboarding-constants";
import lomariaLogo from "@/assets/lomaria-logo.png";

export default function Contacts() {
  const { data: incomingRequests = [], isLoading } = useIncomingRequests();

  const getStudyProgramLabel = (value: string | null) => {
    if (!value) return null;
    return STUDY_PROGRAMS.find((p) => p.value === value)?.label || value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <GoldLoader />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 animate-page-enter">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={lomariaLogo} alt="Lomaria" className="h-10 w-auto opacity-60" />
        </div>

        {/* Title */}
        <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em] text-primary text-center mb-8">
          KONTAKTE
        </h1>

        {/* Incoming Requests Section */}
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
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
                  semester={req.sender.semester}
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
