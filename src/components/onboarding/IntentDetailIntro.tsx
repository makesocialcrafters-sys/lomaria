import { Button } from "@/components/ui/button";

interface IntentDetailIntroProps {
  onProceed: () => void;
  onSkip: () => void;
}

export function IntentDetailIntro({ onProceed, onSkip }: IntentDetailIntroProps) {
  return (
    <div className="animate-fade-in space-y-8 text-center">
      <div className="space-y-4 pt-8">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-primary">
          NOCH GENAUER?
        </h2>
        
        <p className="text-foreground text-base leading-relaxed max-w-xs mx-auto">
          Willst du kurz auswählen, was du genau suchst?
        </p>
        
        <p className="text-muted-foreground text-sm">
          Das hilft anderen, dich schneller zu finden.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 pt-4">
        <Button 
          onClick={onProceed} 
          className="btn-premium w-[85%]"
        >
          Kurz auswählen
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Später
        </Button>
      </div>

      <p className="text-xs text-muted-foreground/70 pt-4">
        Du kannst das jederzeit ändern.
      </p>
    </div>
  );
}
