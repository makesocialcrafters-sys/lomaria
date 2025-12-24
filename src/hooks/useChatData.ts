import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
  read_at?: string | null;
}

interface OtherUser {
  id: string;
  first_name: string | null;
  profile_image: string | null;
  study_program: string | null;
}

export interface ChatData {
  messages: Message[];
  otherUser: OtherUser | null;
  currentUserId: string;
  connectionId: string;
}

export function useChatData(connectionId: string | undefined, authUserId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chat", connectionId],
    queryFn: async (): Promise<ChatData | null> => {
      if (!connectionId || !authUserId) return null;

      // Get current user's profile ID
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (!currentUser) return null;

      // Get the connection
      const { data: connection, error: connError } = await supabase
        .from("connections")
        .select("id, from_user, to_user, status")
        .eq("id", connectionId)
        .maybeSingle();

      if (connError || !connection || connection.status !== "accepted") {
        return null;
      }

      // Determine the other user
      const otherUserId = connection.from_user === currentUser.id 
        ? connection.to_user 
        : connection.from_user;

      // Get other user's profile
      const { data: otherUserProfile } = await supabase
        .from("user_profiles")
        .select("id, first_name, profile_image, study_program")
        .eq("id", otherUserId)
        .maybeSingle();

      // Load messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("id, sender_id, text, created_at, read_at")
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: true });

      return {
        messages: messagesData || [],
        otherUser: otherUserProfile,
        currentUserId: currentUser.id,
        connectionId,
      };
    },
    enabled: !!connectionId && !!authUserId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // Add a new message (from realtime or optimistic update)
  const addMessage = (message: Message) => {
    queryClient.setQueryData<ChatData | null>(["chat", connectionId], (old) => {
      if (!old) return old;
      
      // Check for exact ID duplicate
      if (old.messages.some((m) => m.id === message.id)) return old;
      
      // Check for temp message to replace (same text + sender within 5 seconds)
      const tempIndex = old.messages.findIndex(
        (m) => 
          m.id.startsWith("temp-") &&
          m.text === message.text && 
          m.sender_id === message.sender_id
      );
      
      if (tempIndex >= 0) {
        // Replace temp message with real one
        const updated = [...old.messages];
        updated[tempIndex] = message;
        return { ...old, messages: updated };
      }
      
      return {
        ...old,
        messages: [...old.messages, message],
      };
    });
  };

  // Remove a message (for rollback on error)
  const removeMessage = (messageId: string) => {
    queryClient.setQueryData<ChatData | null>(["chat", connectionId], (old) => {
      if (!old) return old;
      return {
        ...old,
        messages: old.messages.filter((m) => m.id !== messageId),
      };
    });
  };

  // Replace a temp message with real one
  const replaceMessage = (tempId: string, realMessage: Message) => {
    queryClient.setQueryData<ChatData | null>(["chat", connectionId], (old) => {
      if (!old) return old;
      return {
        ...old,
        messages: old.messages.map((m) => 
          m.id === tempId ? realMessage : m
        ),
      };
    });
  };

  // Update read_at for messages
  const markMessagesAsRead = (messageIds: string[]) => {
    queryClient.setQueryData<ChatData | null>(["chat", connectionId], (old) => {
      if (!old) return old;
      return {
        ...old,
        messages: old.messages.map((m) =>
          messageIds.includes(m.id) ? { ...m, read_at: new Date().toISOString() } : m
        ),
      };
    });
  };

  return {
    ...query,
    addMessage,
    removeMessage,
    replaceMessage,
    markMessagesAsRead,
  };
}
