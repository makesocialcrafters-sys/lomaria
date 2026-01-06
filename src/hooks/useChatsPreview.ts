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

      // Get current user's profile ID
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!currentUser) return [];

      // Load accepted connections
      const { data: acceptedData } = await supabase
        .from("connections")
        .select("id, from_user, to_user")
        .eq("status", "accepted")
        .or(`from_user.eq.${currentUser.id},to_user.eq.${currentUser.id}`);

      if (!acceptedData || acceptedData.length === 0) return [];

      // Get other user IDs, filter out blocked users
      const otherUserIds = acceptedData
        .map((c) => c.from_user === currentUser.id ? c.to_user : c.from_user)
        .filter((id) => !blockedUserIds.includes(id));

      if (otherUserIds.length === 0) return [];

      // Filter connections to only include non-blocked users
      const filteredConnections = acceptedData.filter((c) => {
        const otherId = c.from_user === currentUser.id ? c.to_user : c.from_user;
        return !blockedUserIds.includes(otherId);
      });

      // Get other user profiles
      const { data: otherProfiles } = await supabase
        .from("user_profiles")
        .select("id, first_name, profile_image, study_program")
        .in("id", otherUserIds);

      // Get all messages for connections (for last message and unread count)
      const connectionIds = filteredConnections.map((c) => c.id);
      const { data: messages } = await supabase
        .from("messages")
        .select("connection_id, sender_id, text, created_at, read_at")
        .in("connection_id", connectionIds)
        .order("created_at", { ascending: false });

      // Build chat previews
      const chatPreviews: ChatPreview[] = filteredConnections.map((conn) => {
        const otherId = conn.from_user === currentUser.id ? conn.to_user : conn.from_user;
        const other = otherProfiles?.find((p) => p.id === otherId);
        
        // Get messages for this connection
        const connMessages = messages?.filter((m) => m.connection_id === conn.id) || [];
        const lastMsg = connMessages[0]; // Already sorted desc
        
        // Count unread messages from other user (not from current user, no read_at)
        const unreadCount = connMessages.filter(
          (m) => m.sender_id !== currentUser.id && !m.read_at
        ).length;

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
          unreadCount,
        };
      });

      // Sort by last message timestamp
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
