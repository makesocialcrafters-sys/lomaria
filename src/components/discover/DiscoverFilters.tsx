import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STUDY_PROGRAMS, INTENTS } from "@/lib/onboarding-constants";
import { X } from "lucide-react";

interface DiscoverFiltersProps {
  studyProgram: string | null;
  tutoringSubject: string | null;
  intent: string | null;
  tutoringSubjects: string[];
  onStudyProgramChange: (value: string | null) => void;
  onTutoringSubjectChange: (value: string | null) => void;
  onIntentChange: (value: string | null) => void;
  onReset: () => void;
}

export function DiscoverFilters({
  studyProgram,
  tutoringSubject,
  intent,
  tutoringSubjects,
  onStudyProgramChange,
  onTutoringSubjectChange,
  onIntentChange,
  onReset,
}: DiscoverFiltersProps) {
  const hasFilters = studyProgram || tutoringSubject || intent;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        {/* Study Program Filter */}
        <Select
          value={studyProgram || ""}
          onValueChange={(v) => onStudyProgramChange(v || null)}
        >
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Studienrichtung" />
          </SelectTrigger>
          <SelectContent>
            {STUDY_PROGRAMS.map((program) => (
              <SelectItem key={program.value} value={program.value}>
                {program.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tutoring Subject Filter */}
        <Select
          value={tutoringSubject || ""}
          onValueChange={(v) => onTutoringSubjectChange(v || null)}
        >
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Nachhilfe-Fach" />
          </SelectTrigger>
          <SelectContent>
            {tutoringSubjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Intent Filter */}
        <Select
          value={intent || ""}
          onValueChange={(v) => onIntentChange(v || null)}
        >
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Intent" />
          </SelectTrigger>
          <SelectContent>
            {INTENTS.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}
