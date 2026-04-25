import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FounderBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

/**
 * Goldenes "Gründer"-Badge im Wes-Anderson-Stil.
 * Wird angezeigt für User mit `is_founder = true`.
 */
export function FounderBadge({ size = "sm", className }: FounderBadgeProps) {
  const isMd = size === "md";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/15 text-primary font-display uppercase tracking-[0.15em]",
        isMd ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]",
        className,
      )}
      aria-label="Gründer"
      title="Gründer"
    >
      <Crown className={isMd ? "w-3.5 h-3.5" : "w-3 h-3"} strokeWidth={2.2} />
      <span>Gründer</span>
    </span>
  );
}
