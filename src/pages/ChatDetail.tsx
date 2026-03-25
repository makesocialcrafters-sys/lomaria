import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoldLoader } from "@/components/ui/gold-loader";
import { useChatData, Message, ChatData } from "@/hooks/useChatData";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { UserActionMenu } from "@/components/user-actions/UserActionMenu";
import { IcebreakerStarters } from "@/components/chat/IcebreakerStarters";


const INTENT_LABELS: Record<string, string> = {
  neue_leute: "Kennenlernen",
  projektpartner: "Projektpartner",
  startup: "Gründen",
  nachhilfe_anbieten: "Nachhilfe",
  nachhilfe_suchen: "Nachhilfe",
  networking: "Networking",
  freundschaften: "Freundschaften",
};

export default function ChatDetail() {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { 
    data: chatData, 
    isLoading, 
    addMessage, 
    removeMessage, 
    replaceMessage,
    markMessagesAsRead 
  } = useChatData(connectionId, user?.id);
  
  const { isOtherTyping, setTyping } = useTypingIndicator(connectionId, chatData?.currentUserId);
  
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Redirect if no valid chat data after loading
  useEffect(() => {
    if (!isLoading && !chatData && connectionId) {
      navigate("/chats");
    }
  }, [isLoading, chatData, connectionId, navigate]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!connectionId) return;

    const channel = supabase
      .channel(`messages-${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          addMessage(newMsg);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          // Update read_at status
          queryClient.setQueryData<ChatData | null>(
            ["chat", connectionId],
            (old) => {
              if (!old) return old;
              return {
                ...old,
                messages: old.messages.map((m) =>
                  m.id === updatedMsg.id ? { ...m, read_at: updatedMsg.read_at } : m
                ),
              };
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId, addMessage, queryClient]);

  // Mark unread messages as read when viewing
  useEffect(() => {
    if (!chatData?.messages || !chatData.currentUserId) return;
    
    // Find unread messages from other user
    const unreadFromOther = chatData.messages.filter(
      (m) => m.sender_id !== chatData.currentUserId && !m.read_at && !m.id.startsWith("temp-")
    );
    
    if (unreadFromOther.length > 0) {
      const unreadIds = unreadFromOther.map(m => m.id);
      
      // Optimistically mark as read
      markMessagesAsRead(unreadIds);
      
      // Update in database
      supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds)
        .then(() => {
          if (user) {
            queryClient.invalidateQueries({ queryKey: ["chats-preview", user.id] });
          }
        });
    }
  }, [chatData?.messages, chatData?.currentUserId, markMessagesAsRead, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatData?.messages, isOtherTyping]);

  // Handle input change with typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Debounce typing indicator
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
    
    if (e.target.value.trim()) {
      setTyping(true);
      typingDebounceRef.current = setTimeout(() => {
        setTyping(false);
      }, 2000);
    } else {
      setTyping(false);
    }
  }, [setTyping]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !chatData?.currentUserId || !connectionId) return;
    
    setSending(true);
    setTyping(false);
    
    const trimmedText = messageText.trim();
    setNewMessage("");

    // Create temp message for optimistic update
    const tempId = `temp-${crypto.randomUUID()}`;
    const tempMessage: Message = {
      id: tempId,
      sender_id: chatData.currentUserId,
      text: trimmedText,
      created_at: new Date().toISOString(),
      read_at: null,
    };

    // Immediately show in UI
    addMessage(tempMessage);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          connection_id: connectionId,
          sender_id: chatData.currentUserId,
          text: trimmedText,
        })
        .select("id, sender_id, text, created_at, read_at")
        .single();

      if (error) {
        console.error("Error sending message:", error);
        removeMessage(tempId);
        setNewMessage(trimmedText);
      } else if (data) {
        replaceMessage(tempId, data);
        // Invalidate chats preview to update last message
        if (user) {
          queryClient.invalidateQueries({ queryKey: ["chats-preview", user.id] });
        }
        
        // Send email notification (fire and forget - don't block on this)
        // Only notify if recipient is offline (checked in edge function)
        if (otherUser?.id) {
          supabase.functions.invoke("notify-connection", {
            body: {
              type: "new_message",
              connectionId,
              fromUserId: chatData.currentUserId,
              toUserId: otherUser.id,
              message: trimmedText,
            },
          }).catch((err) => {
            console.error("Error sending email notification:", err);
          });
        }
      }
    } catch (err) {
      console.error("Error:", err);
      removeMessage(tempId);
      setNewMessage(trimmedText);
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    sendMessage(newMessage);
  };

  const handleIcebreakerSelect = (message: string) => {
    sendMessage(message);
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show loader only on initial load when no cached data exists
  if (isLoading && !chatData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GoldLoader />
      </div>
    );
  }

  const messages = chatData?.messages || [];
  const otherUser = chatData?.otherUser;
  const currentUserId = chatData?.currentUserId;

  return (
    <div className="min-h-screen bg-background flex flex-col animate-cinematic-enter">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-primary/20 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-foreground/60 hover:text-primary transition-all duration-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => otherUser?.id && navigate(`/discover/profile/${otherUser.id}`)}
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-all duration-500"
        >
          <div className="w-10 h-10 rounded-full bg-skeleton overflow-hidden flex-shrink-0">
            {otherUser?.profile_image ? (
              <img
                src={otherUser.profile_image}
                alt={otherUser.first_name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-display">
                {otherUser?.first_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 text-left">
            <p className="font-display text-foreground truncate">
              {otherUser?.first_name || "Chat"}
            </p>
            {isOtherTyping ? (
              <p className="text-xs text-primary/80">
                tippt...
              </p>
            ) : chatData?.sharedIntents && chatData.sharedIntents.length > 0 ? (
              <p className="text-xs text-muted-foreground/60 truncate">
                Verbunden für: {chatData.sharedIntents.map(i => INTENT_LABELS[i] || i).join(" · ")}
              </p>
            ) : otherUser?.study_program ? (
              <p className="text-xs text-muted-foreground truncate">
                {otherUser.study_program}
              </p>
            ) : null}
          </div>
        </button>

        {/* User Action Menu */}
        {otherUser?.id && currentUserId && connectionId && (
          <UserActionMenu
            targetUserId={otherUser.id}
            targetUserName={otherUser.first_name || "Nutzer"}
            connectionId={connectionId}
            currentUserId={currentUserId}
            onActionComplete={() => navigate("/chats")}
          />
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground/60 text-sm text-center leading-relaxed">
              Das ist der Anfang einer Unterhaltung.<br />
              Nimm dir Zeit.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  msg.sender_id === currentUserId
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-primary/20 text-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm break-words">{msg.text}</p>
                {/* Read receipt for own messages */}
                {msg.sender_id === currentUserId && (
                  <div className="flex justify-end mt-1">
                    {msg.read_at ? (
                      <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-primary-foreground/50" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Subtle typing indicator */}
        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="bg-card border border-primary/10 rounded-2xl rounded-bl-md px-4 py-2">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: "600ms" }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 bg-background border-t border-primary/20">
        {/* Icebreaker Starters - nur bei leerem Chat */}
        {!isLoading && messages.length === 0 && (
          <IcebreakerStarters 
            onSelect={handleIcebreakerSelect}
            disabled={sending}
          />
        )}
        
        <div className="flex gap-2 p-4">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nachricht schreiben..."
            className="flex-1 bg-card border-primary/20"
            disabled={sending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
