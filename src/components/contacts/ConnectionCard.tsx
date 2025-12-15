import { useNavigate } from "react-router-dom";

interface ConnectionCardProps {
  connectionId: string;
  userName: string;
  userImage: string | null;
  studyProgram: string | null;
}

export function ConnectionCard({
  connectionId,
  userName,
  userImage,
  studyProgram,
}: ConnectionCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/chats/${connectionId}`)}
      className="w-full flex items-center gap-4 p-4 bg-card border border-border/30 rounded-md hover:border-primary/50 transition-colors text-left"
    >
      {/* Profile Image */}
      <div className="w-14 h-14 rounded-full bg-skeleton overflow-hidden flex-shrink-0">
        {userImage ? (
          <img
            src={userImage}
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-medium">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{userName}</p>
        {studyProgram && (
          <p className="text-sm text-muted-foreground truncate">{studyProgram}</p>
        )}
      </div>
    </button>
  );
}
