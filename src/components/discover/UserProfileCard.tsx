import { useNavigate } from "react-router-dom";
import { STUDY_PROGRAMS, STUDY_PHASES, INTENTS, INTERESTS } from "@/lib/onboarding-constants";
import type { UserProfile } from "@/hooks/useDiscoverProfiles";

interface UserProfileCardProps {
  user: UserProfile;
  onClick?: () => void;
}

export function UserProfileCard({ user, onClick }: UserProfileCardProps) {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/profile/${user.id}`);
    }
  };

  // Support both age (new) and birthyear (old) fields
  const age = user.age ?? (user.birthyear ? currentYear - user.birthyear : null);

  const studyProgramLabel = STUDY_PROGRAMS.find((p) => p.value === user.study_program)?.label;
  const studyPhaseLabel = STUDY_PHASES.find((p) => p.value === user.study_phase)?.label;

  const firstIntent = user.intents?.[0];
  const intentLabel = INTENTS.find((i) => i.value === firstIntent)?.label;

  const displayInterests = user.interests?.slice(0, 2) || [];
  const interestLabels = displayInterests
    .map((i) => INTERESTS.find((int) => int.value === i)?.label)
    .filter(Boolean);

  return (
    <div
      onClick={handleClick}
      className="bg-card border border-primary/10 rounded-xl p-6 cursor-pointer hover:border-primary/30 transition-all duration-500 ease-out"
    >
      <div className="flex items-start gap-5">
        <div className="w-24 h-24 rounded-full bg-skeleton overflow-hidden flex-shrink-0">
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.first_name || "Profile"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-medium">
              {user.first_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-display tracking-wide text-foreground truncate">{user.first_name}</h3>
            {age && <span className="text-sm text-muted-foreground/70">· {age}</span>}
          </div>

          <p className="text-sm text-muted-foreground truncate mt-1.5">
            {studyProgramLabel}
            {studyPhaseLabel && ` · ${studyPhaseLabel}`}
          </p>

          {interestLabels.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-4">
              {interestLabels.map((label) => (
                <span key={label} className="text-xs px-3 py-1 bg-secondary rounded-md text-foreground/80">
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2.5 mt-4">
            {intentLabel && (
              <span className="text-xs px-3 py-1 bg-primary/15 text-primary rounded-md">{intentLabel}</span>
            )}
            {user.tutoring_subject && (
              <span className="text-xs px-3 py-1 bg-accent/15 text-accent rounded-md">
                Nachhilfe: {user.tutoring_subject}
              </span>
            )}
          </div>

          {user.cooldownInfo?.isActive && (
            <p className="mt-4 text-xs text-muted-foreground/60 italic">
              Erneut anfragbar in {user.cooldownInfo.remainingText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
