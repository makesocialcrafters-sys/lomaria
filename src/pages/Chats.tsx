import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GoldLoader } from "@/components/ui/gold-loader";
import { STUDY_PROGRAMS } from "@/lib/onboarding-constants";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import lomariaLogo from "@/assets/lomaria-logo.png";

interface ChatPreview {
  connectionId: string;
  otherUser: {
    id: string;
    first_name: string;
    profile_image: string | null;
    study_program: string | null;
  };
  lastMessage: {
    text: string;
    created_at: string;
  } | null;
}

export default function Chats() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatPreview[]>([]);

  useEffect(() => {
    async function loadChats() {
      if (!user) return;

      try {
        // Get current user's profile ID
        const { data: currentUser } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Load accepted connections
        const { data: acceptedData } = await supabase
          .from("connections")
          .select("id, from_user, to_user")
          .eq("status", "accepted")
          .or(`from_user.eq.${currentUser.id},to_user.eq.${currentUser.id}`);

        if (!acceptedData || acceptedData.length === 0) {
          setLoading(false);
          return;
        }

        // Get other user IDs
        const otherUserIds = acceptedData.map((c) =>
          c.from_user === currentUser.id ? c.to_user : c.from_user
        );

        // Get other user profiles
        const { data: otherProfiles } = await supabase
          .from("user_profiles")
          .select("id, first_name, profile_image, study_program")
          .in("id", otherUserIds);

        // Get last message for each connection
        const connectionIds = acceptedData.map((c) => c.id);
        const { data: messages } = await supabase
          .from("messages")
          .select("connection_id, text, created_at")
          .in("connection_id", connectionIds)
          .order("created_at", { ascending: false });

        // Build chat previews
        const chatPreviews: ChatPreview[] = acceptedData.map((conn) => {
          const otherId = conn.from_user === currentUser.id ? conn.to_user : conn.from_user;
          const other = otherProfiles?.find((p) => p.id === otherId);
          
          // Find the most recent message for this connection
          const lastMsg = messages?.find((m) => m.connection_id === conn.id);

          return {
            connectionId: conn.id,
            otherUser: {
              id: otherId,
              first_name: other?.first_name || "Unbekannt",
              profile_image: other?.profile_image || null,
              study_program: other?.study_program || null,
            },
            lastMessage: lastMsg
              ? { text: lastMsg.text, created_at: lastMsg.created_at }
              : null,
          };
        });

        // Sort by last message timestamp (most recent first)
        chatPreviews.sort((a, b) => {
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
        });

        setChats(chatPreviews);
      } catch (err) {
        console.error("Error loading chats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, [user]);

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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <GoldLoader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
    </MainLayout>
  );
}
