import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingData, STUDY_PROGRAMS, GENDERS, INTENTS, INTERESTS } from "@/lib/onboarding-constants";

interface Step8Props {
  data: OnboardingData;
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
}

export function Step8Preview({ data, onBack, onSave, saving }: Step8Props) {
  const getLabel = (value: string | null, options: readonly { value: string; label: string }[]) =>
    options.find((o) => o.value === value)?.label ?? value;

  const getLabels = (values: string[], options: readonly { value: string; label: string }[]) =>
    values.map((v) => options.find((o) => o.value === v)?.label ?? v);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-primary mb-2">
          VORSCHAU
        </h2>
        <p className="text-muted-foreground text-sm">So sieht dein Profil aus</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border/50 rounded-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-skeleton overflow-hidden flex-shrink-0">
            {data.profile_image ? (
              <img
                src={data.profile_image}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">
              {data.first_name} {data.last_name}
              {data.age && <span className="font-normal text-muted-foreground">, {data.age}</span>}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getLabel(data.gender, GENDERS)}
            </p>
          </div>
        </div>

        {/* Study */}
        <div>
          <p className="text-sm text-primary font-medium">
            {getLabel(data.study_program, STUDY_PROGRAMS)}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.study_phase}
            {data.focus && <span> · {data.focus}</span>}
          </p>
        </div>

        {/* Intents */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Intents</p>
          <div className="flex flex-wrap gap-1.5">
            {getLabels(data.intents, INTENTS).map((label) => (
              <span
                key={label}
                className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Interessen</p>
          <div className="flex flex-wrap gap-1.5">
            {getLabels(data.interests, INTERESTS).map((label) => (
              <span
                key={label}
                className="px-2 py-1 text-xs bg-secondary text-secondary-foreground border border-border rounded"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Tutoring */}
        {data.tutoring_subject && (
          <div className="bg-primary/5 border border-primary/20 rounded p-3">
            <p className="text-xs text-primary uppercase tracking-wide mb-1">Nachhilfe</p>
            <p className="font-medium text-foreground">{data.tutoring_subject}</p>
            {data.tutoring_desc && (
              <p className="text-sm text-muted-foreground mt-1">{data.tutoring_desc}</p>
            )}
            {data.tutoring_price && (
              <p className="text-sm text-primary mt-1">{data.tutoring_price}€ / Stunde</p>
            )}
          </div>
        )}

        {/* Bio */}
        {data.bio && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Über mich</p>
            <p className="text-sm text-foreground">{data.bio}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 pt-2">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          Zurück
        </Button>
        <Button onClick={onSave} disabled={saving} className="btn-premium">
          {saving ? "Speichern..." : "Profil speichern & starten"}
        </Button>
      </div>
    </div>
  );
}
