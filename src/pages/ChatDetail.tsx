import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoldLoader } from "@/components/ui/gold-loader";

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

export default function ChatDetail() {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function loadChat() {
      if (!connectionId || !user) return;

      try {
        // Get current user's profile ID
        const { data: currentUser } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (!currentUser) {
          navigate("/chats");
          return;
        }
        setCurrentUserId(currentUser.id);

        // Get the connection
        const { data: connection, error: connError } = await supabase
          .from("connections")
          .select("id, from_user, to_user, status")
          .eq("id", connectionId)
          .maybeSingle();

        if (connError || !connection || connection.status !== "accepted") {
          navigate("/chats");
          return;
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

        if (otherUserProfile) {
          setOtherUser(otherUserProfile);
        }

        // Load messages
        const { data: messagesData } = await supabase
          .from("messages")
          .select("*")
          .eq("connection_id", connectionId)
          .order("created_at", { ascending: true });

        if (messagesData) {
          setMessages(messagesData);
        }
      } catch (err) {
        console.error("Error:", err);
        navigate("/chats");
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, [connectionId, user, navigate]);

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
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUserId || !connectionId) return;
    
    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase.from("messages").insert({
        connection_id: connectionId,
        sender_id: currentUserId,
        text: messageText,
      });

      if (error) {
        console.error("Error sending message:", error);
        setNewMessage(messageText); // Restore message on error
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GoldLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/chats")}
          className="text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-skeleton overflow-hidden flex-shrink-0">
          {otherUser?.profile_image ? (
            <img
              src={otherUser.profile_image}
              alt={otherUser.first_name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
              {otherUser?.first_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {otherUser?.first_name || "Chat"}
          </p>
          {otherUser?.study_program && (
            <p className="text-xs text-muted-foreground truncate">
              {otherUser.study_program}
            </p>
          )}
        </div>
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
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border/30 text-foreground rounded-bl-sm"
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
      <div className="sticky bottom-0 bg-background border-t border-border/30 p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nachricht schreiben..."
            className="flex-1 bg-card border-border/50"
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
