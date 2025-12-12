import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENDERS } from "@/lib/onboarding-constants";

interface Step2Props {
  birthyear: number | null;
  gender: string | null;
  onUpdate: (data: { birthyear?: number | null; gender?: string | null }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Demographics({ birthyear, gender, onUpdate, onNext, onBack }: Step2Props) {
  const currentYear = new Date().getFullYear();
  const isValid =
    birthyear !== null &&
    birthyear >= 1950 &&
    birthyear <= currentYear &&
    gender !== null;

  const handleBirthyearChange = (value: string) => {
    const year = parseInt(value, 10);
    if (!isNaN(year)) {
      onUpdate({ birthyear: year });
    } else {
      onUpdate({ birthyear: null });
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-primary mb-2">
          SICHTBARE ANGABEN
        </h2>
        <p className="text-muted-foreground text-sm">Dein Alter & Geschlecht</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Geburtsjahr</label>
          <Input
            type="number"
            placeholder="z.B. 2000"
            value={birthyear ?? ""}
            onChange={(e) => handleBirthyearChange(e.target.value)}
            min={1950}
            max={currentYear}
            className="input-elegant"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Geschlecht</label>
          <Select value={gender ?? ""} onValueChange={(v) => onUpdate({ gender: v })}>
            <SelectTrigger className="input-elegant border-0 border-b border-primary/50 rounded-none focus:border-primary">
              <SelectValue placeholder="Auswählen" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground/70 text-center pt-2">
          Diese Angaben sind nur im Profil sichtbar und werden nicht zum Filtern verwendet.
        </p>
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
