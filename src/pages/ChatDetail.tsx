import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoldLoader } from "@/components/ui/gold-loader";
import { useChatData } from "@/hooks/useChatData";

interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export default function ChatDetail() {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: chatData, isLoading, addMessage } = useChatData(connectionId, user?.id);
  
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId, addMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatData?.messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !chatData?.currentUserId || !connectionId) return;
    
    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase.from("messages").insert({
        connection_id: connectionId,
        sender_id: chatData.currentUserId,
        text: messageText,
      });

      if (error) {
        console.error("Error sending message:", error);
        setNewMessage(messageText);
      }
    } catch (err) {
      console.error("Error:", err);
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
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
          onClick={() => otherUser?.id && navigate(`/profile/${otherUser.id}`)}
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
            {otherUser?.study_program && (
              <p className="text-xs text-muted-foreground truncate">
                {otherUser.study_program}
              </p>
            )}
          </div>
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              Starte die Unterhaltung mit einer Nachricht.
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
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-primary/20 p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
