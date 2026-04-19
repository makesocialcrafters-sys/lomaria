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
      className={cn("rounded-full bg-skeleton overflow-hidden cursor-default", className)}
    >
      {signedUrl ? (
        <img
          src={signedUrl}
          alt={name || "Avatar"}
          className={cn("w-full h-full object-cover", imgClassName)}
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center text-muted-foreground font-display",
            fallbackClassName
          )}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
