import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBlockedUserIds } from "./useBlockedUserIds";

export interface ChatPreview {
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
  lastMessageFromMe: boolean;
  unreadCount: number;
}

export function useChatsPreview() {
  const { user } = useAuth();
  const { data: blockedUserIds = [] } = useBlockedUserIds();

  return useQuery({
    queryKey: ["chats-preview", user?.id, blockedUserIds],
    queryFn: async (): Promise<ChatPreview[]> => {
      if (!user) return [];

      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!currentUser) return [];

      const { data: acceptedData } = await supabase
        .from("connections")
        .select("id, from_user, to_user")
        .eq("status", "accepted")
        .or(`from_user.eq.${currentUser.id},to_user.eq.${currentUser.id}`);

      if (!acceptedData || acceptedData.length === 0) return [];

      const filteredConnections = acceptedData.filter((c) => {
        const otherId = c.from_user === currentUser.id ? c.to_user : c.from_user;
        return !blockedUserIds.includes(otherId);
      });

      if (filteredConnections.length === 0) return [];

      const otherUserIds = filteredConnections.map((c) =>
        c.from_user === currentUser.id ? c.to_user : c.from_user
      );
      const connectionIds = filteredConnections.map((c) => c.id);

      // Fetch profiles, last messages, and unread counts in parallel
      const [profilesResult, messagesResult, unreadResult] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("id, first_name, profile_image, study_program")
          .in("id", otherUserIds),
        // Get recent messages — one per connection via client-side dedup
        supabase
          .from("messages")
          .select("connection_id, sender_id, text, created_at")
          .in("connection_id", connectionIds)
          .order("created_at", { ascending: false }),
        // Get only unread messages (for count)
        supabase
          .from("messages")
          .select("connection_id, sender_id", { count: "exact" })
          .in("connection_id", connectionIds)
          .neq("sender_id", currentUser.id)
          .is("read_at", null),
      ]);

      const otherProfiles = profilesResult.data;
      const allMessages = messagesResult.data || [];
      const unreadMessages = unreadResult.data || [];

      // Deduplicate: keep only the first (newest) message per connection
      const lastMessageMap = new Map<string, typeof allMessages[0]>();
      for (const msg of allMessages) {
        if (!lastMessageMap.has(msg.connection_id)) {
          lastMessageMap.set(msg.connection_id, msg);
        }
      }

      // Count unread per connection
      const unreadCountMap = new Map<string, number>();
      for (const msg of unreadMessages) {
        unreadCountMap.set(msg.connection_id, (unreadCountMap.get(msg.connection_id) || 0) + 1);
      }

      const chatPreviews: ChatPreview[] = filteredConnections.map((conn) => {
        const otherId = conn.from_user === currentUser.id ? conn.to_user : conn.from_user;
        const other = otherProfiles?.find((p) => p.id === otherId);
        const lastMsg = lastMessageMap.get(conn.id);

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
          lastMessageFromMe: !!lastMsg && lastMsg.sender_id === currentUser.id,
          unreadCount: unreadCountMap.get(conn.id) || 0,
        };
      });

      chatPreviews.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
      });

      return chatPreviews;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
