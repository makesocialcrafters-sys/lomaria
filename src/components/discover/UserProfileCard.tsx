import React from "react";
import { useNavigate } from "react-router-dom";
import { STUDY_PROGRAMS, INTENTS, INTERESTS } from "@/lib/onboarding-constants";
import type { UserProfile } from "@/hooks/useDiscoverProfiles";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import { FounderBadge } from "@/components/ui/FounderBadge";
import { CofounderBadge } from "@/components/ui/CofounderBadge";

interface UserProfileCardProps {
  user: UserProfile;
  onClick?: () => void;
}

const UserProfileCardInner = ({ user, onClick }: UserProfileCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/discover/profile/${user.id}`);
    }
  };

  const age = user.age ?? null;

  const studyProgramLabel = STUDY_PROGRAMS.find((p) => p.value === user.study_program)?.label;
  

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
        <SignedAvatar
          storagePath={user.profile_image}
          name={user.first_name}
          className="w-24 h-24 flex-shrink-0"
          fallbackClassName="text-2xl font-medium"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-display tracking-wide text-foreground truncate">{user.first_name}</h3>
            {age && <span className="text-sm text-muted-foreground/70">· {age}</span>}
            {user.is_founder && <FounderBadge size="sm" />}
            {user.is_cofounder && <CofounderBadge size="sm" />}
          </div>

          {(studyProgramLabel || user.study_phase) && (
            <div className="mt-1.5">
              {studyProgramLabel && <p className="text-sm text-muted-foreground truncate">{studyProgramLabel}</p>}
              {user.study_phase && <p className="text-xs text-muted-foreground/70 truncate">{user.study_phase}</p>}
            </div>
          )}

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

        </div>
      </div>
    </div>
  );
};

export const UserProfileCard = React.memo(UserProfileCardInner);
