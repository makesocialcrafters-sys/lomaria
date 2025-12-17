import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileImageUpload } from "./ProfileImageUpload";
import { MultiSelectChips } from "./MultiSelectChips";
import {
  GENDERS,
  INTENTS,
  INTERESTS,
  STUDY_PHASES,
  STUDY_PROGRAMS,
  TUTORING_SUGGESTIONS,
} from "@/lib/constants";
import type { ProfileFormData } from "@/types/user";
import type { Gender, Intent, Interest, StudyPhase, StudyProgram } from "@/lib/constants";

interface EditProfileFormProps {
  initialData: ProfileFormData;
  onSave: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditProfileForm({
  initialData,
  onSave,
  onCancel,
  isLoading,
}: EditProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showSchwerpunkt = formData.study_phase === "cbk_hauptstudium";

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Vorname ist erforderlich";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Nachname ist erforderlich";
    }
    if (formData.age !== null) {
      if (formData.age < 16 || formData.age > 100) {
        newErrors.age = "Alter muss zwischen 16 und 100 liegen";
      }
    }
    if (formData.intents.length < 3) {
      newErrors.intents = "Mindestens 3 Intents auswählen";
    }
    if (formData.intents.length > 6) {
      newErrors.intents = "Maximal 6 Intents auswählbar";
    }
    if (formData.interests.length < 3) {
      newErrors.interests = "Mindestens 3 Interessen auswählen";
    }
    if (formData.interests.length > 6) {
      newErrors.interests = "Maximal 6 Interessen auswählbar";
    }
    if (formData.bio.length > 500) {
      newErrors.bio = "Bio darf maximal 500 Zeichen haben";
    }
    if (formData.tutoring_desc.length > 300) {
      newErrors.tutoring_desc = "Beschreibung darf maximal 300 Zeichen haben";
    }
    if (formData.tutoring_price !== null && formData.tutoring_price <= 0) {
      newErrors.tutoring_price = "Preis muss größer als 0 sein";
    }

    // If tutoring intent is selected, tutoring_subject is required
    if (formData.intents.includes("nachhilfe_anbieten") && !formData.tutoring_subject.trim()) {
      newErrors.tutoring_subject = "Fach ist erforderlich wenn du Nachhilfe anbietest";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Clear focus if not in CBK/Hauptstudium
      const dataToSave = {
        ...formData,
        focus: showSchwerpunkt ? formData.focus : "",
      };
      await onSave(dataToSave);
    }
  };

  const handleStudyPhaseChange = (value: string) => {
    // Clear focus when switching to STEOP
    if (value === "steop") {
      setFormData((prev) => ({ ...prev, study_phase: value as StudyPhase, focus: "" }));
    } else {
      setFormData((prev) => ({ ...prev, study_phase: value as StudyPhase }));
    }
  };

  const showTutoringSection = formData.intents.includes("nachhilfe_anbieten");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image */}
      <div className="space-y-2">
        <Label>Profilbild</Label>
        <ProfileImageUpload
          value={formData.profile_image}
          onChange={(url) => setFormData((prev) => ({ ...prev, profile_image: url }))}
        />
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Vorname *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
            className={errors.first_name ? "border-destructive" : ""}
          />
          {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nachname *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
            className={errors.last_name ? "border-destructive" : ""}
          />
          {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Alter</Label>
          <Input
            id="age"
            type="number"
            min={16}
            max={100}
            value={formData.age ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                age: e.target.value ? parseInt(e.target.value) : null,
              }))
            }
            className={errors.age ? "border-destructive" : ""}
          />
          {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Geschlecht</Label>
          <Select
            value={formData.gender ?? ""}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, gender: value as Gender }))
            }
          >
            <SelectTrigger>
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
      </div>

      {/* Study Info */}
      <div className="space-y-2">
        <Label htmlFor="study_program">Studiengang</Label>
        <Select
          value={formData.study_program ?? ""}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, study_program: value as StudyProgram }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Studiengang auswählen" />
          </SelectTrigger>
          <SelectContent>
            {STUDY_PROGRAMS.map((sp) => (
              <SelectItem key={sp.value} value={sp.value}>
                {sp.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="study_phase">Studienphase</Label>
          <Select
            value={formData.study_phase ?? ""}
            onValueChange={handleStudyPhaseChange}
          >
            <SelectTrigger>
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
        {showSchwerpunkt && (
          <div className="space-y-2">
            <Label htmlFor="focus">Schwerpunkt (optional)</Label>
            <Input
              id="focus"
              value={formData.focus}
              onChange={(e) => setFormData((prev) => ({ ...prev, focus: e.target.value }))}
              placeholder="z.B. Finance"
            />
          </div>
        )}
      </div>

      {/* Intents */}
      <div className="space-y-2">
        <Label>Intents *</Label>
        <MultiSelectChips
          options={INTENTS}
          selected={formData.intents}
          onChange={(selected) =>
            setFormData((prev) => ({ ...prev, intents: selected as Intent[] }))
          }
          minSelect={3}
          maxSelect={6}
          error={errors.intents}
        />
      </div>

      {/* Interests */}
      <div className="space-y-2">
        <Label>Interessen *</Label>
        <MultiSelectChips
          options={INTERESTS}
          selected={formData.interests}
          onChange={(selected) =>
            setFormData((prev) => ({ ...prev, interests: selected as Interest[] }))
          }
          minSelect={3}
          maxSelect={6}
          error={errors.interests}
        />
      </div>

      {/* Tutoring Section - Conditional */}
      {showTutoringSection && (
        <div className="space-y-4 rounded-md border border-border p-4">
          <h3 className="font-medium text-primary">Nachhilfe</h3>
          <div className="space-y-2">
            <Label htmlFor="tutoring_subject">Fach *</Label>
            <Input
              id="tutoring_subject"
              value={formData.tutoring_subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tutoring_subject: e.target.value }))
              }
              list="tutoring-suggestions"
              className={errors.tutoring_subject ? "border-destructive" : ""}
            />
            <datalist id="tutoring-suggestions">
              {TUTORING_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {errors.tutoring_subject && (
              <p className="text-sm text-destructive">{errors.tutoring_subject}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutoring_desc">Beschreibung (optional)</Label>
            <Textarea
              id="tutoring_desc"
              value={formData.tutoring_desc}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tutoring_desc: e.target.value }))
              }
              maxLength={300}
              rows={3}
              className={errors.tutoring_desc ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              {formData.tutoring_desc.length} / 300 Zeichen
            </p>
            {errors.tutoring_desc && (
              <p className="text-sm text-destructive">{errors.tutoring_desc}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutoring_price">Stundensatz (€, optional)</Label>
            <Input
              id="tutoring_price"
              type="number"
              min={1}
              value={formData.tutoring_price ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tutoring_price: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
              className={errors.tutoring_price ? "border-destructive" : ""}
            />
            {errors.tutoring_price && (
              <p className="text-sm text-destructive">{errors.tutoring_price}</p>
            )}
          </div>
        </div>
      )}

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Kurz-Bio (optional)</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
          maxLength={500}
          rows={4}
          placeholder="Woran arbeitest du gerade? Was suchst du auf Lomaria?"
          className={errors.bio ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground">{formData.bio.length} / 500 Zeichen</p>
        {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Speichern..." : "Speichern"}
        </Button>
      </div>
    </form>
  );
}
