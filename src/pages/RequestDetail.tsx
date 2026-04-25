import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import { FounderBadge } from "@/components/ui/FounderBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GoldLoader } from "@/components/ui/gold-loader";
import { toast } from "sonner";
import { STUDY_PROGRAMS } from "@/lib/onboarding-constants";

interface RequestData {
  id: string;
  message: string | null;
  sender: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_image: string | null;
    study_program: string | null;
    semester: string | null;
    is_founder: boolean;
  };
}

export default function RequestDetail() {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [request, setRequest] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadRequest() {
      if (!connectionId || !user) return;

      try {
        // Get current user's profile ID
        const { data: currentUser } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (!currentUser) {
          navigate("/contacts");
          return;
        }

        // Get the connection with sender info
        const { data: connection, error } = await supabase
          .from("connections")
          .select("id, message, from_user, to_user, status")
          .eq("id", connectionId)
          .maybeSingle();

        if (error || !connection) {
          console.error("Error loading request:", error);
          navigate("/contacts");
          return;
        }

        // Verify this is an incoming request for the current user
        if (connection.to_user !== currentUser.id || connection.status !== "pending") {
          navigate("/contacts");
          return;
        }

        // Get sender profile from user_profiles view
        const { data: senderProfile } = await supabase
          .from("user_profiles")
          .select("id, first_name, last_name, profile_image, study_program, semester, is_founder")
          .eq("id", connection.from_user)
          .maybeSingle();

        if (!senderProfile) {
          navigate("/contacts");
          return;
        }

        setRequest({
          id: connection.id,
          message: connection.message,
          sender: {
            ...senderProfile,
            is_founder: senderProfile.is_founder ?? false,
          },
        });
      } catch (err) {
        console.error("Error:", err);
        navigate("/contacts");
      } finally {
        setLoading(false);
      }
    }

    loadRequest();
  }, [connectionId, user, navigate]);

  const handleAccept = async () => {
    if (!request || !user) return;
    setProcessing(true);

    try {
      // Get current user's profile ID
      const { data: currentUser } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", request.id);

      if (error) {
        console.error("Error accepting request:", error);
        toast.error("Fehler beim Annehmen der Anfrage");
        return;
      }

      // Send email notification to the requester (fire and forget)
      if (currentUser) {
        supabase.functions.invoke("notify-connection", {
          body: {
            type: "request_accepted",
            connectionId: request.id,
            fromUserId: currentUser.id,  // The accepter
            toUserId: request.sender.id, // The original requester
          },
        }).catch((err) => {
          console.error("Error sending email notification:", err);
        });
      }

      toast.success("Kontaktanfrage angenommen!");
      navigate(`/chats/${request.id}`);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Fehler beim Annehmen der Anfrage");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!request) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "rejected" })
        .eq("id", request.id);

      if (error) {
        console.error("Error declining request:", error);
        toast.error("Fehler beim Ablehnen der Anfrage");
        return;
      }

      toast.success("Anfrage abgelehnt");
      navigate("/contacts");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Fehler beim Ablehnen der Anfrage");
    } finally {
      setProcessing(false);
    }
  };

  const studyProgramLabel = STUDY_PROGRAMS.find(
    (p) => p.value === request?.sender.study_program
  )?.label;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GoldLoader />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Anfrage nicht gefunden</p>
        <Button variant="outline" onClick={() => navigate("/contacts")}>
          Zurück
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-cinematic-enter">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-primary/20 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-all duration-500"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-display text-sm tracking-wide">Zurück</span>
        </button>
      </header>

      {/* Content */}
      <div className="px-6 py-8 pb-32">
        {/* Clickable Profile Area */}
        <button
          onClick={() => navigate(`/discover/profile/${request.sender.id}`)}
          className="w-full flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity duration-300 mb-6"
        >
          {/* Profile Image */}
          <div className="mb-4">
            <SignedAvatar
              storagePath={request.sender.profile_image}
              name={request.sender.first_name}
              className="w-28 h-28"
              fallbackClassName="text-3xl"
            />
          </div>

          {/* Name */}
          <h1 className="text-2xl font-display text-foreground">
            {request.sender.first_name} {request.sender.last_name}
          </h1>
          {studyProgramLabel && (
            <p className="text-muted-foreground mt-1">{studyProgramLabel}</p>
          )}
          {request.sender.semester && (
            <p className="text-sm text-muted-foreground">
              {request.sender.semester}. Semester
            </p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-2">
            Tippe, um das Profil anzusehen
          </p>
        </button>

        <div className="divider-subtle mb-6" />

        {/* Message */}
        {request.message && (
          <div className="bg-card border border-primary/20 rounded-md p-4">
            <h3 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
              Nachricht
            </h3>
            <p className="text-foreground/80 leading-relaxed">{request.message}</p>
          </div>
        )}
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-primary/20 flex gap-3">
        <Button
          variant="outline"
          width="full"
          onClick={handleDecline}
          disabled={processing}
        >
          Ablehnen
        </Button>
        <Button
          width="full"
          onClick={handleAccept}
          disabled={processing}
        >
          {processing ? "..." : "Annehmen"}
        </Button>
      </div>
    </div>
  );
}
