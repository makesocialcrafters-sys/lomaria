import * as React from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
  className?: string;
  variant?: "default" | "subtle";
}

/**
 * Wes Anderson style gold horizontal divider
 * Used to separate content sections like film chapters
 */
const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, variant = "default" }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full h-px",
          variant === "default" ? "bg-primary/40" : "bg-border/50",
          className,
        )}
      />
    );
  },
);
Divider.displayName = "Divider";

export { Divider };