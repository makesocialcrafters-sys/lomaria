import * as React from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wes Anderson style page transition wrapper
 * Provides cinematic fade + slide animation on mount
 */
const PageTransition = React.forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-page-enter", className)}
      >
        {children}
      </div>
    );
  },
);
PageTransition.displayName = "PageTransition";

export { PageTransition };