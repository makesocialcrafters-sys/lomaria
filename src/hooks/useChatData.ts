import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

interface OtherUser {
  id: string;
  first_name: string | null;
  profile_image: string | null;
  study_program: string | null;
}

interface ChatData {
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
        .select("*")
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
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  const addMessage = (message: Message) => {
    queryClient.setQueryData<ChatData | null>(["chat", connectionId], (old) => {
      if (!old) return old;
      // Avoid duplicates
      if (old.messages.some((m) => m.id === message.id)) return old;
      return {
        ...old,
        messages: [...old.messages, message],
      };
    });
  };

  return {
    ...query,
    addMessage,
  };
}
