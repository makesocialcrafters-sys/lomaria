import { useNavigate } from "react-router-dom";

interface IncomingRequestCardProps {
  connectionId: string;
  senderName: string;
  senderImage: string | null;
  studyProgram: string | null;
  studyPhase: string | null;
  message: string | null;
}

export function IncomingRequestCard({
  connectionId,
  senderName,
  senderImage,
  studyProgram,
  studyPhase,
  message,
}: IncomingRequestCardProps) {
  const navigate = useNavigate();

  const truncatedMessage = message && message.length > 50 
    ? message.substring(0, 50) + "..." 
    : message;

  return (
    <button
      onClick={() => navigate(`/contacts/request/${connectionId}`)}
      className="w-full flex items-center gap-4 p-4 bg-card border border-border/30 rounded-md hover:border-primary/50 transition-colors text-left"
    >
      <div className="w-14 h-14 rounded-full bg-skeleton overflow-hidden flex-shrink-0">
        {senderImage ? (
          <img src={senderImage} alt={senderName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-medium">
            {senderName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{senderName}</p>
        {studyProgram && (
          <p className="text-sm text-muted-foreground truncate">
            {studyProgram}{studyPhase ? ` · ${studyPhase}` : ""}
          </p>
        )}
        {truncatedMessage && (
          <p className="text-sm text-muted-foreground/70 mt-1 truncate italic">"{truncatedMessage}"</p>
        )}
      </div>
    </button>
  );
}
