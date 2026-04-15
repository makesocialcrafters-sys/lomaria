import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog";
import { validateImageFile, readFileAsDataURL } from "@/lib/image-utils";

interface ProfileImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  userId: string;
}

export function ProfileImageUpload({ value, onChange, userId }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Generate signed URL for preview when value changes
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const getSignedUrl = async () => {
      let path = value;
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
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    setCropDialogOpen(false);
    setUploading(true);

    try {
      const filePath = `${userId}/avatar.jpg`;

      // Upload to Supabase storage (upsert)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedBlob, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      // Store relative path only
      onChange(filePath);

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

  const handleRemoveImage = () => {
    onChange(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "h-24 w-24 rounded-full overflow-hidden border-2 border-primary/30",
          "flex items-center justify-center bg-secondary",
          "hover:border-primary transition-colors duration-150 cursor-pointer",
          uploading && "opacity-50"
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profilbild"
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="w-10 h-10 text-muted-foreground" />
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
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />
      <p className="text-xs text-muted-foreground">
        {uploading ? "Wird hochgeladen..." : "Tippen zum Ändern"}
      </p>
      {value && !uploading && (
        <button
          type="button"
          onClick={handleRemoveImage}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Bild entfernen
        </button>
      )}

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
