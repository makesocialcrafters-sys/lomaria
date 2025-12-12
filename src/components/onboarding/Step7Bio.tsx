import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Step7Props {
  bio: string;
  onUpdate: (data: { bio: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step7Bio({ bio, onUpdate, onNext, onBack }: Step7Props) {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-primary mb-2">
          KURZ-BIO
        </h2>
        <p className="text-muted-foreground text-sm">
          Erzähl etwas über dich <span className="text-muted-foreground/50">(optional)</span>
        </p>
      </div>

      <div>
        <Textarea
          placeholder="Was macht dich aus? Was suchst du? Worauf freust du dich?"
          value={bio}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              onUpdate({ bio: e.target.value });
            }
          }}
          className="bg-transparent border border-primary/30 focus:border-primary resize-none min-h-36"
        />
        <p className="text-xs text-muted-foreground/50 text-right mt-1">{bio.length}/500</p>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          Zurück
        </Button>
        <Button onClick={onNext} className="btn-premium">
          Weiter zur Vorschau
        </Button>
      </div>
    </div>
  );
}
