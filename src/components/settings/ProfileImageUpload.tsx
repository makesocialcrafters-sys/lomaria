import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function ProfileImageUpload({ value, onChange }: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "h-24 w-24 rounded-full overflow-hidden border-2 border-primary",
          "flex items-center justify-center bg-secondary",
          "hover:opacity-80 transition-opacity cursor-pointer"
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profilbild"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-muted-foreground text-xs text-center px-2">
            Bild hochladen
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {preview && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            onChange(null);
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Bild entfernen
        </button>
      )}
    </div>
  );
}
