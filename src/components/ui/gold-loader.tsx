import * as React from "react";
import { cn } from "@/lib/utils";

interface GoldLoaderProps {
  className?: string;
  isLoading?: boolean;
}

/**
 * Wes Anderson style gold progress loader
 * 2px thin gold line at the top of the screen
 */
const GoldLoader = React.forwardRef<HTMLDivElement, GoldLoaderProps>(
  ({ className, isLoading = true }, ref) => {
    if (!isLoading) return null;

    return (
      <div
        ref={ref}
        className={cn("fixed top-0 left-0 right-0 z-50 h-0.5 overflow-hidden", className)}
      >
        <div className="h-full w-full bg-primary/20">
          <div className="h-full bg-primary animate-loader" />
        </div>
      </div>
    );
  },
);
GoldLoader.displayName = "GoldLoader";

export { GoldLoader };