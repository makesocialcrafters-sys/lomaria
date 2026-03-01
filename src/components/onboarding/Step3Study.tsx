import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STUDY_PROGRAMS } from "@/lib/onboarding-constants";

interface Step3Props {
  studyProgram: string | null;
  studyPhase: string | null;
  focus: string;
  onUpdate: (data: { study_program?: string | null; study_phase?: string | null; focus?: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Study({ studyProgram, studyPhase, onUpdate, onNext, onBack }: Step3Props) {
  const isValid = studyProgram !== null;

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
          <label className="text-sm text-muted-foreground mb-2 block">Hochschule</label>
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
            <label className="text-sm text-muted-foreground mb-2 block">Studienrichtung</label>
            <Input
              variant="elegant"
              placeholder="z.B. Informatik, BWL, Jus..."
              value={studyPhase ?? ""}
              onChange={(e) => onUpdate({ study_phase: e.target.value })}
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
