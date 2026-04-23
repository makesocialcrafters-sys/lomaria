import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FounderBadgeProps {
  className?: string;
  /** When true, only shows the crown icon (no label). */
  iconOnly?: boolean;
}

/**
 * Gold "Founder" badge — Lomaria design.
 * Uses the primary gold accent (#C6A94D) and Josefin Sans (font-display).
 */
export function FounderBadge({ className, iconOnly = false }: FounderBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-0.5 align-middle text-primary",
        className
      )}
      title="Gründer"
      aria-label="Gründer"
    >
      <Crown className="h-3 w-3" strokeWidth={2} />
      {!iconOnly && (
        <span className="font-display text-[10px] uppercase tracking-[0.15em] leading-none">
          Founder
        </span>
      )}
    </span>
  );
}
