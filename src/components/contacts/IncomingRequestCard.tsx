import { useNavigate } from "react-router-dom";
import { SignedAvatar } from "@/components/ui/SignedAvatar";

interface IncomingRequestCardProps {
  connectionId: string;
  senderId?: string;
  senderName: string;
  senderImage: string | null;
  studyProgram: string | null;
  studyPhase: string | null;
  message: string | null;
}

export function IncomingRequestCard({
  connectionId,
  senderId,
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
      className="w-full flex items-center gap-4 p-4 bg-card border border-primary/20 rounded-md hover:border-primary/40 transition-all duration-500 ease-out text-left"
    >
      <SignedAvatar
        storagePath={senderImage}
        name={senderName}
        className="w-14 h-14 flex-shrink-0"
        fallbackClassName="text-lg font-medium"
      />

      <div className="flex-1 min-w-0">
        <p className="font-display text-foreground truncate">{senderName}</p>
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
