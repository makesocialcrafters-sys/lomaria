import { Button } from "@/components/ui/button";
import { ChipSelect } from "./ChipSelect";
import { INTERESTS } from "@/lib/onboarding-constants";
import { useToast } from "@/hooks/use-toast";

interface Step5Props {
  interests: string[];
  onUpdate: (data: { interests: string[] }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step5Interests({ interests, onUpdate, onNext, onBack }: Step5Props) {
  const { toast } = useToast();
  const isValid = interests.length >= 3;

  const handleMaxExceeded = () => {
    toast({ title: "Maximal 6 Interessen auswählbar.", variant: "destructive" });
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-primary mb-2">
          INTERESSEN
        </h2>
        <p className="text-muted-foreground text-sm">
          Was interessiert dich? <span className="text-primary">(min. 3, max. 6)</span>
        </p>
      </div>

      <ChipSelect
        options={INTERESTS}
        selected={interests}
        onChange={(selected) => onUpdate({ interests: selected })}
        minSelect={3}
        maxSelect={6}
        onMaxExceeded={handleMaxExceeded}
      />

      <p className="text-xs text-muted-foreground/70 text-center">
        {interests.length}/6 ausgewählt
      </p>

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
