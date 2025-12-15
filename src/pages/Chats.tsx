import { useNavigate } from "react-router-dom";
import { useChatsPreview } from "@/hooks/useChatsPreview";
import { GoldLoader } from "@/components/ui/gold-loader";
import { STUDY_PROGRAMS } from "@/lib/onboarding-constants";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import lomariaLogo from "@/assets/lomaria-logo.png";

export default function Chats() {
  const navigate = useNavigate();
  const { data: chats = [], isLoading } = useChatsPreview();

  const getStudyProgramLabel = (value: string | null) => {
    if (!value) return null;
    return STUDY_PROGRAMS.find((p) => p.value === value)?.label || value;
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: de });
  };

  const truncateMessage = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
          CHATS
        </h1>

        {/* Chats List */}
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Deine Unterhaltungen erscheinen hier.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <button
                key={chat.connectionId}
                onClick={() => navigate(`/chats/${chat.connectionId}`)}
                className="w-full bg-card border border-border/30 rounded-md p-4 flex items-center gap-4 hover:bg-card/80 transition-colors text-left"
              >
                {/* Profile Image */}
                <div className="w-12 h-12 rounded-full bg-skeleton overflow-hidden flex-shrink-0">
                  {chat.otherUser.profile_image ? (
                    <img
                      src={chat.otherUser.profile_image}
                      alt={chat.otherUser.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-medium">
                      {chat.otherUser.first_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-medium text-foreground truncate">
                      {chat.otherUser.first_name}
                    </h3>
                    {chat.lastMessage && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(chat.lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  {getStudyProgramLabel(chat.otherUser.study_program) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {getStudyProgramLabel(chat.otherUser.study_program)}
                    </p>
                  )}
                  {chat.lastMessage ? (
                    <p className="text-sm text-foreground/70 truncate mt-1">
                      {truncateMessage(chat.lastMessage.text)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic mt-1">
                      Noch keine Nachrichten
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
