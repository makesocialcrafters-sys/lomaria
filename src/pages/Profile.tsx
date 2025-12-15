import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { STUDY_PROGRAMS, SEMESTERS, GENDERS, INTENTS, INTERESTS } from "@/lib/onboarding-constants";
import lomariaLogo from "@/assets/lomaria-logo.png";

interface UserData {
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
  birthyear: number | null;
  gender: string | null;
  study_program: string | null;
  semester: string | null;
  focus: string | null;
  intents: string[] | null;
  interests: string[] | null;
  tutoring_subject: string | null;
  tutoring_desc: string | null;
  tutoring_price: number | null;
  bio: string | null;
}

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error);
          return;
        }

        setUserData(data);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [user]);

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
          <div className="h-full bg-primary animate-loader" />
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const age = userData?.birthyear ? currentYear - userData.birthyear : null;
  const genderLabel = GENDERS.find((g) => g.value === userData?.gender)?.label;
  const studyProgramLabel = STUDY_PROGRAMS.find((p) => p.value === userData?.study_program)?.label;
  const semesterLabel = SEMESTERS.find((s) => s.value === userData?.semester)?.label;

  const intentLabels = (userData?.intents || [])
    .map((i) => INTENTS.find((intent) => intent.value === i)?.label)
    .filter(Boolean);

  const interestLabels = (userData?.interests || [])
    .map((i) => INTERESTS.find((interest) => interest.value === i)?.label)
    .filter(Boolean);

  return (
    <MainLayout>
      <div className="px-6 py-8 animate-page-enter">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={lomariaLogo} alt="Lomaria" className="h-10 w-auto opacity-60" />
          </div>

          {/* Title with Settings Button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em] text-primary">
              MEIN PROFIL
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="text-foreground hover:text-primary"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-full bg-skeleton overflow-hidden">
              {userData?.profile_image ? (
                <img
                  src={userData.profile_image}
                  alt={userData.first_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl font-medium">
                  {userData?.first_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
          </div>

          {/* Name + Age + Gender */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-foreground">
              {userData?.first_name} {userData?.last_name}
            </h2>
            <p className="text-muted-foreground">
              {age && `${age} Jahre`}
              {age && genderLabel && " · "}
              {genderLabel}
            </p>
          </div>

          {/* Study Info */}
          <div className="text-center mb-6">
            <p className="text-foreground">{studyProgramLabel}</p>
            <p className="text-muted-foreground">
              {semesterLabel}
              {userData?.focus && ` · ${userData.focus}`}
            </p>
          </div>

          {/* Intents */}
          {intentLabels.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Ich suche
              </h3>
              <div className="flex flex-wrap gap-2">
                {intentLabels.map((label) => (
                  <span
                    key={label}
                    className="text-xs px-3 py-1 bg-primary/20 text-primary rounded"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {interestLabels.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Interessen
              </h3>
              <div className="flex flex-wrap gap-2">
                {interestLabels.map((label) => (
                  <span
                    key={label}
                    className="text-xs px-3 py-1 bg-secondary text-foreground/80 rounded"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tutoring */}
          {userData?.tutoring_subject && (
            <div className="mb-6 p-4 bg-card border border-border/50 rounded-md">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Nachhilfe
              </h3>
              <p className="text-foreground font-medium">{userData.tutoring_subject}</p>
              {userData.tutoring_desc && (
                <p className="text-sm text-muted-foreground mt-1">{userData.tutoring_desc}</p>
              )}
              {userData.tutoring_price && (
                <p className="text-sm text-primary mt-2">{userData.tutoring_price}€ / Stunde</p>
              )}
            </div>
          )}

          {/* Bio */}
          {userData?.bio && (
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Über mich
              </h3>
              <p className="text-foreground/90 text-sm leading-relaxed">{userData.bio}</p>
            </div>
          )}

          {/* Sign Out */}
          <div className="pt-4 border-t border-border">
            <button
              onClick={signOut}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
