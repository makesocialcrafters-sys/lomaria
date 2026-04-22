import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { useAppState } from "@/contexts/AppStateContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileImageUpload } from "@/components/onboarding/ProfileImageUpload";
import { ChipSelect } from "@/components/onboarding/ChipSelect";
import { IntentChipWithDetails } from "@/components/settings/IntentChipWithDetails";
import {
  GENDERS,
  STUDY_PROGRAMS,
  INTENTS,
  INTERESTS,
} from "@/lib/onboarding-constants";

const MIN_INTENTS = 1;
const MAX_INTENTS = 6;
const MIN_INTERESTS = 1;
const MAX_INTERESTS = 6;

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshOnboardingStatus } = useAppState();
  const { data, updateData, updateIntentDetails, clearData } = useOnboarding();
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const sectionRefs = {
    identity: useRef<HTMLElement>(null),
    study: useRef<HTMLElement>(null),
    intents: useRef<HTMLElement>(null),
    interests: useRef<HTMLElement>(null),
  };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!data.first_name.trim()) e.first_name = "Vorname erforderlich";
    if (!data.last_name.trim()) e.last_name = "Nachname erforderlich";
    if (!data.profile_image) e.profile_image = "Profilbild erforderlich";
    if (data.age === null || data.age < 16 || data.age > 100) e.age = "Alter zwischen 16 und 100";
    if (!data.gender) e.gender = "Geschlecht erforderlich";
    if (!data.study_program) e.study_program = "Hochschule erforderlich";
    if (!data.study_phase || !data.study_phase.trim()) e.study_phase = "Studienrichtung erforderlich";
    if (data.intents.length < MIN_INTENTS) e.intents = `Mindestens ${MIN_INTENTS} auswählen`;
    if (data.intents.includes("nachhilfe_anbieten") && !data.tutoring_subject.trim()) {
      e.tutoring_subject = "Fach erforderlich";
    }
    if (data.interests.length < MIN_INTERESTS) e.interests = `Mindestens ${MIN_INTERESTS} auswählen`;
    return e;
  }, [data]);

  const isValid = Object.keys(errors).length === 0;

  const handleLogout = async () => {
    localStorage.removeItem("lomaria_onboarding_draft");
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleAgeChange = (value: string) => {
    const parsed = parseInt(value, 10);
    updateData({ age: isNaN(parsed) ? null : parsed });
  };

  const handleIntentToggle = (intent: string, active: boolean) => {
    if (active) {
      if (data.intents.length >= MAX_INTENTS) {
        toast({ title: `Maximal ${MAX_INTENTS} Intents auswählbar.`, variant: "destructive" });
        return;
      }
      updateData({ intents: [...data.intents, intent] });
    } else {
      updateData({ intents: data.intents.filter((i) => i !== intent) });
      if (intent === "nachhilfe_anbieten") {
        updateData({
          tutoring_subject: "",
          tutoring_desc: "",
          tutoring_price: null,
        });
      }
    }
  };

  const scrollToFirstError = () => {
    if (errors.first_name || errors.last_name || errors.profile_image || errors.age || errors.gender) {
      sectionRefs.identity.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (errors.study_program || errors.study_phase) {
      sectionRefs.study.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (errors.intents || errors.tutoring_subject) {
      sectionRefs.intents.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (errors.interests) {
      sectionRefs.interests.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSave = async () => {
    setShowErrors(true);
    if (!isValid) {
      scrollToFirstError();
      toast({ title: "Bitte alle Pflichtfelder ausfüllen.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Nicht angemeldet", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        first_name: data.first_name,
        last_name: data.last_name,
        profile_image: data.profile_image,
        age: data.age,
        gender: data.gender,
        study_program: data.study_program,
        study_phase: data.study_phase,
        focus: data.study_phase === "cbk_hauptstudium" ? (data.focus || null) : null,
        intents: data.intents,
        interests: data.interests,
        tutoring_subject: data.tutoring_subject || null,
        tutoring_desc: data.tutoring_desc || null,
        tutoring_price: data.tutoring_price || null,
        bio: data.bio || null,
        intent_details: data.intent_details || {},
        last_active_at: new Date().toISOString(),
      };

      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      let saveError;
      if (existingUser) {
        const { error } = await supabase
          .from("users")
          .update(profileData)
          .eq("auth_user_id", user.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from("users")
          .insert({
            auth_user_id: user.id,
            email: user.email!,
            ...profileData,
          });
        saveError = error;
      }

      if (saveError) throw saveError;

      clearData();
      toast({ title: "Profil gespeichert!" });
      await refreshOnboardingStatus();
      navigate("/discover", { replace: true });
    } catch (err) {
      console.error("[Onboarding] Save error:", err);
      const message = err instanceof Error ? err.message : (err as any)?.message || "Unbekannter Fehler";
      toast({ title: "Fehler beim Speichern", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const SectionTitle = ({ number, title }: { number: string; title: string }) => (
    <div className="flex items-baseline gap-3 mb-6">
      <span className="font-display text-sm text-primary tracking-[0.2em]">{number}</span>
      <h2 className="font-display text-lg font-bold uppercase tracking-[0.15em] text-primary">
        {title}
      </h2>
    </div>
  );

  const ErrorMsg = ({ msg }: { msg?: string }) =>
    showErrors && msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null;

  return (
    <div className="min-h-screen bg-background px-6 py-8 animate-cinematic-enter relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Abmelden
      </Button>

      <div className="max-w-xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-primary">
            LOMARIA
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Erstelle dein Profil</p>
        </div>

        {/* Section 1: Identity */}
        <section ref={sectionRefs.identity} className="space-y-6 pt-6 border-t border-primary/20">
          <SectionTitle number="01" title="DU" />

          <ProfileImageUpload
            profileImage={data.profile_image}
            onChange={(path) => updateData({ profile_image: path })}
          />
          <ErrorMsg msg={errors.profile_image} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="Vorname *"
                value={data.first_name}
                onChange={(e) => updateData({ first_name: e.target.value })}
                className="input-elegant"
              />
              <ErrorMsg msg={errors.first_name} />
            </div>
            <div>
              <Input
                placeholder="Nachname *"
                value={data.last_name}
                onChange={(e) => updateData({ last_name: e.target.value })}
                className="input-elegant"
              />
              <ErrorMsg msg={errors.last_name} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Alter *</label>
              <Input
                type="number"
                placeholder="z.B. 21"
                value={data.age ?? ""}
                onChange={(e) => handleAgeChange(e.target.value)}
                min={16}
                max={100}
                className="input-elegant"
              />
              <ErrorMsg msg={errors.age} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Geschlecht *</label>
              <Select
                value={data.gender ?? ""}
                onValueChange={(v) => updateData({ gender: v })}
              >
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
              <ErrorMsg msg={errors.gender} />
            </div>
          </div>
        </section>

        {/* Section 2: Study */}
        <section ref={sectionRefs.study} className="space-y-6 pt-8 border-t border-primary/20">
          <SectionTitle number="02" title="STUDIUM" />

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Hochschule *</label>
            <Select
              value={data.study_program ?? ""}
              onValueChange={(v) => updateData({ study_program: v })}
            >
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
            <ErrorMsg msg={errors.study_program} />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Studienrichtung *</label>
            <Input
              placeholder="z.B. Informatik, BWL, Jus..."
              value={data.study_phase ?? ""}
              onChange={(e) => updateData({ study_phase: e.target.value })}
              className="input-elegant"
            />
            <ErrorMsg msg={errors.study_phase} />
          </div>
        </section>

        {/* Section 3: Intents */}
        <section ref={sectionRefs.intents} className="space-y-4 pt-8 border-t border-primary/20">
          <SectionTitle number="03" title="WAS SUCHST DU?" />
          <p className="text-xs text-muted-foreground -mt-4">
            Mindestens {MIN_INTENTS}, maximal {MAX_INTENTS} ({data.intents.length}/{MAX_INTENTS})
          </p>

          <div className="space-y-2">
            {INTENTS.map((intent) => (
              <IntentChipWithDetails
                key={intent.value}
                intent={intent.value}
                isActive={data.intents.includes(intent.value)}
                intentDetails={data.intent_details}
                tutoringData={{
                  tutoring_subject: data.tutoring_subject,
                  tutoring_desc: data.tutoring_desc,
                  tutoring_price: data.tutoring_price,
                }}
                onToggle={handleIntentToggle}
                onDetailChange={(intentKey, field, value) =>
                  updateIntentDetails(intentKey, field, value)
                }
                onTutoringChange={(t) =>
                  updateData({
                    tutoring_subject: t.tutoring_subject ?? data.tutoring_subject,
                    tutoring_desc: t.tutoring_desc ?? data.tutoring_desc,
                    tutoring_price:
                      t.tutoring_price !== undefined ? t.tutoring_price : data.tutoring_price,
                  })
                }
                tutoringError={
                  intent.value === "nachhilfe_anbieten" && showErrors
                    ? errors.tutoring_subject
                    : undefined
                }
              />
            ))}
          </div>
          <ErrorMsg msg={errors.intents} />
        </section>

        {/* Section 4: Interests */}
        <section ref={sectionRefs.interests} className="space-y-4 pt-8 border-t border-primary/20">
          <SectionTitle number="04" title="INTERESSEN" />
          <p className="text-xs text-muted-foreground -mt-4">
            Mindestens {MIN_INTERESTS}, maximal {MAX_INTERESTS} ({data.interests.length}/
            {MAX_INTERESTS})
          </p>

          <ChipSelect
            options={INTERESTS}
            selected={data.interests}
            onChange={(selected) => updateData({ interests: selected })}
            minSelect={MIN_INTERESTS}
            maxSelect={MAX_INTERESTS}
            onMaxExceeded={() =>
              toast({
                title: `Maximal ${MAX_INTERESTS} Interessen auswählbar.`,
                variant: "destructive",
              })
            }
          />
          <ErrorMsg msg={errors.interests} />
        </section>

        {/* Section 5: Bio (optional) */}
        <section className="space-y-4 pt-8 border-t border-primary/20">
          <SectionTitle number="05" title="ÜBER DICH" />
          <p className="text-xs text-muted-foreground -mt-4">Optional</p>

          <div>
            <Textarea
              placeholder="Was macht dich aus? Was suchst du? Worauf freust du dich?"
              value={data.bio}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  updateData({ bio: e.target.value });
                }
              }}
              className="bg-transparent border border-primary/30 focus:border-primary resize-none min-h-32"
            />
            <p className="text-xs text-muted-foreground/50 text-right mt-1">
              {data.bio.length}/500
            </p>
          </div>
        </section>

        {/* Submit */}
        <div className="flex flex-col items-center gap-3 pt-8 pb-4 border-t border-primary/20">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-premium min-w-48"
          >
            {saving ? "Speichern..." : "Profil erstellen"}
          </Button>
          {showErrors && !isValid && (
            <p className="text-xs text-destructive">
              Bitte fülle alle Pflichtfelder aus.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
