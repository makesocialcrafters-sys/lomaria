import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useTypingIndicator(connectionId: string | undefined, currentUserId: string | undefined) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!connectionId || !currentUserId) return;

    const channelName = `typing-${connectionId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Check if other user is typing
        const otherTyping = Object.values(state).some(
          (presences: any) => presences.some(
            (p: any) => p.user_id !== currentUserId && p.isTyping
          )
        );
        setIsOtherTyping(otherTyping);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track initial presence
          await channel.track({ user_id: currentUserId, isTyping: false });
        }
      });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [connectionId, currentUserId]);

  // Set typing status with auto-reset
  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!channelRef.current || !currentUserId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Track typing status
    await channelRef.current.track({ user_id: currentUserId, isTyping });

    // Auto-reset after 3 seconds if typing
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(async () => {
        if (channelRef.current) {
          await channelRef.current.track({ user_id: currentUserId, isTyping: false });
        }
      }, 3000);
    }
  }, [currentUserId]);

  return { isOtherTyping, setTyping };
}
