import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog";
import { validateImageFile, readFileAsDataURL } from "@/lib/image-utils";

interface Step1Props {
  firstName: string;
  lastName: string;
  profileImage: string | null;
  onUpdate: (data: { first_name?: string; last_name?: string; profile_image?: string | null }) => void;
  onNext: () => void;
}

export function Step1Identity({ firstName, lastName, profileImage, onUpdate, onNext }: Step1Props) {
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Profile image is REQUIRED, last name is optional
  const isValid = firstName.trim().length > 0 && !!profileImage;

  // Generate signed URL for preview when profileImage changes
  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }

    const getSignedUrl = async () => {
      // Extract path from full URL or use as-is
      let path = profileImage;
      if (path.startsWith("http")) {
        const marker = "/avatars/";
        const idx = path.indexOf(marker);
        if (idx !== -1) {
          path = path.substring(idx + marker.length).split("?")[0];
        } else {
          setPreviewUrl(null);
          return;
        }
      } else {
        path = path.split("?")[0];
      }

      const { data } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 3600);

      if (data?.signedUrl) {
        setPreviewUrl(data.signedUrl);
      }
    };

    getSignedUrl();
  }, [profileImage]);

  // Check for existing avatar on mount if no profile image in state
  useEffect(() => {
    if (!profileImage && user) {
      const checkExistingAvatar = async () => {
        const path = `${user.id}/avatar.jpg`;
        const { data } = await supabase.storage
          .from("avatars")
          .createSignedUrl(path, 3600);
        
        if (data?.signedUrl) {
          // Verify the image actually exists by loading it
          const img = new Image();
          img.onload = () => {
            onUpdate({ profile_image: path });
          };
          img.onerror = () => {
            // No existing avatar, do nothing
          };
          img.src = data.signedUrl;
        }
      };
      checkExistingAvatar();
    }
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Reset input so same file can be selected again
    e.target.value = "";

    try {
      // Validate file (type, size, resolution)
      await validateImageFile(file);

      // Read file as data URL for cropping
      const dataUrl = await readFileAsDataURL(file);
      setSelectedImageSrc(dataUrl);
      setCropDialogOpen(true);
    } catch (err) {
      toast({
        title: "Ungültiges Bild",
        description: err instanceof Error ? err.message : "Bild konnte nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user) return;

    setCropDialogOpen(false);
    setUploading(true);

    try {
      const filePath = `${user.id}/avatar.jpg`;

      // Upload to Supabase storage (upsert)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedBlob, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      // Store relative path only
      onUpdate({ profile_image: filePath });

      // Get signed URL for immediate preview
      const { data: signedData } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 3600);

      if (signedData?.signedUrl) {
        setPreviewUrl(signedData.signedUrl);
      }

      toast({
        title: "Bild hochgeladen",
        description: "Dein Profilbild wurde gespeichert",
      });
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Fehler beim Hochladen",
        description: err instanceof Error ? err.message : "Bild konnte nicht hochgeladen werden",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setSelectedImageSrc(null);
    }
  };

  const handleCropDialogClose = () => {
    setCropDialogOpen(false);
    setSelectedImageSrc(null);
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
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative w-28 h-28 rounded-full bg-skeleton flex items-center justify-center overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors duration-150"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
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
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">
          {profileImage ? "Tippen zum Ändern" : <>Profilbild hochladen <span className="text-primary">*</span></>}
        </p>
      </div>

      {/* Name Fields */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Vorname <span className="text-primary">*</span>
          </label>
          <Input
            placeholder="Vorname"
            value={firstName}
            onChange={(e) => onUpdate({ first_name: e.target.value })}
            className="input-elegant"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Nachname</label>
          <Input
            placeholder="Nachname (optional)"
            value={lastName}
            onChange={(e) => onUpdate({ last_name: e.target.value })}
            className="input-elegant"
          />
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={onNext} disabled={!isValid} className="btn-premium">
          Weiter
        </Button>
      </div>

      {/* Crop Dialog */}
      <ImageCropDialog
        imageSrc={selectedImageSrc}
        open={cropDialogOpen}
        onClose={handleCropDialogClose}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
