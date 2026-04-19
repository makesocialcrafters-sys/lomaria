import { cn } from "@/lib/utils";
import { useSignedAvatarUrl } from "@/hooks/useSignedAvatarUrl";

interface SignedAvatarProps {
  storagePath: string | null | undefined;
  name: string | null | undefined;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

const nonSelectableStyle = {
  userSelect: "none" as const,
  WebkitUserSelect: "none" as const,
  WebkitTouchCallout: "none" as const,
};

export function SignedAvatar({
  storagePath,
  name,
  className,
  imgClassName,
  fallbackClassName,
}: SignedAvatarProps) {
  const { data: signedUrl } = useSignedAvatarUrl(storagePath);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={nonSelectableStyle}
      className={cn("rounded-full bg-skeleton overflow-hidden cursor-default select-none", className)}
    >
      {signedUrl ? (
        <img
          src={signedUrl}
          alt={name || "Avatar"}
          style={nonSelectableStyle}
          className={cn("w-full h-full object-cover select-none", imgClassName)}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div
          style={nonSelectableStyle}
          className={cn(
            "w-full h-full flex items-center justify-center text-muted-foreground font-display select-none",
            fallbackClassName
          )}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
