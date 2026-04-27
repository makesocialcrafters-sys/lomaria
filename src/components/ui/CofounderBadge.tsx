import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CofounderBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

/**
 * "Mitgründer"-Badge im Wes-Anderson-Stil.
 * Wird angezeigt für User mit `is_cofounder = true`.
 */
export function CofounderBadge({ size = "sm", className }: CofounderBadgeProps) {
  const isMd = size === "md";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/15 text-accent font-display uppercase tracking-[0.15em]",
        isMd ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]",
        className,
      )}
      aria-label="Mitgründer"
      title="Mitgründer"
    >
      <Sparkles className={isMd ? "w-3.5 h-3.5" : "w-3 h-3"} strokeWidth={2.2} />
      <span>Mitgründer</span>
    </span>
  );
}
