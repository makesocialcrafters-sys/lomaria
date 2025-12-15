import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GoldLoader } from "@/components/ui/gold-loader";
import { IncomingRequestCard } from "@/components/contacts/IncomingRequestCard";

import { STUDY_PROGRAMS } from "@/lib/onboarding-constants";
import lomariaLogo from "@/assets/lomaria-logo.png";

interface IncomingRequest {
  id: string;
  message: string | null;
  sender: {
    first_name: string;
    profile_image: string | null;
    study_program: string | null;
    semester: string | null;
  };
}


export default function Contacts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);

  useEffect(() => {
    async function loadContacts() {
      if (!user) return;

      try {
        // Get current user's profile ID
        const { data: currentUser } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Load incoming pending requests (where current user is receiver)
        const { data: pendingData } = await supabase
          .from("connections")
          .select("id, message, from_user")
          .eq("to_user", currentUser.id)
          .eq("status", "pending");

        if (pendingData && pendingData.length > 0) {
          // Get sender profiles
          const senderIds = pendingData.map((r) => r.from_user);
          const { data: senderProfiles } = await supabase
            .from("user_profiles")
            .select("id, first_name, profile_image, study_program, semester")
            .in("id", senderIds);

          const requests: IncomingRequest[] = pendingData.map((req) => {
            const sender = senderProfiles?.find((p) => p.id === req.from_user);
            return {
              id: req.id,
              message: req.message,
              sender: {
                first_name: sender?.first_name || "Unbekannt",
                profile_image: sender?.profile_image || null,
                study_program: sender?.study_program || null,
                semester: sender?.semester || null,
              },
            };
          });
          setIncomingRequests(requests);
        }

      } catch (err) {
        console.error("Error loading contacts:", err);
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, [user]);

  const getStudyProgramLabel = (value: string | null) => {
    if (!value) return null;
    return STUDY_PROGRAMS.find((p) => p.value === value)?.label || value;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <GoldLoader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-6 py-8 animate-page-enter">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={lomariaLogo} alt="Lomaria" className="h-10 w-auto opacity-60" />
          </div>

          {/* Title */}
          <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em] text-primary text-center mb-8">
            KONTAKTE
          </h1>

          {/* Incoming Requests Section */}
          <section className="mb-8">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Anfragen ({incomingRequests.length})
            </h2>
            {incomingRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Keine offenen Anfragen
              </p>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <IncomingRequestCard
                    key={req.id}
                    connectionId={req.id}
                    senderName={req.sender.first_name}
                    senderImage={req.sender.profile_image}
                    studyProgram={getStudyProgramLabel(req.sender.study_program)}
                    semester={req.sender.semester}
                    message={req.message}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </MainLayout>
  );
}
