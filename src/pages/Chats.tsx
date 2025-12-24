import { useNavigate } from "react-router-dom";
import { useChatsPreview } from "@/hooks/useChatsPreview";
import { GoldLoader } from "@/components/ui/gold-loader";
import { STUDY_PROGRAMS } from "@/lib/onboarding-constants";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

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
    <div className="px-6 py-8 animate-cinematic-enter">
      <div className="max-w-md mx-auto">
        {/* Title */}
        <h1 className="heading-page mb-3">CHATS</h1>
        <div className="divider-subtle mb-8" />

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
                className="w-full bg-card border border-primary/20 rounded-md p-4 flex items-center gap-4 hover:border-primary/40 transition-all duration-500 text-left"
              >
                {/* Profile Image */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-skeleton overflow-hidden">
                    {chat.otherUser.profile_image ? (
                      <img
                        src={chat.otherUser.profile_image}
                        alt={chat.otherUser.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-display">
                        {chat.otherUser.first_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Unread badge */}
                  {chat.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </span>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className={`font-display truncate ${chat.unreadCount > 0 ? "text-foreground font-semibold" : "text-foreground"}`}>
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
                    <p className={`text-sm truncate mt-1 ${chat.unreadCount > 0 ? "text-foreground font-medium" : "text-foreground/70"}`}>
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
