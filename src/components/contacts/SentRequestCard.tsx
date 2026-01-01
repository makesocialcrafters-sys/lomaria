import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SentRequestCardProps {
  recipientId: string;
  recipientName: string;
  recipientImage: string | null;
  studyProgram: string | null;
  studyPhase: string | null;
}

export function SentRequestCard({
  recipientId,
  recipientName,
  recipientImage,
  studyProgram,
  studyPhase,
}: SentRequestCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/discover/profile/${recipientId}`)}
      className="w-full flex items-center gap-4 p-4 bg-card border border-border/30 rounded-md hover:border-primary/50 transition-colors text-left"
    >
      {/* Profile Image */}
      <div className="w-14 h-14 rounded-full bg-skeleton overflow-hidden flex-shrink-0">
        {recipientImage ? (
          <img
            src={recipientImage}
            alt={recipientName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-medium">
            {recipientName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{recipientName}</p>
        {studyProgram && (
          <p className="text-sm text-muted-foreground truncate">
            {studyProgram}
            {studyPhase && ` · ${studyPhase}`}
          </p>
        )}
      </div>

      {/* Status Badge */}
      <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground border-muted-foreground/30">
        <Clock className="w-3 h-3" />
        <span>Ausstehend</span>
      </Badge>
    </button>
  );
}
