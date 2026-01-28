import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUserId } from "./useCurrentUserId";
import { useIncomingRequests } from "./useIncomingRequests";
import { useChatsPreview } from "./useChatsPreview";

export function useNotificationCounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // MUST call all hooks unconditionally for consistent hook order
  const { data: currentUserId } = useCurrentUserId();
  const { data: incomingRequests } = useIncomingRequests();
  const { data: chats } = useChatsPreview();

  // Realtime Subscriptions für alle relevanten Events
  useEffect(() => {
    // Guard inside useEffect, not before hooks
    if (!user || !currentUserId) return;

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
          if (payload.new.sender_id !== currentUserId) {
            queryClient.invalidateQueries({ queryKey: ["chats-preview", user.id] });
          }
        }
      )
      // Eingehende Anfragen (INSERT)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'connections',
          filter: `to_user=eq.${currentUserId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["incoming-requests", user.id] });
          queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
        }
      )
      // Ausgehende Anfragen (INSERT) - für Sender's UI
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'connections',
          filter: `from_user=eq.${currentUserId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sent-requests", user.id] });
          queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
        }
      )
      // Connection Updates (accepted/rejected)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'connections'
        },
        (payload) => {
          const { from_user, to_user, status } = payload.new as { from_user: string; to_user: string; status: string };
          
          // Nur verarbeiten wenn wir beteiligt sind
          if (from_user !== currentUserId && to_user !== currentUserId) return;
          
          if (status === 'accepted') {
            // Beide sehen neuen Chat, Request verschwindet
            queryClient.invalidateQueries({ queryKey: ["sent-requests", user.id] });
            queryClient.invalidateQueries({ queryKey: ["incoming-requests", user.id] });
            queryClient.invalidateQueries({ queryKey: ["accepted-connections", user.id] });
            queryClient.invalidateQueries({ queryKey: ["chats-preview", user.id] });
            queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
          } else if (status === 'rejected') {
            // Sender sieht aktualisierte Sent Requests, Profil wieder in Discover
            queryClient.invalidateQueries({ queryKey: ["sent-requests", user.id] });
            queryClient.invalidateQueries({ queryKey: ["incoming-requests", user.id] });
            queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
          }
        }
      )
      // Connection gelöscht (Unmatch oder zurückgezogene Anfrage)
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'connections'
        },
        () => {
          // Bei DELETE alle relevanten Listen aktualisieren
          queryClient.invalidateQueries({ queryKey: ["accepted-connections", user.id] });
          queryClient.invalidateQueries({ queryKey: ["chats-preview", user.id] });
          queryClient.invalidateQueries({ queryKey: ["sent-requests", user.id] });
          queryClient.invalidateQueries({ queryKey: ["incoming-requests", user.id] });
          queryClient.invalidateQueries({ queryKey: ["discover-profiles"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentUserId, queryClient]);

  const hasNewContacts = (incomingRequests?.length ?? 0) > 0;
  const hasUnreadMessages = (chats?.reduce((sum, chat) => sum + chat.unreadCount, 0) ?? 0) > 0;

  return {
    hasNewContacts,
    hasUnreadMessages,
  };
}
