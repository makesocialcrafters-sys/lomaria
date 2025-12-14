import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Step1Props {
  firstName: string;
  lastName: string;
  profileImage: string | null;
  onUpdate: (data: { first_name?: string; last_name?: string; profile_image?: string | null }) => void;
  onNext: () => void;
}

export function Step1Identity({ firstName, lastName, profileImage, onUpdate, onNext }: Step1Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Bitte wähle ein Bild aus", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Bild darf maximal 5MB groß sein", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      onUpdate({ profile_image: publicUrl.publicUrl });
    } catch (err) {
      console.error("Upload error:", err);
      toast({ title: "Fehler beim Hochladen", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-primary mb-2">
          BASISIDENTITÄT
        </h2>
        <p className="text-muted-foreground text-sm">Wie heißt du?</p>
      </div>

      {/* Profile Image */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative w-28 h-28 rounded-full bg-skeleton flex items-center justify-center overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors duration-150"
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profilbild"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-muted-foreground" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="h-0.5 w-12 bg-muted overflow-hidden rounded-full">
                <div className="h-full bg-primary animate-loader" />
              </div>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Name Fields */}
      <div className="space-y-4">
        <Input
          placeholder="Vorname"
          value={firstName}
          onChange={(e) => onUpdate({ first_name: e.target.value })}
          className="input-elegant"
        />
        <Input
          placeholder="Nachname"
          value={lastName}
          onChange={(e) => onUpdate({ last_name: e.target.value })}
          className="input-elegant"
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={onNext} disabled={!isValid} className="btn-premium">
          Weiter
        </Button>
      </div>
    </div>
  );
}
