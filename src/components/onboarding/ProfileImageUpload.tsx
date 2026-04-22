import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog";
import { validateImageFile, readFileAsDataURL } from "@/lib/image-utils";

interface ProfileImageUploadProps {
  profileImage: string | null;
  onChange: (path: string | null) => void;
}

export function ProfileImageUpload({ profileImage, onChange }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate signed URL for preview when profileImage changes
  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }

    const getSignedUrl = async () => {
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

  // Check for existing avatar on mount if no profile image set
  useEffect(() => {
    if (!profileImage && user) {
      const checkExistingAvatar = async () => {
        const path = `${user.id}/avatar.jpg`;
        const { data } = await supabase.storage
          .from("avatars")
          .createSignedUrl(path, 3600);

        if (data?.signedUrl) {
          const img = new Image();
          img.onload = () => onChange(path);
          img.onerror = () => { /* no existing avatar */ };
          img.src = data.signedUrl;
        }
      };
      checkExistingAvatar();
    }
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = "";

    try {
      await validateImageFile(file);
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

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedBlob, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      onChange(filePath);

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

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="relative w-28 h-28 rounded-full bg-skeleton flex items-center justify-center overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors duration-150"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Profilbild" className="w-full h-full object-cover" />
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
        {profileImage ? "Tippen zum Ändern" : "Profilbild hochladen *"}
      </p>

      <ImageCropDialog
        imageSrc={selectedImageSrc}
        open={cropDialogOpen}
        onClose={() => {
          setCropDialogOpen(false);
          setSelectedImageSrc(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
