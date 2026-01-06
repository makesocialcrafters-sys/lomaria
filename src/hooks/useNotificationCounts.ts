import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIncomingRequests } from "./useIncomingRequests";
import { useChatsPreview } from "./useChatsPreview";

export function useNotificationCounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: incomingRequests } = useIncomingRequests();
  const { data: chats } = useChatsPreview();

  // Realtime Subscriptions mit User-spezifischen Filtern
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notification-updates')
      // Messages: Invalidate bei neuen Nachrichten (nur wenn wir nicht der Sender sind)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        },
        (payload) => {
          if (payload.new.sender_id !== user.id) {
            queryClient.invalidateQueries({ queryKey: ["chats-preview", user.id] });
          }
        }
      )
      // Connections: Nur Events für eingehende Anfragen (to_user = currentUser)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'connections',
          filter: `to_user=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["incoming-requests", user.id] });
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'connections',
          filter: `to_user=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["incoming-requests", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const hasNewContacts = (incomingRequests?.length ?? 0) > 0;
  const hasUnreadMessages = (chats?.reduce((sum, chat) => sum + chat.unreadCount, 0) ?? 0) > 0;

  return {
    hasNewContacts,
    hasUnreadMessages,
  };
}
