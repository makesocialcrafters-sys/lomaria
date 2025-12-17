import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STUDY_PROGRAMS, STUDY_PHASES } from "@/lib/onboarding-constants";

interface Step3Props {
  studyProgram: string | null;
  studyPhase: string | null;
  focus: string;
  onUpdate: (data: { study_program?: string | null; study_phase?: string | null; focus?: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Study({ studyProgram, studyPhase, focus, onUpdate, onNext, onBack }: Step3Props) {
  const isValid = studyProgram !== null && studyPhase !== null;
  const showSchwerpunkt = studyPhase === "cbk_hauptstudium";

  const handleStudyPhaseChange = (value: string) => {
    // Clear focus when switching to STEOP
    if (value === "steop") {
      onUpdate({ study_phase: value, focus: "" });
    } else {
      onUpdate({ study_phase: value });
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-primary mb-2">
          STUDIUM
        </h2>
        <p className="text-muted-foreground text-sm">Was studierst du?</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Studienrichtung</label>
          <Select value={studyProgram ?? ""} onValueChange={(v) => onUpdate({ study_program: v })}>
            <SelectTrigger className="input-elegant border-0 border-b border-primary/50 rounded-none focus:border-primary">
              <SelectValue placeholder="Auswählen" />
            </SelectTrigger>
            <SelectContent>
              {STUDY_PROGRAMS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {studyProgram && (
          <div className="animate-fade-in">
            <label className="text-sm text-muted-foreground mb-2 block">Studienphase</label>
            <Select value={studyPhase ?? ""} onValueChange={handleStudyPhaseChange}>
              <SelectTrigger className="input-elegant border-0 border-b border-primary/50 rounded-none focus:border-primary">
                <SelectValue placeholder="Auswählen" />
              </SelectTrigger>
              <SelectContent>
                {STUDY_PHASES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showSchwerpunkt && (
          <div className="animate-fade-in">
            <label className="text-sm text-muted-foreground mb-2 block">
              Schwerpunkt <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <Input
              placeholder="z.B. Finance, Marketing..."
              value={focus}
              onChange={(e) => onUpdate({ focus: e.target.value })}
              className="input-elegant"
            />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          Zurück
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="btn-premium">
          Weiter
        </Button>
      </div>
    </div>
  );
}
