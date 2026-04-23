import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GoldLoader } from "@/components/ui/gold-loader";
import { ContactRequestDialog } from "@/components/profile/ContactRequestDialog";
import { UserActionMenu } from "@/components/user-actions/UserActionMenu";
import { FounderBadge } from "@/components/ui/founder-badge";
import { useBlockedUserIds } from "@/hooks/useBlockedUserIds";
import { 
  STUDY_PROGRAMS, 
  INTENTS, 
  INTERESTS,
} from "@/lib/onboarding-constants";


interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
  age?: number | null;
  study_program: string | null;
  study_phase?: string | null;
  semester?: string | null;
  intents: string[] | null;
  interests: string[] | null;
  tutoring_subject: string | null;
  tutoring_desc: string | null;
  tutoring_price: number | null;
  bio: string | null;
  is_founder?: boolean | null;
}

// Connection types for role-based CTA logic
type ConnectionStatus = "pending" | "accepted" | "rejected";
type ConnectionRole = "sender" | "receiver" | null;

type ConnectionRow = {
  id: string;
  status: ConnectionStatus;
  from_user: string;
  to_user: string;
};

export default function ProfileDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: blockedUserIds = [] } = useBlockedUserIds();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [connectionData, setConnectionData] = useState<ConnectionRow | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Check if this user is blocked
  const isBlocked = userId ? blockedUserIds.includes(userId) : false;

  // Derived states from connectionData
  const existingConnection: ConnectionStatus | null = connectionData?.status ?? null;
  const connectionRole: ConnectionRole =
    connectionData?.from_user === currentUserId
      ? "sender"
      : connectionData?.to_user === currentUserId
      ? "receiver"
      : null;

  useEffect(() => {
    async function loadProfile() {
      if (!userId || !user) return;

      try {
        const { data: currentUserData } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (currentUserData) {
          setCurrentUserId(currentUserData.id);
        }

        // Use user_profiles view (excludes email, auth_user_id)
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("Error loading profile:", error);
          return;
        }

        setProfile(data as unknown as UserProfile);

        if (currentUserData) {
          const { data: connectionResult } = await supabase
            .from("connections")
            .select("id, status, from_user, to_user")
            .or(`and(from_user.eq.${currentUserData.id},to_user.eq.${userId}),and(from_user.eq.${userId},to_user.eq.${currentUserData.id})`)
            .maybeSingle();

          if (connectionResult) {
            setConnectionData(connectionResult as ConnectionRow);
          }
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId, user]);

  const isOwnProfile = profile?.id === currentUserId;
  const age = profile?.age ?? null;

  const studyProgramLabel = STUDY_PROGRAMS.find((p) => p.value === profile?.study_program)?.label;
  

  const intentLabels = profile?.intents?.map((i) => INTENTS.find((int) => int.value === i)?.label).filter(Boolean) || [];
  const interestLabels = profile?.interests?.map((i) => INTERESTS.find((int) => int.value === i)?.label).filter(Boolean) || [];

  // CTA helper function with role-based logic
  function getConnectionCTA(
    status: ConnectionStatus | null,
    role: ConnectionRole
  ): React.ReactNode {
    if (status === "pending" && role === "sender") {
      return <Button disabled width="full" variant="outline">Anfrage gesendet</Button>;
    }

    if (status === "pending" && role === "receiver") {
      return (
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleReject}
          >
            Ablehnen
          </Button>
          <Button 
            className="flex-1"
            onClick={handleAccept}
          >
            Annehmen
          </Button>
        </div>
      );
    }

    if (status === "accepted") {
      return (
        <Button width="full" variant="outline" onClick={() => navigate("/chats")}>
          Chat öffnen
        </Button>
      );
    }

    if (status === "rejected" && role === "sender") {
      return (
        <Button width="full" onClick={() => setIsDialogOpen(true)}>
          Kontakt anfragen
        </Button>
      );
    }

    if (status === "rejected" && role === "receiver") {
      return (
        <Button width="full" onClick={() => setIsDialogOpen(true)}>
          Kontakt anfragen
        </Button>
      );
    }

    return (
      <Button width="full" onClick={() => setIsDialogOpen(true)}>
        Kontakt anfragen
      </Button>
    );
  }

  const handleBack = () => navigate(-1);

  const handleAccept = async () => {
    if (!connectionData?.id) return;
    
    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", connectionData.id);
      
    if (error) {
      toast.error("Fehler beim Akzeptieren");
      return;
    }
    
    toast.success("Kontakt akzeptiert!");
    navigate("/chats");
  };

  const handleReject = async () => {
    if (!connectionData?.id) return;
    
    const { error } = await supabase
      .from("connections")
      .update({ status: "rejected" })
      .eq("id", connectionData.id);
      
    if (error) {
      toast.error("Fehler beim Ablehnen");
      return;
    }
    
    toast.success("Anfrage abgelehnt");
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GoldLoader />
      </div>
    );
  }

  // Show blocked message
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Dieses Profil ist nicht verfügbar.</p>
        <Button variant="outline" onClick={handleBack}>Zurück</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Profil nicht gefunden</p>
        <Button variant="outline" onClick={handleBack}>Zurück</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-cinematic-enter">
      <header className="sticky top-0 z-10 bg-background border-b border-primary/20 px-4 py-3 flex items-center justify-between">
        <button onClick={handleBack} className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-all duration-500">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-display text-sm tracking-wide">Zurück</span>
        </button>
        
        {/* User Action Menu - only for accepted connections */}
        {existingConnection === "accepted" && currentUserId && connectionData?.id && (
          <UserActionMenu
            targetUserId={userId!}
            targetUserName={profile.first_name || "Nutzer"}
            connectionId={connectionData.id}
            currentUserId={currentUserId}
            onActionComplete={() => navigate("/discover")}
          />
        )}
      </header>

      <div className="px-6 py-8 pb-32">
        <div className="flex justify-center mb-6">
          <SignedAvatar
            storagePath={profile.profile_image}
            name={profile.first_name}
            className="w-32 h-32"
            fallbackClassName="text-4xl"
          />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-display text-foreground inline-flex items-center gap-2">
            {profile.first_name}
            {profile.is_founder && <FounderBadge />}
          </h1>
          {age && (
            <p className="text-sm text-muted-foreground mt-1">{age}</p>
          )}
        </div>

        <div className="divider-subtle mb-6" />

        {(studyProgramLabel || profile.study_phase) && (
          <div className="text-sm text-foreground/70 text-center mb-6">
            {studyProgramLabel && <p>{studyProgramLabel}</p>}
            {profile.study_phase && <p className="text-muted-foreground">{profile.study_phase}</p>}
          </div>
        )}

        {profile.intents && profile.intents.length > 0 && (
          <div className="mb-6">
            <h3 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">Suche nach</h3>
            <div className="flex flex-wrap gap-2">
              {profile.intents.map((intentValue) => {
                const intentLabel = INTENTS.find((int) => int.value === intentValue)?.label;
                return (
                  <span key={intentValue} className="text-sm px-3 py-1 bg-card border border-primary/10 rounded text-foreground/80">
                    {intentLabel}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {interestLabels.length > 0 && (
          <div className="mb-6">
            <h3 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Interessen</h3>
            <div className="flex flex-wrap gap-2">
              {interestLabels.map((label) => (
                <span key={label} className="text-sm px-3 py-1 bg-secondary text-foreground/80 rounded">{label}</span>
              ))}
            </div>
          </div>
        )}

        {profile.tutoring_subject && (
          <div className="mb-6 p-4 bg-card border border-primary/20 rounded-md">
            <h3 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Bietet Nachhilfe an</h3>
            <p className="text-foreground font-display">{profile.tutoring_subject}</p>
            {profile.tutoring_desc && <p className="text-sm text-muted-foreground mt-2">{profile.tutoring_desc}</p>}
            {profile.tutoring_price && <p className="text-sm text-primary mt-2">{profile.tutoring_price} € / Stunde</p>}
          </div>
        )}

        {profile.bio && (
          <div className="mb-6">
            <h3 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">Über mich</h3>
            <p className="text-foreground/80 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {!isOwnProfile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-primary/20">
          {getConnectionCTA(existingConnection, connectionRole)}
        </div>
      )}

      <ContactRequestDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} toUserId={userId!} fromUserId={currentUserId} recipientName={profile.first_name || ""} />
    </div>
  );
}
