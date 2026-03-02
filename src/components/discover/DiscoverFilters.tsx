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
import { ActiveFilterChips } from "./ActiveFilterChips";

interface DiscoverFiltersProps {
  studyProgram: string | null;
  tutoringSubject: string | null;
  intent: string | null;
  tutoringSubjects: string[];
  onStudyProgramChange: (value: string | null) => void;
  onTutoringSubjectChange: (value: string | null) => void;
  onIntentChange: (value: string | null) => void;
  onClearStudyProgram: () => void;
  onClearTutoringSubject: () => void;
  onClearIntent: () => void;
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
  onClearStudyProgram,
  onClearTutoringSubject,
  onClearIntent,
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
          <SelectTrigger className="bg-transparent border-primary/20 font-display hover:border-primary/40 transition-all duration-500">
            <SelectValue placeholder="Hochschule" />
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
          <SelectTrigger className="bg-transparent border-primary/20 font-display hover:border-primary/40 transition-all duration-500">
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
          <SelectTrigger className="bg-transparent border-primary/20 font-display hover:border-primary/40 transition-all duration-500">
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

      {/* Active Filter Chips */}
      <ActiveFilterChips
        studyProgram={studyProgram}
        tutoringSubject={tutoringSubject}
        intent={intent}
        onClearStudyProgram={onClearStudyProgram}
        onClearTutoringSubject={onClearTutoringSubject}
        onClearIntent={onClearIntent}
      />

      {/* Reset All Button */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Alle Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}
