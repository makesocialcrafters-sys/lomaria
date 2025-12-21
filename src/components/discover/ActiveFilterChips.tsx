import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { STUDY_PROGRAMS, INTENTS } from "@/lib/onboarding-constants";

interface ActiveFilterChipsProps {
  studyProgram: string | null;
  tutoringSubject: string | null;
  intent: string | null;
  onClearStudyProgram: () => void;
  onClearTutoringSubject: () => void;
  onClearIntent: () => void;
}

const getStudyProgramLabel = (value: string) => {
  return STUDY_PROGRAMS.find((p) => p.value === value)?.label || value;
};

const getIntentLabel = (value: string) => {
  return INTENTS.find((i) => i.value === value)?.label || value;
};

export function ActiveFilterChips({
  studyProgram,
  tutoringSubject,
  intent,
  onClearStudyProgram,
  onClearTutoringSubject,
  onClearIntent,
}: ActiveFilterChipsProps) {
  const hasAnyFilter = studyProgram || tutoringSubject || intent;

  if (!hasAnyFilter) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {studyProgram && (
        <Badge
          variant="secondary"
          className="pl-3 pr-1.5 py-1.5 gap-1.5 cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={onClearStudyProgram}
        >
          <span className="text-xs">{getStudyProgramLabel(studyProgram)}</span>
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
        </Badge>
      )}

      {tutoringSubject && (
        <Badge
          variant="secondary"
          className="pl-3 pr-1.5 py-1.5 gap-1.5 cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={onClearTutoringSubject}
        >
          <span className="text-xs">{tutoringSubject}</span>
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
        </Badge>
      )}

      {intent && (
        <Badge
          variant="secondary"
          className="pl-3 pr-1.5 py-1.5 gap-1.5 cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={onClearIntent}
        >
          <span className="text-xs">{getIntentLabel(intent)}</span>
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
        </Badge>
      )}
    </div>
  );
}
